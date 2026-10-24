create table if not exists public.offensive_chat_attempts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now()
);

alter table public.offensive_chat_attempts enable row level security;
revoke all on public.offensive_chat_attempts from public, anon, authenticated;
grant all on public.offensive_chat_attempts to service_role;

create or replace function public.record_offensive_chat_attempt(target_user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  insert into public.offensive_chat_attempts as stored_attempts (user_id, attempts, updated_at)
  values (target_user_id, 1, pg_catalog.now())
  on conflict (user_id) do update
    set attempts = stored_attempts.attempts + 1,
        updated_at = pg_catalog.now()
  returning stored_attempts.attempts;
$$;

revoke all on function public.record_offensive_chat_attempt(uuid) from public, anon, authenticated;
grant execute on function public.record_offensive_chat_attempt(uuid) to service_role;
