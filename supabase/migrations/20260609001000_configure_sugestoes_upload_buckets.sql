insert into storage.buckets (id, name, public)
values
  ('sugestoes-imagens', 'sugestoes-imagens', true),
  ('sugestoes-videos', 'sugestoes-videos', true)
on conflict (id) do update
set public = true;

drop policy if exists "Usuarios autenticados podem enviar imagens de sugestoes"
on storage.objects;

drop policy if exists "Usuarios autenticados podem enviar videos de sugestoes"
on storage.objects;

drop policy if exists "Leitura publica das imagens de sugestoes"
on storage.objects;

create policy "Leitura publica das imagens de sugestoes"
on storage.objects
for select
using (
  bucket_id = 'sugestoes-imagens'
);

drop policy if exists "Leitura publica dos videos de sugestoes"
on storage.objects;

create policy "Leitura publica dos videos de sugestoes"
on storage.objects
for select
using (
  bucket_id = 'sugestoes-videos'
);
