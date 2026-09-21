DROP POLICY IF EXISTS "Anyone can submit a problem" ON public.aom_submissions;

REVOKE INSERT ON public.aom_submissions FROM anon;
REVOKE INSERT ON public.aom_submissions FROM authenticated;

CREATE POLICY "Signed-in authors submit their own problems"
  ON public.aom_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());