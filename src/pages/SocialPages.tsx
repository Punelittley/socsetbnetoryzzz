import { useEffect, useRef, useState } from "react"
import MusicPage from "./MusicPage"
import GroupsPage from "./GroupsPage"
import DirectoryCard from "../components/DirectoryCard"
import LocalMediaDialog from "../components/LocalMediaDialog"
import "../components/DirectoryCard.css"
const people = [
  {
    name: "Анна Белова",
    id: 49,
    bio: "Дизайн, искусство и маленькие открытия",
    city: "Москва",
    online: true,
    tag: "Дизайн",
    mutual: 12,
  },
  {
    name: "Марк Соколов",
    id: 13,
    bio: "Собираю музыку и впечатления",
    city: "Санкт-Петербург",
    online: true,
    tag: "Музыка",
    mutual: 8,
  },
  {
    name: "Александр Морозов",
    id: 12,
    bio: "Всегда где-то между горами и домом",
    city: "Москва",
    online: false,
    tag: "Путешествия",
    mutual: 6,
  },
  {
    name: "Елена Ким",
    id: 44,
    bio: "Создаю и вдохновляюсь",
    city: "Казань",
    online: true,
    tag: "Дизайн",
    mutual: 4,
  },
  {
    name: "София Волкова",
    id: 47,
    bio: "Красота — в простых вещах",
    city: "Москва",
    online: false,
    tag: "Дизайн",
    mutual: 9,
  },
  {
    name: "Даниил Орлов",
    id: 14,
    bio: "Плейлист под любое настроение",
    city: "Санкт-Петербург",
    online: false,
    tag: "Музыка",
    mutual: 3,
  },
]
const photo = (id: number) => `https://i.pravatar.cc/100?img=${id}`
function ChatIcon({ name, size = 20 }: { name: string; size?: number }) {
  const shapes: Record<string, string> = {
    search: "m21 21-5-5M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    send: "m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2",
    video: "M3 5h12v14H3ZM15 10l6-4v12l-6-4",
    back: "m14 6-6 6 6 6",
    plus: "M12 5v14M5 12h14",
    chat: "M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z",
    music:
      "M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    tip: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8",
    phone: "M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z",
    clip: "m8 12 7-7a4 4 0 0 1 6 6L10 22a6 6 0 0 1-8-8L13 3M6 16 17 5",
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={shapes[name]} />
    </svg>
  )
}
function CircleVideoMessage({ url }: { url: string }) {
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleSound = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  return (
    <div
      className="inbox-circle-bubble"
      onClick={toggleSound}
      title="Нажмите для включения/выключения звука"
    >
      <video
        ref={videoRef}
        src={url}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        className="inbox-circle-video"
      />
      <div className="inbox-circle-badge">
        <ChatIcon name="video" size={11} />
        <span>Кружок</span>
      </div>
    </div>
  )
}

export function MessagesPage({
  recipient,
  onSelect,
  onRecord,
  threads: propThreads,
  onUpdateThreads,
  onOpenDonate,
}: {
  recipient: string
  onSelect: (n: string) => void
  onRecord: () => void
  threads?: Record<string, string[]>
  onUpdateThreads?: (next: Record<string, string[]>) => void
  onOpenDonate?: (recipientName: string, recipientAvatar?: string) => void
}) {
  const [search, setSearch] = useState("")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState("Все")
  const [mobileChat, setMobileChat] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [mediaMode, setMediaMode] = useState<"voice" | "audio" | "video" | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [attachmentError, setAttachmentError] = useState("")
  const [loadingFile, setLoadingFile] = useState(false)
  const [localThreads, setLocalThreads] = useState<Record<string, string[]>>(
    () => {
      try {
        const data = JSON.parse(
          sessionStorage.getItem("netory-threads") || "{}",
        )
        const valid: Record<string, string[]> = {}
        if (data && typeof data === "object" && !Array.isArray(data)) {
          for (const [key, value] of Object.entries(data)) {
            if (
              Array.isArray(value) &&
              value.every((x) => typeof x === "string")
            ) {
              valid[key] = value
            }
          }
        }
        return valid
      } catch {
        return {}
      }
    },
  )

  const threads = propThreads || localThreads
  const threadsRef = useRef(threads)
  threadsRef.current = threads

  const updateThreads = (next: Record<string, string[]>) => {
    if (onUpdateThreads) {
      onUpdateThreads(next)
    } else {
      setLocalThreads(next)
      try {
        sessionStorage.setItem("netory-threads", JSON.stringify(next))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    }
  }

  const endRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const person = people.find((p) => p.name === recipient) || people[2]
  const list = threads[person.name] || []
  const draft = drafts[person.name] || ""

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [recipient, list.length])

  const visible = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "В сети" || p.online),
  )

  return (
    <div className={`inbox-page ${mobileChat ? "show-mobile-chat" : ""}`}>
      <aside className="inbox-sidebar">
        <div className="inbox-top">
          <div>
            <strong>
              Разговоры<span>.</span>
            </strong>
          </div>
          <button
            className="new-chat-button"
            title="Новый разговор"
            onClick={() => searchRef.current?.focus()}
          >
            <ChatIcon name="plus" size={19} />
          </button>
        </div>
        <label className="inbox-search">
          <ChatIcon name="search" size={17} />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя или собеседник"
          />
        </label>
        <div className="inbox-filters">
          {["Все", "В сети"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === "Все" && <span>{people.length}</span>}
            </button>
          ))}
        </div>
        <div className="inbox-contacts">
          {visible.map((p) => (
            <button
              key={p.name}
              className={`inbox-contact ${
                person.name === p.name ? "selected" : ""
              }`}
              onClick={() => {
                onSelect(p.name)
                setMobileChat(true)
              }}
            >
              <span className="portrait">
                <img src={photo(p.id)} alt="" />
                {p.online && <i />}
              </span>
              <span className="inbox-contact-copy">
                <strong>
                  {p.name}
                  <span>{threads[p.name]?.length ? "сейчас" : ""}</span>
                </strong>
                <small>
                  {(() => {
                    const lastMsg =
                      threads[p.name]?.[threads[p.name].length - 1]
                    if (!lastMsg) return p.bio
                    if (lastMsg.startsWith("circle:")) return "Видеокружок"
                    if (lastMsg.startsWith("voice:")) return "Голосовое · локально"
                    if (lastMsg.startsWith("file:")) return "Вложение · локально"
                    return lastMsg
                  })()}
                </small>
              </span>
            </button>
          ))}
          {!visible.length && (
            <div className="inbox-empty-search">
              Никого не нашли.
              <br />
              Попробуйте другое имя.
            </div>
          )}
        </div>
        <div className="inbox-privacy">
          <span />
          Только вы и ваш собеседник
        </div>
      </aside>
      <section className="inbox-room">
        <div className="inbox-room-header">
          <button
            className="mobile-chat-back"
            aria-label="К списку разговоров"
            onClick={() => setMobileChat(false)}
          >
            <ChatIcon name="back" />
          </button>
          <span className="portrait">
            <img src={photo(person.id)} alt="" />
            {person.online && <i />}
          </span>
          <div>
            <strong>{person.name}</strong>
            <small>{person.online ? "Сейчас в сети" : "Был(а) недавно"}</small>
          </div>
          <div className="inbox-header-actions">
            <button type="button" className="inbox-video" title="Аудиозвонок — проверка микрофона" aria-label="Аудиозвонок — проверка микрофона" onClick={() => setMediaMode("audio")}>
              <ChatIcon name="phone" />
            </button>
            <button type="button" className="inbox-video" title="Видеозвонок — проверка устройств" aria-label="Видеозвонок — проверка устройств" onClick={() => setMediaMode("video")}>
              <ChatIcon name="video" />
            </button>
          </div>
        </div>
        <div className="inbox-local-notice">Локальная переписка · сообщения не доставляются собеседнику</div>
        <div className="inbox-history">
          <div className="inbox-date">Сегодня</div>
          {!list.length ? (
            <div className="inbox-introduction">
              <div className="intro-chat-symbol">
                <ChatIcon name="chat" size={31} />
              </div>
              <strong>Начните с «привет»</strong>
              <p>
                Иногда одного сообщения достаточно,
                <br />
                чтобы стать немного ближе.
              </p>
              <div className="conversation-prompts">
                {["Привет! Как твой день?", "Рад(а) познакомиться!"].map(
                  (t) => (
                    <button
                      onClick={() => setDrafts({ ...drafts, [person.name]: t })}
                      key={t}
                    >
                      {t} ↗
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            list.map((text, i) => {
              if (text.startsWith("file:")) {
                try {
                  const attachment = JSON.parse(text.slice(5))
                  if (typeof attachment.url !== "string" || !/^data:(image\/(png|jpeg|webp|gif);base64,|application\/octet-stream;base64,)/.test(attachment.url)) return null
                  return <div className="inbox-outgoing" key={i}>
                    {attachment.image && <img className="chat-attachment-image" src={attachment.url} alt={attachment.name} />}
                    <a className="chat-file-link" href={attachment.url} download={attachment.name}><ChatIcon name="clip" size={16} />{attachment.name}</a>
                    <small>Локально · не доставлено</small>
                  </div>
                } catch { return null }
              }
              if (text.startsWith("voice:data:audio/")) {
                return (
                  <div className="inbox-outgoing" key={i}>
                    <audio className="inbox-voice-audio" controls preload="metadata" src={text.slice(6)} aria-label="Голосовое сообщение" />
                    <small>Сохранено локально · не доставлено</small>
                  </div>
                )
              }
              if (text.startsWith("circle:")) {
                const videoUrl = text.replace("circle:", "")
                return (
                  <div className="inbox-outgoing inbox-circle-outgoing" key={i}>
                    <CircleVideoMessage url={videoUrl} />
                    <small>
                      В этой сессии <span>✓</span>
                    </small>
                  </div>
                )
              }
              return (
                <div className="inbox-outgoing" key={i}>
                  <p>{text}</p>
                  <small>
                    В этой сессии <span>✓</span>
                  </small>
                </div>
              )
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="inbox-composer-wrap">
          {attachmentError && <p role="alert" className="chat-attachment-error">{attachmentError}</p>}
          <input hidden type="file" ref={fileInput} aria-label="Выберите изображение или файл" onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (!file) return
            if (file.size > 2 * 1024 * 1024) { setAttachmentError("Максимальный размер вложения — 2 МБ в локальной версии."); return }
            setLoadingFile(true)
            setAttachmentError("")
            const target = person.name
            try {
              const image = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
              const safeFile = new Blob([file], { type: image ? file.type : "application/octet-stream" })
              const data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result))
                reader.onerror = reject
                reader.readAsDataURL(safeFile)
              })
              const latest = threadsRef.current
              updateThreads({ ...latest, [target]: [...(latest[target] || []), `file:${JSON.stringify({ name: file.name, url: data, image })}`] })
            } catch { setAttachmentError("Не удалось прочитать файл. Попробуйте снова.") }
            finally { setLoadingFile(false) }
          }} />
          {storageError && <p role="alert">Хранилище переполнено. Запись доступна только до закрытия страницы.</p>}
          <form
            className="inbox-composer"
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              const next = {
                ...threads,
                [person.name]: [...list, draft.trim()],
              }
              updateThreads(next)
              setDrafts({ ...drafts, [person.name]: "" })
            }}
          >
            <button
              className="inbox-record"
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={loadingFile}
              title="Прикрепить изображение или файл"
              aria-label="Прикрепить изображение или файл"
            >
              <ChatIcon name="clip" />
            </button>
            <textarea
              rows={1}
              aria-label="Сообщение"
              placeholder="То, чем хочется поделиться…"
              value={draft}
              onChange={(e) =>
                setDrafts({ ...drafts, [person.name]: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.form?.requestSubmit()
                }
              }}
            />
            <button className="inbox-record" type="button" onClick={() => setMediaMode("voice")} title="Записать голосовое сообщение" aria-label="Записать голосовое сообщение">
              <ChatIcon name="mic" />
            </button>
            <button className="inbox-record" type="button" onClick={onRecord} title="Записать кружок" aria-label="Записать кружок"><ChatIcon name="video" /></button>
            <button
              className="inbox-send"
              disabled={!draft.trim() || loadingFile}
              aria-label="Отправить сообщение"
            >
              <ChatIcon name="send" size={18} />
            </button>
          </form>
        </div>
      </section>
      {mediaMode && <LocalMediaDialog
        mode={mediaMode}
        recipient={person.name}
        onClose={() => setMediaMode(null)}
        onSave={(data) => updateThreads({ ...threads, [person.name]: [...list, `voice:${data}`] })}
      />}
    </div>
  )
}
export function FriendsPage({
  followed,
  onFollow,
  onWrite,
}: {
  followed: string[]
  onFollow: (n: string) => void
  onWrite: (n: string) => void
}) {
  const [filter, setFilter] = useState("Все люди"),
    [search, setSearch] = useState(""),
    [city, setCity] = useState("Все города"),
    [interest, setInterest] = useState("Все интересы")
  const [selectedPerson, setSelectedPerson] = useState<(typeof people)[number] | null>(null)
  if (selectedPerson) return (
    <section className="person-profile-page">
      <button className="person-back" onClick={() => setSelectedPerson(null)}>← Все люди</button>
      <div className={`person-profile-cover directory-cover--${selectedPerson.tag === "Музыка" ? "music" : "design"}`} />
      <div className="person-profile-identity">
        <img src={photo(selectedPerson.id)} alt={selectedPerson.name} />
        <button className="primary" onClick={() => onFollow(selectedPerson.name)}>{followed.includes(selectedPerson.name) ? "Отписаться" : "Подписаться"}</button>
      </div>
      <h1>{selectedPerson.name}</h1>
      <p className="person-profile-meta">{selectedPerson.city} · {selectedPerson.online ? "В сети" : "Был(а) недавно"}</p>
      <div className="person-profile-sections"><section><h2>О человеке</h2><p>{selectedPerson.bio}</p><span>{selectedPerson.tag}</span></section><section><h2>Общие знакомые</h2><p>{selectedPerson.mutual} общих знакомых</p><small>Демонстрационный профиль</small></section></div>
      <section className="person-profile-wall"><h2>Публикации</h2><p>Пока нет доступных публикаций.</p></section>
    </section>
  )
  const filtered = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter !== "В сети" || p.online) &&
      (filter !== "Мои подписки" || followed.includes(p.name)) &&
      (city === "Все города" || city === p.city) &&
      (interest === "Все интересы" || interest === p.tag),
  )
  const reset = () => {
    setSearch("")
    setCity("Все города")
    setInterest("Все интересы")
    setFilter("Все люди")
  }
  return (
    <section className="directory-page">
      <div className="directory-toolbar">
        <label className="directory-search">
          <ChatIcon name="search" size={17} />
          <input
            aria-label="Поиск людей"
            placeholder="Поиск по имени…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="directory-filters">
          <select
            aria-label="Список людей"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["Все люди", "Мои подписки", "В сети"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <select
            aria-label="Город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {["Все города", "Москва", "Санкт-Петербург", "Казань"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Интересы"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            {["Все интересы", "Дизайн", "Музыка", "Путешествия"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="directory-results">
        <span>Люди · {filtered.length}</span>
        <button onClick={reset}>Сбросить фильтры</button>
      </div>
      <div className="directory-grid">
        {filtered.map((p) => (
          <DirectoryCard
            key={p.name}
            title={p.name}
            description={p.bio}
            avatar={photo(p.id)}
            category={p.tag}
            tone={
              p.tag === "Музыка"
                ? "music"
                : p.tag === "Путешествия"
                  ? "travel"
                  : "design"
            }
            meta={`${p.city} · ${p.online ? "В сети" : "Был(а) недавно"}`}
            social={`${p.mutual} общих знакомых`}
            online={p.online}
            selected={followed.includes(p.name)}
            actionLabel={
              followed.includes(p.name) ? "Вы подписаны" : "Подписаться"
            }
            onAction={() => onFollow(p.name)}
            onOpen={() => setSelectedPerson(p)}
            openLabel="На страницу"
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          Никого не нашли. Попробуйте изменить фильтры.
        </div>
      )}
    </section>
  )
}
export function UtilityPage({
  page,
  onWrite,
  onStartCall,
}: {
  page: string
  onWrite: (name: string) => void
  onStartCall?: (name: string, avatar: string, isVideo: boolean, isTestEcho?: boolean) => void
}) {
  const [call, setCall] = useState("")
  const [callMode, setCallMode] = useState<"audio" | "video">("audio")
  const [filter, setFilter] = useState("Все контакты")
  const [search, setSearch] = useState("")
  if (page === "Музыка") return <MusicPage />
  if (page === "Группы") return <GroupsPage />
  if (page !== "Звонки") return null
  const contacts = people.filter(
    (p) =>
      (filter !== "В сети" || p.online) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <section className="calls-page">
      <div className="calls-heading">
        <div>
          <span className="detail-eyebrow">БЛИЖЕ, ДАЖЕ НА РАССТОЯНИИ</span>
          <h2>Услышать своих.</h2>
          <p>HD видео- и аудиозвонки WebRTC прямо в браузере.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {onStartCall && (
            <button
              onClick={() => onStartCall("Тест оборудования (Эхо)", "https://i.pravatar.cc/100?img=11", true, true)}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.25)",
              }}
            >
              🧪 Проверить камеру и микрофон
            </button>
          )}
          <span className="calls-heading-icon">
            <ChatIcon name="video" size={32} />
          </span>
        </div>
      </div>
      <div className="content-toolbar">
        <div className="quiet-tabs">
          {["Все контакты", "В сети"].map((t) => (
            <button
              key={t}
              className={filter === t ? "active" : ""}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="inbox-search">
          <ChatIcon name="search" size={16} />
          <input
            aria-label="Поиск контактов"
            placeholder="Найти человека…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="calls-contact-list">
        {contacts.map((p) => (
          <div className="call-row" key={p.name}>
            <span className="portrait">
              <img src={photo(p.id)} alt="" />
              {p.online && <i />}
            </span>
            <div>
              <strong>{p.name}</strong>
              <small>
                {p.online ? "Сейчас в сети" : "Был(а) недавно"} · {p.city}
              </small>
            </div>
            <button
              className="call-start-button"
              aria-label={`Аудиозвонок: ${p.name}`}
              onClick={() => {
                if (onStartCall) onStartCall(p.name, photo(p.id), false)
                else { setCallMode("audio"); setCall(p.name) }
              }}
            >
              <ChatIcon name="phone" size={18} />
              <span>Аудио</span>
            </button>
            <button
              className="call-start-button"
              aria-label={`Позвонить: ${p.name}`}
              onClick={() => {
                if (onStartCall) onStartCall(p.name, photo(p.id), true)
                else { setCallMode("video"); setCall(p.name) }
              }}
            >
              <ChatIcon name="video" size={18} />
              <span>Видео</span>
            </button>
          </div>
        ))}
        {!contacts.length && (
          <div className="empty-state">Контакты не найдены</div>
        )}
      </div>
      <p className="calls-demo-note">
        Защищенные P2P звонки WebRTC · Бесплатные Google STUN серверы · Демонстрация экрана и живой звук.
      </p>
      {call && <LocalMediaDialog mode={callMode} recipient={call} onClose={() => setCall("")} />}
    </section>
  )
}
