-- Funciones auxiliares compartidas por el resto de esquemas.
-- Ejecutar antes que supabase-one-time-skin-codes-schema.sql.

-- Une un array jsonb de textos con un text[] sin duplicados.
-- Si base no es un array (null, objeto, etc.) se trata como vacío.
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
