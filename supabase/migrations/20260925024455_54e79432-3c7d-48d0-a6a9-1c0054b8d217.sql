create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text, user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null, content text not null,
  enabled boolean not null default true,
  conversation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  conversation_id uuid, event_type text not null, agent_type text, action text, risk_level text,
  success boolean not null default true, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  conversation_id uuid, model text, agent_type text, input_tokens integer, output_tokens integer,
  estimated_cost numeric, created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.user_devices, public.user_memory to authenticated;
grant select on public.ai_audit_events, public.ai_usage_events to authenticated;
grant all on public.user_devices, public.user_memory, public.ai_audit_events, public.ai_usage_events to service_role;
alter table public.user_devices enable row level security;
alter table public.user_memory enable row level security;
alter table public.ai_audit_events enable row level security;
alter table public.ai_usage_events enable row level security;
create policy "users manage own devices" on public.user_devices for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own memory" on public.user_memory for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own audit events" on public.ai_audit_events for select to authenticated using (auth.uid() = user_id);
create policy "users read own ai usage" on public.ai_usage_events for select to authenticated using (auth.uid() = user_id);
create index if not exists user_memory_user_updated_idx on public.user_memory(user_id, updated_at desc);
create index if not exists user_memory_conversation_idx on public.user_memory(conversation_id);
create trigger update_user_memory_updated_at before update on public.user_memory for each row execute function public.update_updated_at_column();