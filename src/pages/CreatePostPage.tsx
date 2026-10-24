import { useRef, useState } from "react"

export default function CreatePostPage({ name, draft, onDraft, onPublish, onCancel }: {
  name: string
  draft: string
  onDraft: (text: string) => void
  onPublish: (image: string) => void
  onCancel: () => void
}) {
  const [image, setImage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  return <section className="create-post-page">
    <header><span className="detail-eyebrow">ВАШ МОМЕНТ · ВАША ИСТОРИЯ</span><h1>Есть чем поделиться.</h1><p>Мысль, фотография или маленькое открытие — начните с себя.</p></header>
    <form className="post-editor" onSubmit={(event) => { event.preventDefault(); if (!loading && (draft.trim() || image)) onPublish(image) }}>
      <div className="post-editor-author"><img src="https://i.pravatar.cc/100?img=11" alt="" /><div><strong>{name}</strong><small>Публикация в вашей ленте</small></div><span>Новая запись</span></div>
      <label className="sr-only" htmlFor="post-text">Текст публикации</label>
      <textarea id="post-text" maxLength={5000} placeholder="Что хочется рассказать своим?" value={draft} onChange={(event) => onDraft(event.target.value)} />
      {image ? <div className="post-editor-image"><img src={image} alt="Изображение публикации" /><button type="button" onClick={() => setImage("")}>Удалить фото</button></div>
        : <button className="post-editor-upload" type="button" disabled={loading} onClick={() => file.current?.click()}><span>+</span><strong>{loading ? "Обрабатываем фотографию…" : "Добавить фотографию"}</strong><small>PNG, JPEG или WebP · до 5 МБ</small></button>}
      <input ref={file} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
        const selected = event.target.files?.[0]; event.target.value = ""
        if (!selected) return
        if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type) || selected.size > 5 * 1024 * 1024) { setError("Выберите PNG, JPEG или WebP не больше 5 МБ."); return }
        setLoading(true); setError("")
        const reader = new FileReader()
        reader.onload = () => { setImage(String(reader.result)); setLoading(false) }
        reader.onerror = () => { setError("Не удалось прочитать фотографию."); setLoading(false) }
        reader.readAsDataURL(selected)
      }} />
      {error && <p role="alert">{error}</p>}
      <div className="post-editor-footer"><span>{draft.length} / 5000</span><button type="button" onClick={onCancel}>Отмена</button><button className="primary" disabled={loading || (!draft.trim() && !image)}>Опубликовать ↗</button></div>
    </form>
    <p className="editor-local-note">Публикация появится в локальной ленте и будет доступна до перезагрузки страницы.</p>
  </section>
}
