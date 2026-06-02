do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Usuarios autenticados podem enviar videos de sugestoes'
  ) then
    create policy "Usuarios autenticados podem enviar videos de sugestoes"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'sugestoes-videos'
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Leitura publica dos videos de sugestoes'
  ) then
    create policy "Leitura publica dos videos de sugestoes"
    on storage.objects
    for select
    using (
      bucket_id = 'sugestoes-videos'
    );
  end if;
end $$;
