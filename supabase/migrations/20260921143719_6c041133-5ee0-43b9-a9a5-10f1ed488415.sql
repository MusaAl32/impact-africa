CREATE TABLE public.plans (
  slug text PRIMARY KEY,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  messages_per_day integer NOT NULL DEFAULT 20,
  voice_minutes_per_day integer NOT NULL DEFAULT 10,
  files_per_day integer NOT NULL DEFAULT 3,
  searches_per_day integer NOT NULL DEFAULT 5,
  provider_price_id text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable" ON public.plans
  FOR SELECT TO anon, authenticated USING (active);

CREATE POLICY "Admins manage plans" ON public.plans
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plans (slug, name, price_cents, messages_per_day, voice_minutes_per_day, files_per_day, searches_per_day, sort_order) VALUES
  ('free', 'Free', 0, 20, 10, 3, 5, 1),
  ('pro', 'Nuru AI Pro', 1000, 200, 60, 20, 50, 2),
  ('pro_plus', 'Nuru AI Pro Plus', 1500, 400, 120, 40, 100, 3),
  ('pro_max', 'Nuru AI Pro Max', 2000, 600, 180, 60, 150, 4);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_slug text NOT NULL REFERENCES public.plans(slug),
  status text NOT NULL DEFAULT 'active',
  provider text NOT NULL DEFAULT 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('message', 'voice_minute', 'file', 'search')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX usage_events_user_day_kind_idx ON public.usage_events (user_id, day, kind);

GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own usage" ON public.usage_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.current_plan(_user_id uuid)
RETURNS public.plans
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.*
  FROM public.plans p
  WHERE p.slug = COALESCE(
    (SELECT s.plan_slug FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.status IN ('active', 'trialing')
        AND (s.current_period_end IS NULL OR s.current_period_end > now())
      LIMIT 1),
    'free'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_entitlements()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  plan public.plans;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO plan FROM public.current_plan(uid);
  RETURN jsonb_build_object(
    'plan_slug', plan.slug,
    'plan_name', plan.name,
    'price_cents', plan.price_cents,
    'resets_at', ((now() AT TIME ZONE 'utc')::date + 1),
    'limits', jsonb_build_object(
      'message', plan.messages_per_day,
      'voice_minute', plan.voice_minutes_per_day,
      'file', plan.files_per_day,
      'search', plan.searches_per_day
    ),
    'used', (
      SELECT COALESCE(jsonb_object_agg(kind, total), '{}'::jsonb) FROM (
        SELECT kind, SUM(quantity)::int AS total
        FROM public.usage_events
        WHERE user_id = uid AND day = (now() AT TIME ZONE 'utc')::date
        GROUP BY kind
      ) t
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_quota(_kind text, _quantity integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  plan public.plans;
  allowance integer;
  used integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _kind NOT IN ('message', 'voice_minute', 'file', 'search') THEN
    RAISE EXCEPTION 'Unknown usage kind';
  END IF;
  IF _quantity IS NULL OR _quantity < 1 OR _quantity > 600 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT * INTO plan FROM public.current_plan(uid);
  allowance := CASE _kind
    WHEN 'message' THEN plan.messages_per_day
    WHEN 'voice_minute' THEN plan.voice_minutes_per_day
    WHEN 'file' THEN plan.files_per_day
    ELSE plan.searches_per_day
  END;

  SELECT COALESCE(SUM(quantity), 0)::int INTO used
  FROM public.usage_events
  WHERE user_id = uid AND day = (now() AT TIME ZONE 'utc')::date AND kind = _kind;

  IF used + _quantity > allowance THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'kind', _kind,
      'limit', allowance,
      'used', used,
      'remaining', GREATEST(allowance - used, 0),
      'plan_slug', plan.slug,
      'plan_name', plan.name,
      'resets_at', ((now() AT TIME ZONE 'utc')::date + 1)
    );
  END IF;

  INSERT INTO public.usage_events (user_id, kind, quantity) VALUES (uid, _kind, _quantity);

  RETURN jsonb_build_object(
    'allowed', true,
    'kind', _kind,
    'limit', allowance,
    'used', used + _quantity,
    'remaining', allowance - used - _quantity,
    'plan_slug', plan.slug,
    'plan_name', plan.name,
    'resets_at', ((now() AT TIME ZONE 'utc')::date + 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.current_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_plan(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_entitlements() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.consume_quota(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_quota(text, integer) TO authenticated, service_role;