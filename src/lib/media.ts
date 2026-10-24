import { supabase, isSupabaseConfigured } from "./supabase"

/**
 * Сжимает изображение на клиенте перед загрузкой, защищая от раздувания базы данных
 */
export async function compressImage(file: File, maxDim = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else resolve(file)
        },
        "image/jpeg",
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Ошибка чтения изображения"))
    }

    img.src = url
  })
}

/**
 * Безопасная загрузка медиафайла:
 * 1. Проверяет Supabase Storage бакет 'media'
 * 2. Если бакет настроен — загружает туда и возвращает короткую публичную ссылку
 * 3. Если нет — возвращает сжатый data URL (в 30-50 раз меньше оригинала)
 */
export async function uploadOrCompressPostImage(file: File): Promise<string> {
  const compressedBlob = await compressImage(file)

  if (isSupabaseConfigured) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const fileExt = "jpg"
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, compressedBlob, {
            contentType: "image/jpeg",
            upsert: false,
          })

        if (!uploadError) {
          const { data } = supabase.storage.from("media").getPublicUrl(fileName)
          if (data?.publicUrl) {
            return data.publicUrl
          }
        }
      }
    } catch {
      // Игнорируем и переходим к запасному варианту со сжатием
    }
  }

  // Резервный вариант: возвращаем легкую сжатую копию
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(compressedBlob)
  })
}
