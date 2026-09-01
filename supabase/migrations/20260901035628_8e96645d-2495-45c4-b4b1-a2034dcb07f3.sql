-- 1) Hide created_by from public readers on aom_analyses (column-level grants)
REVOKE SELECT ON public.aom_analyses FROM anon, authenticated;
GRANT SELECT (id, item_type, item_id, item_title, department, analysis, model, created_at)
  ON public.aom_analyses TO anon, authenticated;
GRANT INSERT ON public.aom_analyses TO authenticated;
GRANT ALL ON public.aom_analyses TO service_role;

-- 2) Explicit owner-scoped update/delete rules for submissions
CREATE POLICY "Authors can update their own submissions"
  ON public.aom_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete their own submissions"
  ON public.aom_submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT UPDATE, DELETE ON public.aom_submissions TO authenticated;
GRANT ALL ON public.aom_submissions TO service_role;