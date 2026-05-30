create table if not exists public.obras_imagens (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  url text not null,
  legenda text,
  ordem int default 0,
  created_at timestamptz default now()
);

create index if not exists obras_imagens_obra_id_idx
on public.obras_imagens (obra_id);

alter table public.obras_imagens enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'obras_imagens'
      and policyname = 'Permitir leitura publica das imagens das obras'
  ) then
    create policy "Permitir leitura publica das imagens das obras"
    on public.obras_imagens
    for select
    using (true);
  end if;
end
$$;
