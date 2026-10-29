-- Colaboración Glob Defenders x Star Jump: vinculación de cuentas.
-- Star Jump inicia sesión con la cuenta de GlD (usuario + contraseña) y llama a
-- public.link_star_jump_account(). Glob Defenders lee su propia fila al entrar
-- y entrega la recompensa de la colaboración.

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

-- Crea o actualiza la vinculación del usuario autenticado.
-- best_meters solo sube (nunca baja) y se limita a un rango razonable.
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
