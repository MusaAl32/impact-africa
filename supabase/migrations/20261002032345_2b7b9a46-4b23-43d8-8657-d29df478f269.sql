CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  instructions text NOT NULL DEFAULT '' CHECK (char_length(instructions) <= 8000),
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their projects" ON public.projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX projects_user_updated_idx ON public.projects (user_id, updated_at DESC);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_conversations (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, conversation_id)
);
GRANT SELECT, INSERT, DELETE ON public.project_conversations TO authenticated;
GRANT ALL ON public.project_conversations TO service_role;
ALTER TABLE public.project_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage project conversations" ON public.project_conversations FOR ALL TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE INDEX project_conversations_user_idx ON public.project_conversations (user_id, created_at DESC);

CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL CHECK (char_length(btrim(file_name)) BETWEEN 1 AND 200),
  mime_type text NOT NULL CHECK (mime_type IN ('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','image/jpeg','image/png','image/webp')),
  size_bytes bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 10485760),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploading','uploaded','processing','ready','failed')),
  extracted_text text NOT NULL DEFAULT '' CHECK (char_length(extracted_text) <= 100000),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage project files" ON public.project_files FOR ALL TO authenticated
USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE INDEX project_files_user_project_idx ON public.project_files (user_id, project_id, created_at DESC);
CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON public.project_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.guest_usage (
  identity_hash text NOT NULL,
  day date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  message_count integer NOT NULL DEFAULT 0 CHECK (message_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (identity_hash, day)
);
GRANT ALL ON public.guest_usage TO service_role;
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_guest_message(_identity_hash text, _limit integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  IF current_user IS DISTINCT FROM 'service_role' THEN
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

CREATE POLICY "Owners read own stored files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'nuru-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners upload own stored files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'nuru-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update own stored files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'nuru-files' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'nuru-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete own stored files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'nuru-files' AND (storage.foldername(name))[1] = auth.uid()::text);