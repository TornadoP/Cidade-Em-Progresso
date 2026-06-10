create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  criado_por uuid,
  created_at timestamptz default now()
);

create unique index if not exists admin_users_email_idx
on public.admin_users (email);

alter table public.admin_users enable row level security;
