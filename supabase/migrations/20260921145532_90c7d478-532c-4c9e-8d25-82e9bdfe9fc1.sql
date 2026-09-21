CREATE OR REPLACE FUNCTION public.current_plan(_user_id uuid)
RETURNS plans
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.*
  FROM public.plans p
  WHERE p.slug = COALESCE(
    (SELECT s.plan_slug FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND (
          (s.status IN ('active', 'trialing')
            AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'canceled'
            AND s.current_period_end IS NOT NULL
            AND s.current_period_end > now())
        )
      LIMIT 1),
    'free'
  )
$function$;

REVOKE EXECUTE ON FUNCTION public.current_plan(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_plan(uuid) TO service_role;