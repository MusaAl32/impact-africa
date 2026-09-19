-- aom_analyses: no longer world-readable; authenticated only, creator always recorded
DROP POLICY IF EXISTS "Analyses are publicly readable" ON public.aom_analyses;
DROP POLICY IF EXISTS "Signed-in users can save analyses" ON public.aom_analyses;
DROP POLICY IF EXISTS "Users can read their own analyses" ON public.aom_analyses;

REVOKE ALL ON public.aom_analyses FROM anon;
REVOKE ALL ON public.aom_analyses FROM authenticated;
GRANT SELECT (id, item_type, item_id, item_title, department, analysis, model, created_at) ON public.aom_analyses TO authenticated;
GRANT INSERT ON public.aom_analyses TO authenticated;
GRANT ALL ON public.aom_analyses TO service_role;

CREATE POLICY "Signed-in users can read analyses"
  ON public.aom_analyses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Signed-in users can save their own analyses"
  ON public.aom_analyses FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- aom_submissions: contact emails never readable by anonymous callers
REVOKE ALL ON public.aom_submissions FROM anon;
GRANT INSERT ON public.aom_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aom_submissions TO authenticated;
GRANT ALL ON public.aom_submissions TO service_role;

DROP POLICY IF EXISTS "Authors can read their own submissions" ON public.aom_submissions;
CREATE POLICY "Authors can read their own submissions"
  ON public.aom_submissions FOR SELECT TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update their own submissions" ON public.aom_submissions;
CREATE POLICY "Authors can update their own submissions"
  ON public.aom_submissions FOR UPDATE TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete their own submissions" ON public.aom_submissions;
CREATE POLICY "Authors can delete their own submissions"
  ON public.aom_submissions FOR DELETE TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id);