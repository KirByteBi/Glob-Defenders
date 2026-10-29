-- Esquema combinado para pegar una sola vez en Supabase > SQL Editor.
-- Es la unión, en orden, de los archivos individuales de esta carpeta.
-- Si editas uno de ellos, copia el cambio también aquí.
-- Incluye: auxiliares, progreso, moderación, códigos de un uso y vinculación con Star Jump.
-- Se puede volver a ejecutar sobre una base ya instalada (todo es idempotente).

begin;

-- ===== Funciones auxiliares (supabase-shared-helpers.sql) =====

create or replace function public.jsonb_text_array_union(base jsonb, extra text[])
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(pg_catalog.jsonb_agg(merged.value), '[]'::jsonb)
    from (
      select existing.value
        from pg_catalog.jsonb_array_elements_text(
          case when pg_catalog.jsonb_typeof(base) = 'array' then base else '[]'::jsonb end
        ) as existing(value)
      union
      select added.value
        from pg_catalog.unnest(coalesce(extra, array[]::text[])) as added(value)
    ) as merged;
$$;

revoke all on function public.jsonb_text_array_union(jsonb, text[]) from public, anon, authenticated;
grant execute on function public.jsonb_text_array_union(jsonb, text[]) to service_role;

-- ===== Progreso de las cuentas (supabase-progress-schema.sql) =====

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

-- ===== Contador de infracciones del chat (supabase-moderation-schema.sql) =====

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

-- ===== Códigos de skin de un solo uso (supabase-one-time-skin-codes-schema.sql) =====

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
  reward jsonb;
  skin_ids text[];
  tower_unlocks text[];
  tower_progress jsonb;
  reserved_email text;
  target_email text;
  claimed_by uuid;
  inserted_code text;
  existing_progress jsonb;
begin
  if target_user_id is null then
    return jsonb_build_object('result', 'invalid');
  end if;

  reward := case normalized_code
    when 'FROGGY_VICTEST' then jsonb_build_object(
      'skins', jsonb_build_array('froggy_set'),
      'towers', '[]'::jsonb,
      'progress', '{}'::jsonb,
      'reservedEmail', 'victorillo_24@accounts.glob-defenders.invalid')
    when 'NITRO-BOOMER' then jsonb_build_object(
      'skins', jsonb_build_array('sharkbot_bombot'),
      'towers', '[]'::jsonb,
      'progress', '{}'::jsonb)
    when 'ASTRAL-CREDIBLE' then jsonb_build_object(
      'skins', jsonb_build_array('fracstal_set'),
      'towers', jsonb_build_array('Worker_Glob'),
      'progress', jsonb_build_object('unlockedWorkerGlob', true),
      'reservedEmail', 'credible@accounts.glob-defenders.invalid')
    when 'THE-USER-BOMB' then jsonb_build_object(
      'skins', '[]'::jsonb,
      'towers', jsonb_build_array('Bomb_Glob'),
      'progress', jsonb_build_object('unlockedBombGlob', true))
    else null
  end;

  if reward is null then
    return jsonb_build_object('result', 'invalid');
  end if;

  skin_ids := array(select jsonb_array_elements_text(reward -> 'skins'));
  tower_unlocks := array(select jsonb_array_elements_text(reward -> 'towers'));
  tower_progress := reward -> 'progress';
  reserved_email := reward ->> 'reservedEmail';

  if reserved_email is not null then
    select lower(email) into target_email from auth.users where id = target_user_id;
    if target_email is distinct from reserved_email then
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

  if claimed_by is null and
     public.jsonb_text_array_union(existing_progress -> 'unlockedSkins', null) @> to_jsonb(skin_ids) and
     coalesce(existing_progress, '{}'::jsonb) @> tower_progress then
    return jsonb_build_object('result', 'already_owned', 'skinId', skin_ids[1]);
  end if;

  if claimed_by is null then
    insert into public.one_time_skin_code_redemptions (code, user_id)
      values (normalized_code, target_user_id)
      on conflict (code) do nothing
      returning code into inserted_code;

    if inserted_code is null then
      select user_id into claimed_by
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
        'unlockedSkins', to_jsonb(skin_ids),
        'usedCodes', jsonb_build_object(normalized_code, true)
      ) || tower_progress,
      now()
    )
    on conflict (user_id) do update
      set progress = coalesce(public.player_progress.progress, '{}'::jsonb) ||
        jsonb_build_object(
          'unlockedSkins',
            public.jsonb_text_array_union(public.player_progress.progress -> 'unlockedSkins', skin_ids),
          'usedCodes',
            coalesce(public.player_progress.progress -> 'usedCodes', '{}'::jsonb) ||
            jsonb_build_object(normalized_code, true)
        ) || tower_progress,
        updated_at = now();

  return jsonb_build_object(
    'result', 'redeemed',
    'skinId', skin_ids[1],
    'skinIds', to_jsonb(skin_ids),
    'towerUnlocks', to_jsonb(tower_unlocks)
  );
end;
$$;

revoke all on function public.redeem_one_time_skin_code(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_one_time_skin_code(text, uuid) to service_role;

-- ===== Colaboración Star Jump (supabase-star-jump-link-schema.sql) =====

create table if not exists public.star_jump_links (
  user_id uuid primary key references auth.users (id) on delete cascade,
  best_meters integer not null default 0 check (best_meters between 0 and 1000000),
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.star_jump_links enable row level security;
revoke all on public.star_jump_links from public, anon, authenticated;
grant select, delete on public.star_jump_links to authenticated;
grant all on public.star_jump_links to service_role;

drop policy if exists "Users can read their own Star Jump link" on public.star_jump_links;
create policy "Users can read their own Star Jump link"
  on public.star_jump_links for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own Star Jump link" on public.star_jump_links;
create policy "Users can remove their own Star Jump link"
  on public.star_jump_links for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.link_star_jump_account(sj_best_meters integer default 0)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  clean_meters integer := least(greatest(coalesce(sj_best_meters, 0), 0), 1000000);
  was_linked boolean;
  stored public.star_jump_links;
begin
  if current_user_id is null then
    return jsonb_build_object('result', 'not_authenticated');
  end if;

  select true into was_linked from public.star_jump_links where user_id = current_user_id;

  insert into public.star_jump_links (user_id, best_meters, linked_at, updated_at)
    values (current_user_id, clean_meters, now(), now())
    on conflict (user_id) do update
      set best_meters = greatest(public.star_jump_links.best_meters, excluded.best_meters),
          updated_at = now()
    returning * into stored;

  return jsonb_build_object(
    'result', case when was_linked then 'updated' else 'linked' end,
    'bestMeters', stored.best_meters,
    'linkedAt', stored.linked_at
  );
end;
$$;

revoke all on function public.link_star_jump_account(integer) from public, anon;
grant execute on function public.link_star_jump_account(integer) to authenticated;

create table if not exists public.star_jump_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint star_jump_progress_is_object check (jsonb_typeof(progress) = 'object'),
  constraint star_jump_progress_max_size check (pg_column_size(progress) <= 16384)
);

alter table public.star_jump_progress enable row level security;
revoke all on public.star_jump_progress from public, anon, authenticated;
grant select, insert, update on public.star_jump_progress to authenticated;
grant all on public.star_jump_progress to service_role;

drop policy if exists "Users can read their own Star Jump progress" on public.star_jump_progress;
create policy "Users can read their own Star Jump progress"
  on public.star_jump_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own Star Jump progress" on public.star_jump_progress;
create policy "Users can insert their own Star Jump progress"
  on public.star_jump_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own Star Jump progress" on public.star_jump_progress;
create policy "Users can update their own Star Jump progress"
  on public.star_jump_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
