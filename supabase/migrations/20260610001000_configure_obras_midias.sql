alter table if exists public.obras
add column if not exists updated_at timestamptz;

alter table if exists public.obras_imagens
add column if not exists tipo text default 'imagem';

alter table if exists public.obras_imagens
add column if not exists origem text;

alter table if exists public.obras_imagens
add column if not exists usuario_uuid uuid;

alter table if exists public.obras_imagens
add column if not exists eh_principal boolean default false;

insert into storage.buckets (id, name, public)
values ('obras-midias', 'obras-midias', true)
on conflict (id) do update
set public = true;
