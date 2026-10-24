# socsetbnetoryzzz

Netory — современная социальная сеть на React 19, TypeScript, Vite и Tailwind CSS v4 с интеграцией Supabase.

## Особенности
- Полноценная лента публикаций с поддержкой медиа
- Интеграция с базой данных и авторизацией Supabase
- Защита данных через Row Level Security (RLS)
- Встроенный аудио-плеер и Web Audio ambient-синтезатор
- Запись видеокружков через Web Camera MediaRecorder API
- Личные сообщения, группы и система профилей

## Запуск проекта
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Создайте файл `.env` на основе `.env.example` и укажите ключи Supabase:
   ```env
   VITE_SUPABASE_URL=ваш_проект
   VITE_SUPABASE_ANON_KEY=ваш_ключ
   ```
3. Запустите dev-сервер:
   ```bash
   npm run dev
   ```
