-- Registro global de códigos de skin de un solo uso.
-- Requiere supabase-shared-helpers.sql (public.jsonb_text_array_union).

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
  -- Catálogo de códigos: skins, torres, flags de progreso y cuenta reservada (opcional)
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

  -- Bloquea la fila de progreso para evitar canjes simultáneos del mismo usuario
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

  -- Si ya tiene todo y nadie lo ha canjeado, el código queda libre para otro jugador
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
