-- ==============================================================================
-- СХЕМА БАЗЫ ДАННЫХ И ИМБОВАЯ ЗАЩИТА (RLS) ДЛЯ NETORY
-- Выполните этот скрипт в Supabase: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. ТАБЛИЦА ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text default '',
  is_one_subscriber boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ТАБЛИЦА ПОСТОВ
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  media_url text,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ТАБЛИЦА КОММЕНТАРИЕВ
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ТАБЛИЦА ЛАЙКОВ
create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 5. ТАБЛИЦА ЗАКЛАДОК (СОХРАНЁННОЕ)
create table if not exists public.bookmarks (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 6. ТАБЛИЦА ЛИЧНЫХ СООБЩЕНИЙ
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- НАСТРОЙКА ИМБОВОЙ БЕЗОПАСНОСТИ (ROW LEVEL SECURITY - RLS)
-- Запрещает любые действия по умолчанию, разрешая только строго проверенные
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.messages enable row level security;

-- --- ПОЛИТИКИ ДЛЯ PROFILES ---
-- Читать профили могут все пользователи
drop policy if exists "Профили публично доступны для чтения" on public.profiles;
create policy "Профили публично доступны для чтения"
  on public.profiles for select
  using (true);

-- Редактировать профиль может ТОЛЬКО его реальный владелец
drop policy if exists "Пользователь может редактировать только свой профиль" on public.profiles;
create policy "Пользователь может редактировать только свой профиль"
  on public.profiles for update
  using (auth.uid() = id);

-- --- ПОЛИТИКИ ДЛЯ POSTS ---
-- Читать посты могут все
drop policy if exists "Посты доступны для чтения всем" on public.posts;
create policy "Посты доступны для чтения всем"
  on public.posts for select
  using (true);

-- Создавать посты может только авторизованный юзер от своего имени
drop policy if exists "Создание постов только от своего имени" on public.posts;
create policy "Создание постов только от своего имени"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Редактировать пост может только его автор
drop policy if exists "Редактировать пост может только автор" on public.posts;
create policy "Редактировать пост может только автор"
  on public.posts for update
  using (auth.uid() = user_id);

-- Удалять пост может только его автор
drop policy if exists "Удалять пост может только автор" on public.posts;
create policy "Удалять пост может только автор"
  on public.posts for delete
  using (auth.uid() = user_id);

-- --- ПОЛИТИКИ ДЛЯ COMMENTS ---
-- Читать комментарии могут все
drop policy if exists "Комментарии доступны всем" on public.comments;
create policy "Комментарии доступны всем"
  on public.comments for select
  using (true);

-- Добавлять комментарий только от своего имени
drop policy if exists "Добавление комментариев" on public.comments;
create policy "Добавление комментариев"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Удалять комментарий может автор комментария или автор поста
drop policy if exists "Удаление комментариев автором" on public.comments;
create policy "Удаление комментариев автором"
  on public.comments for delete
  using (
    auth.uid() = user_id 
    or auth.uid() in (select p.user_id from public.posts p where p.id = post_id)
  );

-- --- ПОЛИТИКИ ДЛЯ LIKES И BOOKMARKS ---
drop policy if exists "Лайки видны всем" on public.post_likes;
create policy "Лайки видны всем" on public.post_likes for select using (true);

drop policy if exists "Управление своими лайками" on public.post_likes;
create policy "Управление своими лайками" on public.post_likes for all using (auth.uid() = user_id);

drop policy if exists "Закладки видит только владелец" on public.bookmarks;
create policy "Закладки видит только владелец" on public.bookmarks for select using (auth.uid() = user_id);

drop policy if exists "Управление своими закладками" on public.bookmarks;
create policy "Управление своими закладками" on public.bookmarks for all using (auth.uid() = user_id);

-- --- ПОЛИТИКИ ДЛЯ СООБЩЕНИЙ (МАКСИМАЛЬНАЯ ПРИВАТНОСТЬ) ---
-- Никто посторонний не может прочитать переписку через API! Только отправитель или получатель.
drop policy if exists "Сообщения видят только участники диалога" on public.messages;
create policy "Сообщения видят только участники диалога"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Отправка сообщений только от своего имени
drop policy if exists "Отправка сообщений от своего имени" on public.messages;
create policy "Отправка сообщений от своего имени"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Пометка сообщений прочитанными (получателем)
drop policy if exists "Получатель может обновлять статус прочтения" on public.messages;
create policy "Получатель может обновлять статус прочтения"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- ==============================================================================
-- АВТОМАТИЧЕСКОЕ СОЗДАНИЕ ПУБЛИЧНОГО ПРОФИЛЯ ПРИ РЕГИСТРАЦИИ (SECURITY DEFINER)
-- Никаких уязвимостей на фронтенде: профиль создает сама база данных
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || new.id::text)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Триггер на создание пользователя в auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Включение Realtime для сообщений и постов (мгновенные обновления без перезагрузки)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
