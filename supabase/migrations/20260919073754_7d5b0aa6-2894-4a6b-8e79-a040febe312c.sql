-- Restore the owner-scoped access that the existing policies on aom_analyses already describe.
GRANT SELECT, INSERT ON public.aom_analyses TO authenticated;
GRANT ALL ON public.aom_analyses TO service_role;

-- Least privilege: signed-out visitors have no policies on these private tables,
-- so remove their table-level privileges too.
REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.profiles TO service_role;