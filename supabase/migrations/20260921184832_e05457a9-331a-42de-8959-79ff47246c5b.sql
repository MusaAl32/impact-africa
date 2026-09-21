CREATE OR REPLACE FUNCTION public.aom_submissions_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('role', true) IS DISTINCT FROM 'service_role'
     AND current_user IS DISTINCT FROM 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
      NEW.ai_summary := NULL;
      NEW.user_id := auth.uid();
      IF NEW.user_id IS NULL THEN
        RAISE EXCEPTION 'submissions must belong to a signed-in user';
      END IF;
    ELSE
      NEW.status := OLD.status;
      NEW.ai_summary := OLD.ai_summary;
      NEW.user_id := OLD.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;