-- 1. aom_analyses: hide created_by from public/authenticated readers
REVOKE SELECT ON public.aom_analyses FROM anon, authenticated;
GRANT SELECT (id, item_type, item_id, item_title, department, analysis, model, created_at)
  ON public.aom_analyses TO anon, authenticated;
GRANT INSERT ON public.aom_analyses TO authenticated;
GRANT ALL ON public.aom_analyses TO service_role;

DROP POLICY IF EXISTS "Analyses are publicly readable" ON public.aom_analyses;
CREATE POLICY "Analyses are publicly readable"
  ON public.aom_analyses FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Signed-in users can save analyses" ON public.aom_analyses;
CREATE POLICY "Signed-in users can save analyses"
  ON public.aom_analyses FOR INSERT TO authenticated
  WITH CHECK (created_by IS NULL OR created_by = auth.uid());

-- 2. aom_submissions: system controls status/ai_summary/user_id for non-service callers
CREATE OR REPLACE FUNCTION public.aom_submissions_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) IS DISTINCT FROM 'service_role'
     AND current_user IS DISTINCT FROM 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
      NEW.ai_summary := NULL;
      NEW.user_id := auth.uid();
    ELSE
      NEW.status := OLD.status;
      NEW.ai_summary := OLD.ai_summary;
      NEW.user_id := OLD.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.aom_submissions_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS aom_submissions_guard_ins ON public.aom_submissions;
CREATE TRIGGER aom_submissions_guard_ins
  BEFORE INSERT OR UPDATE ON public.aom_submissions
  FOR EACH ROW EXECUTE FUNCTION public.aom_submissions_guard();