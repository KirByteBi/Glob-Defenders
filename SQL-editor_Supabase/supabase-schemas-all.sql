-- Esquema combinado para pegar una sola vez en Supabase > SQL Editor.
-- Incluye progreso de cuentas, moderacion y codigos globales de skin de un uso.
-- Ejecuta este archivo o los tres esquemas individuales, pero no hace falta ejecutar ambos.

begin;

-- Progreso de las cuentas
create table if not exists public.player_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.player_progress;
create policy "Users can read their own progress"
  on public.player_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own progress" on public.player_progress;
create policy "Users can insert their own progress"
  on public.player_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.player_progress;
create policy "Users can update their own progress"
  on public.player_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.player_progress to authenticated;

-- Contador de infracciones del chat
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

-- Registro global de codigos de skin de un solo uso
create table if not exists public.one_time_skin_code_redemptions (
  code text primary key,
  user_id uuid not null,
  redeemed_at timestamptz not null default now()
);

alter table public.one_time_skin_code_redemptions enable row level security;
revoke all on public.one_time_skin_code_redemptions from public, anon, authenticated;
grant all on public.one_time_skin_code_redemptions to service_role;

create or replace function public.redeem_one_time_skin_code(
  target_code text,
  target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_code text := upper(trim(target_code));
  skin_id text;
  skin_ids text[];
  tower_unlocks text[];
  tower_progress jsonb;
  target_email text;
  claimed_by uuid;
  inserted_code text;
  existing_progress jsonb;
  unlocked_skins jsonb;
begin
  if target_user_id is null then
    return jsonb_build_object('result', 'invalid');
  end if;

  skin_id := case normalized_code
    when 'FROGGY_VICTEST' then 'froggy_set'
    when 'NITRO-BOOMER' then 'sharkbot_bombot'
    when 'ASTRAL-CREDIBLE' then 'fracstal_set'
    else null
  end;
  skin_ids := case normalized_code
    when 'FROGGY_VICTEST' then array['froggy_set']::text[]
    when 'NITRO-BOOMER' then array['sharkbot_bombot']::text[]
    when 'ASTRAL-CREDIBLE' then array['fracstal_set']::text[]
    when 'THE-USER-BOMB' then array[]::text[]
    else null
  end;
  tower_unlocks := case normalized_code
    when 'ASTRAL-CREDIBLE' then array['Worker_Glob']::text[]
    when 'THE-USER-BOMB' then array['Bomb_Glob']::text[]
    else array[]::text[]
  end;
  tower_progress := case normalized_code
    when 'ASTRAL-CREDIBLE' then jsonb_build_object('unlockedWorkerGlob', true)
    when 'THE-USER-BOMB' then jsonb_build_object('unlockedBombGlob', true)
    else '{}'::jsonb
  end;

  if skin_ids is null then
    return jsonb_build_object('result', 'invalid');
  end if;

  if normalized_code = 'FROGGY_VICTEST' then
    select lower(email)
      into target_email
      from auth.users
      where id = target_user_id;

    if target_email is distinct from 'victorillo_24@accounts.glob-defenders.invalid' then
      return jsonb_build_object('result', 'not_eligible');
    end if;
  end if;

  select progress
    into existing_progress
    from public.player_progress
    where user_id = target_user_id
    for update;

  select user_id
    into claimed_by
    from public.one_time_skin_code_redemptions
    where code = normalized_code;

  if claimed_by is not null and claimed_by <> target_user_id then
    return jsonb_build_object('result', 'already_claimed');
  end if;

  unlocked_skins := case
    when jsonb_typeof(existing_progress -> 'unlockedSkins') = 'array'
      then existing_progress -> 'unlockedSkins'
    else '[]'::jsonb
  end;

  if claimed_by is null and unlocked_skins @> to_jsonb(skin_ids) and
     coalesce(existing_progress, '{}'::jsonb) @> tower_progress then
    return jsonb_build_object('result', 'already_owned', 'skinId', skin_id);
  end if;

  select coalesce(jsonb_agg(to_jsonb(skins.skin)), '[]'::jsonb)
    into unlocked_skins
    from (
      select distinct value as skin
        from jsonb_array_elements_text(unlocked_skins || to_jsonb(skin_ids)) as existing_skins(value)
    ) as skins;

  if claimed_by is null then
    insert into public.one_time_skin_code_redemptions (code, user_id)
      values (normalized_code, target_user_id)
      on conflict (code) do nothing
      returning code into inserted_code;

    if inserted_code is null then
      select user_id
        into claimed_by
        from public.one_time_skin_code_redemptions
        where code = normalized_code;

      if claimed_by is distinct from target_user_id then
        return jsonb_build_object('result', 'already_claimed');
      end if;
    end if;
  end if;

  insert into public.player_progress (user_id, progress, updated_at)
    values (
      target_user_id,
      jsonb_build_object(
        'unlockedSkins', unlocked_skins,
        'usedCodes', jsonb_build_object(normalized_code, true)
      ) || tower_progress,
      now()
    )
    on conflict (user_id) do update
      set progress = coalesce(public.player_progress.progress, '{}'::jsonb) ||
        jsonb_build_object(
          'unlockedSkins', (
            select coalesce(jsonb_agg(to_jsonb(skins.skin)), '[]'::jsonb)
              from (
                select distinct value as skin
                  from jsonb_array_elements_text(
                    (
                      case
                        when jsonb_typeof(public.player_progress.progress -> 'unlockedSkins') = 'array'
                          then public.player_progress.progress -> 'unlockedSkins'
                        else '[]'::jsonb
                      end
                    ) || to_jsonb(skin_ids)
                  ) as existing_skins(value)
              ) as skins
          ),
          'usedCodes',
            coalesce(public.player_progress.progress -> 'usedCodes', '{}'::jsonb) ||
            jsonb_build_object(normalized_code, true)
        ) || tower_progress,
        updated_at = now();

  return jsonb_build_object(
    'result', 'redeemed',
    'skinId', skin_id,
    'skinIds', to_jsonb(skin_ids),
    'towerUnlocks', to_jsonb(tower_unlocks)
  );
end;
$$;

revoke all on function public.redeem_one_time_skin_code(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_one_time_skin_code(text, uuid) to service_role;

commit;
