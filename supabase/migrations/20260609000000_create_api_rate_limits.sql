create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  chave text not null,
  rota text not null,
  created_at timestamptz not null default now()
);

create index if not exists api_rate_limits_chave_rota_created_at_idx
  on public.api_rate_limits (chave, rota, created_at desc);

alter table public.api_rate_limits enable row level security;

drop policy if exists "Bloqueia acesso publico aos rate limits" on public.api_rate_limits;

create policy "Bloqueia acesso publico aos rate limits"
  on public.api_rate_limits
  for all
  using (false)
  with check (false);
