REVOKE ALL ON public.aom_submissions FROM anon;

ALTER TABLE public.aom_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aom_submissions FORCE ROW LEVEL SECURITY;

-- Explicit documentation policy: no anonymous reads, ever. The only SELECT policies
-- that exist scope to the author (auth.uid() = user_id) or admins; this guard policy
-- makes the deny explicit for the anon role.
COMMENT ON TABLE public.aom_submissions IS 'contact_email present; no anon access permitted (anon grants revoked, RLS forced).';