-- ==============================================================================
-- NETORY HARDENING: ЗАЩИТА ОТ СПАМА, ПЕРЕПОЛНЕНИЯ И DDOS БАЗЫ
-- Выполните в Supabase: SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. ОГРАНИЧЕНИЯ НА ДЛИНУ И СОДЕРЖИМОЕ (Защита от заливки мегабайтов текста)
alter table public.posts drop constraint if exists check_post_content_length;
alter table public.posts add constraint check_post_content_length 
  check (char_length(trim(content)) > 0 and char_length(content) <= 5000);

alter table public.comments drop constraint if exists check_comment_text_length;
alter table public.comments add constraint check_comment_text_length 
  check (char_length(trim(text)) > 0 and char_length(text) <= 1000);

alter table public.messages drop constraint if exists check_message_content_length;
alter table public.messages add constraint check_message_content_length 
  check (char_length(trim(content)) > 0 and char_length(content) <= 2000);

alter table public.profiles drop constraint if exists check_bio_length;
alter table public.profiles add constraint check_bio_length 
  check (char_length(bio) <= 500);

-- 2. RATE LIMITING: ЗАЩИТА ОТ СПАМ-ФЛУДА НА УРОВНЕ БАЗЫ
create or replace function public.enforce_rate_limits()
returns trigger as $$
begin
  -- Для постов: не чаще 1 публикации раз в 5 секунд от одного пользователя
  if (TG_TABLE_NAME = 'posts') then
    if exists (
      select 1 from public.posts
      where user_id = auth.uid()
        and created_at > (now() - interval '5 seconds')
    ) then
      raise exception 'Слишком частые публикации! Подождите 5 секунд.';
    end if;
  end if;

  -- Для комментариев: не чаще 1 комментария в 2 секунды
  if (TG_TABLE_NAME = 'comments') then
    if exists (
      select 1 from public.comments
      where user_id = auth.uid()
        and created_at > (now() - interval '2 seconds')
    ) then
      raise exception 'Пожалуйста, не отправляйте комментарии так часто.';
    end if;
  end if;

  -- Для личных сообщений: не чаще 1 сообщения в 1 секунду
  if (TG_TABLE_NAME = 'messages') then
    if exists (
      select 1 from public.messages
      where sender_id = auth.uid()
        and created_at > (now() - interval '1 second')
    ) then
      raise exception 'Слишком частая отправка сообщений.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Навешиваем триггеры проверки частоты
drop trigger if exists rate_limit_posts on public.posts;
create trigger rate_limit_posts
  before insert on public.posts
  for each row execute function public.enforce_rate_limits();

drop trigger if exists rate_limit_comments on public.comments;
create trigger rate_limit_comments
  before insert on public.comments
  for each row execute function public.enforce_rate_limits();

drop trigger if exists rate_limit_messages on public.messages;
create trigger rate_limit_messages
  before insert on public.messages
  for each row execute function public.enforce_rate_limits();

-- 3. СОЗДАНИЕ И ЗАЩИТА ХРАНИЛИЩА ФАЙЛОВ (SUPABASE STORAGE)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- Максимум 5 MB на файл
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- Только безопасные картинки, никакого исполняемого кода
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- RLS политики для Storage
drop policy if exists "Публичный просмотр картинок" on storage.objects;
create policy "Публичный просмотр картинок"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Загрузка только авторизованным в свою папку" on storage.objects;
create policy "Загрузка только авторизованным в свою папку"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Удаление только своих файлов" on storage.objects;
create policy "Удаление только своих файлов"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
