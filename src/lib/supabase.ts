import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nvwtjbvketybqcwvuedk.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseAnonKey !== "your_anon_key_here"
)

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] Внимание: VITE_SUPABASE_ANON_KEY не настроен в .env файле. Запросы к бэкенду будут отключены до добавления ключа."
  )
}

// Создаем клиент Supabase с автоматическим сохранением сессии в localStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey || "dummy-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
