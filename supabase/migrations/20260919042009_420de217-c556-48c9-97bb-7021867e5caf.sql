-- 1) Private schema for internal helpers (not exposed via the Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2) Recreate the role-check helper in the private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3) Recreate every policy that referenced public.has_role to use private.has_role
DROP POLICY IF EXISTS "Admins manage problems" ON public.aom_problems;
CREATE POLICY "Admins manage problems" ON public.aom_problems
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage research" ON public.aom_research;
CREATE POLICY "Admins manage research" ON public.aom_research
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins read submissions" ON public.aom_submissions;
CREATE POLICY "Admins read submissions" ON public.aom_submissions
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update submissions" ON public.aom_submissions;
CREATE POLICY "Admins update submissions" ON public.aom_submissions
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete submissions" ON public.aom_submissions;
CREATE POLICY "Admins delete submissions" ON public.aom_submissions
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage agent access" ON public.mcp_access;
CREATE POLICY "Admins manage agent access" ON public.mcp_access
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- 4) Drop the old public-schema role-check helper entirely
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5) aom_analyses: remove the broad "any signed-in user reads everything" policy
DROP POLICY IF EXISTS "Signed-in users can read analyses" ON public.aom_analyses;
CREATE POLICY "Users read their own analyses" ON public.aom_analyses
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "Admins read all analyses" ON public.aom_analyses
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- 6) aom_submissions: explicitly confirm no anonymous read path exists
REVOKE SELECT ON public.aom_submissions FROM anon;