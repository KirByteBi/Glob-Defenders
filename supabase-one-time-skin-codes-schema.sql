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
    else null
  end;

  if skin_id is null then
    return jsonb_build_object('result', 'invalid');
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

  if claimed_by is null and unlocked_skins @> jsonb_build_array(skin_id) then
    return jsonb_build_object('result', 'already_owned', 'skinId', skin_id);
  end if;

  select coalesce(jsonb_agg(to_jsonb(skins.skin)), '[]'::jsonb)
    into unlocked_skins
    from (
      select distinct value as skin
        from jsonb_array_elements_text(unlocked_skins || jsonb_build_array(skin_id)) as existing_skins(value)
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
      ),
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
                    ) || jsonb_build_array(skin_id)
                  ) as existing_skins(value)
              ) as skins
          ),
          'usedCodes',
            coalesce(public.player_progress.progress -> 'usedCodes', '{}'::jsonb) ||
            jsonb_build_object(normalized_code, true)
        ),
        updated_at = now();

  return jsonb_build_object('result', 'redeemed', 'skinId', skin_id);
end;
$$;

revoke all on function public.redeem_one_time_skin_code(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_one_time_skin_code(text, uuid) to service_role;
