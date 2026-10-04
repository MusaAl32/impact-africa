CREATE OR REPLACE FUNCTION public.consume_guest_message(_identity_hash text, _limit integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _identity_hash IS NULL OR char_length(_identity_hash) <> 64 OR _limit < 1 OR _limit > 20 THEN
    RAISE EXCEPTION 'Invalid guest quota request';
  END IF;
  INSERT INTO public.guest_usage (identity_hash, day, message_count)
  VALUES (_identity_hash, (now() AT TIME ZONE 'utc')::date, 1)
  ON CONFLICT (identity_hash, day)
  DO UPDATE SET message_count = public.guest_usage.message_count + 1, updated_at = now()
  RETURNING message_count INTO current_count;
  RETURN jsonb_build_object(
    'allowed', current_count <= _limit,
    'used', LEAST(current_count, _limit),
    'remaining', GREATEST(_limit - current_count, 0),
    'limit', _limit,
    'resets_at', ((now() AT TIME ZONE 'utc')::date + 1)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.consume_guest_message(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_guest_message(text, integer) TO service_role;