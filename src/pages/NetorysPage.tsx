import { useState } from "react"
import OneBadge from "../components/OneBadge"
import "./NetorysPage.css"

export interface NetoryClip {
  id: number
  author: string
  handle: string
  avatar: number
  videoUrl: string
  caption: string
  tags: string[]
  sound: string
  soundAuthor: string
  likes: number
  comments: number
  shares: number
  views: string
  category: "all" | "trending" | "music" | "nature" | "art"
  cover: string
}

const clipsData: NetoryClip[] = [
  {
    id: 1,
    author: "Александр Морозов",
    handle: "alex.morozov",
    avatar: 12,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    caption: "Когда просто стоишь у воды и все тревожные мысли растворяются  Океан лечит лучше всего.",
    tags: ["#океан", "#закат", "#релакс", "#netorys"],
    sound: "Ocean Ambient Dream · Netory Original",
    soundAuthor: "Netory Sound Studio",
    likes: 1420,
    comments: 89,
    shares: 42,
    views: "24.5k",
    category: "nature",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    author: "София Волкова",
    handle: "sofia.design",
    avatar: 47,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-making-coffee-41584-large.mp4",
    caption: "Утренний ритуал. С этого эспрессо начинается каждый хороший дизайн-проект  Какой ваш любимый сорт?",
    tags: ["#кофе", "#утро", "#дизайн", "#вдохновение"],
    sound: "Morning Coffee Lo-Fi Beats",
    soundAuthor: "Sofia Beats",
    likes: 3890,
    comments: 245,
    shares: 119,
    views: "58.1k",
    category: "trending",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    author: "Марк Соколов",
    handle: "mark.sound",
    avatar: 13,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
    caption: "Синтезировал новый ночной эмбиент-дроун. Слушать строго в полноразмерных наушниках ",
    tags: ["#музыка", "#ambient", "#космос", "#electronic"],
    sound: "Deep Space Resonance (Original Mix)",
    soundAuthor: "Mark Sokolov",
    likes: 6710,
    comments: 512,
    shares: 340,
    views: "112k",
    category: "music",
    cover: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    author: "Анна Белова",
    handle: "anna.art",
    avatar: 49,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    caption: "За пределами шумного города время течет медленно и глубоко. Солнечные блики на воде ",
    tags: ["#природа", "#лес", "#тишина", "#netorys"],
    sound: "Forest Wind & Stream Sounds",
    soundAuthor: "Nature Tapes",
    likes: 4250,
    comments: 178,
    shares: 95,
    views: "76.4k",
    category: "nature",
    cover: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    author: "Никита Морозов",
    handle: "nikita.dev",
    avatar: 53,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-at-a-calm-lake-time-lapse-42990-large.mp4",
    caption: "Ночной таймлапс на горном озере. 4 часа съемки в одной минуте магии ",
    tags: ["#таймлапс", "#звезды", "#ночь", "#астрофото"],
    sound: "Cosmic Odyssey · Synthwave Night",
    soundAuthor: "Starlight Records",
    likes: 8120,
    comments: 630,
    shares: 480,
    views: "145k",
    category: "trending",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    author: "Елена Смирнова",
    handle: "elena.ceramics",
    avatar: 33,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41710-large.mp4",
    caption: "Глина не терпит спешки. Создание вазы для весенних пионов своими руками ",
    tags: ["#керамика", "#ручнаяработа", "#творчество", "#арт"],
    sound: "Clay & Meditation · Acoustic Guitar",
    soundAuthor: "Acoustic Lounge",
    likes: 5430,
    comments: 290,
    shares: 160,
    views: "92k",
    category: "art",
    cover: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80",
  },
]

const categories = [
  ["all", "Для вас"],
  ["trending", "Популярное"],
  ["music", "Музыка"],
  ["nature", "Природа"],
  ["art", "Творчество"],
]

export default function NetorysPage({ userName, isOneSubscriber, onWrite, onNavigate, canInteract }: {
  userName: string
  isOneSubscriber: boolean
  onWrite: (name: string) => void
  onNavigate: (page: string) => void
  canInteract: boolean
}) {
  const [category, setCategory] = useState("all")
  const [activeId, setActiveId] = useState(1)
  const [liked, setLiked] = useState<number[]>([])
  const [saved, setSaved] = useState<number[]>([])
  const [failed, setFailed] = useState(false)
  const [notice, setNotice] = useState("")
  const filtered = clipsData.filter(clip => category === "all" || clip.category === category)
  const active = filtered.find(clip => clip.id === activeId) || filtered[0]
  const selectClip = (id: number) => { setActiveId(id); setFailed(false); setNotice("") }
  const toggle = (ids: number[], id: number) => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]
  const share = async () => {
    try {
      await navigator.clipboard.writeText(active.videoUrl)
      setNotice("Ссылка на видео скопирована")
    } catch { setNotice("Не удалось скопировать ссылку. Попробуйте ещё раз.") }
  }
  return (
    <div className="netorys-page">
      <header className="netorys-heading">
        <div><span className="detail-eyebrow">СМОТРЕТЬ · ЧУВСТВОВАТЬ · ВДОХНОВЛЯТЬСЯ</span><h1>Видео<span>.</span></h1><p>Большие впечатления. Маленькие истории.</p></div>
        {canInteract && <span className="netorys-viewer one-name">{userName}{isOneSubscriber && <OneBadge />}</span>}
      </header>
      <button className="video-one-banner" onClick={() => onNavigate("Netory One")}><div><span>NETORY ONE / БОЛЬШЕ ВАШЕГО</span><h2>Ваш мир.<br />Без лишних рамок.</h2><p>Узнайте о возможностях One и настройте пространство под себя.</p><strong>Открыть Netory One ↗</strong></div><span className="video-one-art" aria-hidden="true">1</span><small>Демо-возможности · без оплаты</small></button>
      <nav className="netorys-tabs" aria-label="Категории видео">
        {categories.map(([id, label]) => <button key={id} aria-pressed={category === id} className={category === id ? "is-active" : ""} onClick={() => { setCategory(id); setFailed(false); setNotice("") }}>{label}</button>)}
      </nav>
      <div className="netorys-layout">
        <section className="netorys-stage" aria-label="Просмотр видео">
          <div className="netorys-screen">
            <video key={active.id} src={active.videoUrl} poster={active.cover} controls playsInline preload="metadata" onError={() => setFailed(true)} />
            <span className="netorys-screen-label">NETORY VIDEO / {String(active.id).padStart(2, "0")}</span>
            {failed && <div className="netorys-video-error" role="status">Видео временно недоступно. Выберите другой ролик.</div>}
          </div>
          <div className="netorys-detail">
            <div className="netorys-author"><img src={`https://i.pravatar.cc/100?img=${active.avatar}`} alt="" /><div><strong>{active.author}</strong><small>@{active.handle}</small></div><button onClick={() => onWrite(active.author)}>Написать</button></div>
            <p>{active.caption}</p>
            <span className="netorys-tags">{active.tags.join("  ")}</span>
            <div className="netorys-actions">
              <button aria-pressed={liked.includes(active.id)} onClick={() => canInteract ? setLiked(toggle(liked, active.id)) : onNavigate("Войти")}>{liked.includes(active.id) ? "Нравится" : "Оценить"} · {(active.likes + Number(liked.includes(active.id))).toLocaleString("ru-RU")}</button>
              <button aria-pressed={saved.includes(active.id)} onClick={() => canInteract ? setSaved(toggle(saved, active.id)) : onNavigate("Войти")}>{saved.includes(active.id) ? "Сохранено" : "Сохранить"}</button>
              <button onClick={share}>Поделиться</button>
            </div>
            <div className="netorys-sound"><span>Звук оригинального ролика</span><small>{active.views} просмотров · демо-каталог</small></div>
            <p role="status" className="netorys-notice">{notice}</p>
          </div>
        </section>
        <aside className="netorys-queue">
          <div className="netorys-queue-title"><h2>Смотреть дальше</h2><span>{filtered.length} видео</span></div>
          {filtered.map((clip, index) => <button className={`netorys-queue-item ${clip.id === active.id ? "is-active" : ""}`} key={clip.id} onClick={() => selectClip(clip.id)} aria-pressed={clip.id === active.id}>
            <span className="netorys-queue-cover"><img src={clip.cover} alt="" /><small>{String(index + 1).padStart(2, "0")}</small></span>
            <span className="netorys-queue-copy"><strong>{clip.caption.split(".")[0]}</strong><small>{clip.author}</small><span>{clip.views} просмотров</span></span>
          </button>)}
          <p className="netorys-queue-note">Вы выбираете темп.<br />Видео запускаются только по нажатию.<br />Реакции действуют до ухода со страницы.</p>
        </aside>
      </div>
    </div>
  )
}
