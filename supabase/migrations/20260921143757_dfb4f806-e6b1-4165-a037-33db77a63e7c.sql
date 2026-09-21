DROP FUNCTION IF EXISTS public.get_entitlements();
DROP FUNCTION IF EXISTS public.consume_quota(text, integer);

CREATE OR REPLACE FUNCTION public.get_entitlements(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan public.plans;
BEGIN
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO plan FROM public.current_plan(_user_id);
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
        WHERE user_id = _user_id AND day = (now() AT TIME ZONE 'utc')::date
        GROUP BY kind
      ) t
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_quota(_user_id uuid, _kind text, _quantity integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan public.plans;
  allowance integer;
  used integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _kind NOT IN ('message', 'voice_minute', 'file', 'search') THEN
    RAISE EXCEPTION 'Unknown usage kind';
  END IF;
  IF _quantity IS NULL OR _quantity < 1 OR _quantity > 600 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT * INTO plan FROM public.current_plan(_user_id);
  allowance := CASE _kind
    WHEN 'message' THEN plan.messages_per_day
    WHEN 'voice_minute' THEN plan.voice_minutes_per_day
    WHEN 'file' THEN plan.files_per_day
    ELSE plan.searches_per_day
  END;

  SELECT COALESCE(SUM(quantity), 0)::int INTO used
  FROM public.usage_events
  WHERE user_id = _user_id AND day = (now() AT TIME ZONE 'utc')::date AND kind = _kind;

  IF used + _quantity > allowance THEN
    RETURN jsonb_build_object(
      'allowed', false, 'kind', _kind, 'limit', allowance, 'used', used,
      'remaining', GREATEST(allowance - used, 0),
      'plan_slug', plan.slug, 'plan_name', plan.name,
      'resets_at', ((now() AT TIME ZONE 'utc')::date + 1)
    );
  END IF;

  INSERT INTO public.usage_events (user_id, kind, quantity) VALUES (_user_id, _kind, _quantity);

  RETURN jsonb_build_object(
    'allowed', true, 'kind', _kind, 'limit', allowance, 'used', used + _quantity,
    'remaining', allowance - used - _quantity,
    'plan_slug', plan.slug, 'plan_name', plan.name,
    'resets_at', ((now() AT TIME ZONE 'utc')::date + 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.current_plan(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_entitlements(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_quota(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_plan(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_entitlements(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_quota(uuid, text, integer) TO service_role;