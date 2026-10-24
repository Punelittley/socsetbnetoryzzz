import { useEffect, useRef, useState } from "react"
import AuthPage from "./pages/AuthPage"
import { MessagesPage, FriendsPage, UtilityPage } from "./pages/SocialPages"
import PostComments from "./pages/PostComments"
import HeaderMenus from "./components/HeaderMenus"
import ProfilePage from "./pages/ProfilePage"
import NetorysPage from "./pages/NetorysPage"
import GroupsPage from "./pages/GroupsPage"
import CircleRecorderOverlay from "./components/CircleRecorderOverlay"
import Nav3DIcon from "./components/Nav3DIcon"
import DonateModal from "./components/DonateModal"
import NetoryOnePage from "./pages/NetoryOnePage"
import MusicPage from "./pages/MusicPage"
import OneBadge from "./components/OneBadge"
import SettingsPage from "./pages/SettingsPage"
import CreatePostPage from "./pages/CreatePostPage"
import MapPage from "./pages/MapPage"
import CallModal, { ActiveCallState } from "./components/CallModal"
import webrtc from "./lib/webrtc"
import { supabase, isSupabaseConfigured } from "./lib/supabase"

const routes: Record<string, string> = {
  Карта: "/map",
  Профиль: "/profile",
  Netorys: "/netorys",
  "Netory One": "/one",
  Музыка: "/music",
  Группы: "/groups",
  Звонки: "/calls",
  Лента: "/",
  Обзор: "/explore",
  Сообщения: "/messages",
  Друзья: "/friends",
  Сохранённое: "/saved",
  Войти: "/login",
  Регистрация: "/register",
  Настройки: "/settings",
  "Редактировать профиль": "/profile/edit",
  "О Netory": "/about",
  Конфиденциальность: "/privacy",
  Уведомления: "/notifications",
  "Создать публикацию": "/create",
  Видеокружок: "/circles",
  "Дизайн каждый день": "/communities/design",
  "За пределами города": "/communities/travel",
  "Музыка внутри": "/communities/music",
}
const currentPage = () =>
  Object.keys(routes).find((key) => routes[key] === window.location.pathname) ||
  "Лента"
const mainPages = [
  "Карта",
  "Создать публикацию",
  "Настройки",
  "Редактировать профиль",
  "Netory One",
  "Профиль",
  "Netorys",
  "Музыка",
  "Группы",
  "Звонки",
  "Лента",
  "Обзор",
  "Сообщения",
  "Друзья",
  "Сохранённое",
  "Дизайн каждый день",
  "За пределами города",
  "Музыка внутри",
]
const protectedPages = new Set(["Профиль", "Сообщения", "Звонки", "Настройки", "Редактировать профиль", "Создать публикацию", "Видеокружок", "Уведомления"])

const paths: Record<string, string> = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  clapper: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M2 9h20 M9 4v5 M15 4v5",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  music: "M9 18V5l12-2v13M9 8l12-2M9 18a3 3 0 1 1-3-3h3M21 16a3 3 0 1 1-3-3h3",
  phone: "M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  search: "m21 21-5-5 M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  chat: "M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  bookmark: "M6 3h12v18l-6-4-6 4Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  video: "M3 5h12v14H3ZM15 10l6-4v12l-6-4",
  image: "M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M8 7h.01",
  smile:
    "M8 9h.01M16 9h.01M8 15s4 4 8 0M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  send: "m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9",
  compass: "m16 8-3 5-5 3 3-5 5-3ZM22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  close: "m6 6 12 12M6 18 18 6",
  play: "m9 5 11 7-11 7Z",
  check: "m5 12 4 4L19 6",
  globe:
    "M21 12H3M12 3c6 5 6 13 0 18-6-5-6-13 0-18ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  spark: "m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z",
  logout: "M9 3H3v18h6M9 12h13m-5-5 5 5-5 5",
}
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  )
}
const avatar = (id: any) =>
  typeof id === "string" && (id.startsWith("http") || id.startsWith("data:"))
    ? id
    : `https://i.pravatar.cc/100?img=${id || 11}`
const lake =
  "https://images.unsplash.com/photo-1480497490787-505ec076689f?auto=format&fit=crop&w=1400&q=85"
const initialPosts = [
  {
    id: 1,
    name: "Александр Морозов",
    user: "alex.morozov",
    avatar: 12,
    time: "24 минуты назад",
    text: "Иногда нужно просто сменить картинку за окном. И оставить все уведомления где-то далеко.",
    image: lake,
    likes: 128,
    tag: "Доломитовые Альпы, Италия",
    category: "Путешествия",
  },
  {
    id: 2,
    name: "София Волкова",
    user: "sofia.design",
    avatar: 47,
    time: "48 минут назад",
    text: "Маленькое напоминание: вдохновение повсюду. Сегодня оно нашлось в утреннем свете, любимом кофе и новой книге. А что вдохновляет вас?",
    image: "",
    likes: 86,
    tag: "",
    category: "Дизайн",
  },
]
export default function App() {
  const [page, setPage] = useState(currentPage),
    [tab, setTab] = useState("Для вас"),
    [dialog, setDialog] = useState(""),
    [toast, setToast] = useState(""),
    [posts, setPosts] = useState<any[]>(initialPosts),
    [draft, setDraft] = useState(""),
    [liked, setLiked] = useState<(number | string)[]>([]),
    [saved, setSaved] = useState<(number | string)[]>([]),
    [followed, setFollowed] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [auth, setAuth] = useState(false),
    [name, setName] = useState("Алексей"),
    [message, setMessage] = useState(""),
    [circleRecorderOpen, setCircleRecorderOpen] = useState(false),
    [userCircleClip, setUserCircleClip] = useState<string | null>(null)
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null)
  const [searchOpen,setSearchOpen]=useState(false);
  const [returnPage, setReturnPage] = useState("Лента")
  const sidebarRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const sidebar = sidebarRef.current
    const navigation = sidebar?.querySelector<HTMLElement>("nav")
    if (!sidebar || !navigation) return
    const scrollNavigation = (event: WheelEvent) => {
      if (event.ctrlKey) return
      event.preventDefault()
      const horizontal = window.getComputedStyle(navigation).flexDirection === "row"
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2
        ? (horizontal ? navigation.clientWidth : navigation.clientHeight) : 1
      if (horizontal) navigation.scrollLeft += (event.deltaX || event.deltaY) * unit
      else navigation.scrollTop += event.deltaY * unit
    }
    sidebar.addEventListener("wheel", scrollNavigation, { passive: false })
    return () => sidebar.removeEventListener("wheel", scrollNavigation)
  }, [])
  const [recipient,setRecipient]=useState('Александр Морозов');
  const [expandedComments,setExpandedComments]=useState<number[]>([]);
  const [actionPulse,setActionPulse]=useState('');
  const [donateTarget, setDonateTarget] = useState<{
    isOpen: boolean
    name: string
    avatar?: string
    role?: string
  }>({ isOpen: false, name: "" })
  const [isOneSubscriber, setIsOneSubscriber] = useState<boolean>(() => {
    try {
      return localStorage.getItem("netory_one_subscriber") === "true"
    } catch {
      return false
    }
  })
  const toggleOneSubscription = () => {
    if (!auth) { nav("Войти"); return }
    setIsOneSubscriber((prev) => {
      const next = !prev
      try {
        localStorage.setItem("netory_one_subscriber", String(next))
      } catch {}
      notify(next ? "Демо-оформление One включено. Оплата не производилась." : "Демо-оформление One выключено")
      return next
    })
  }
  const animateAction=(id:number,action:string)=>{setActionPulse('');requestAnimationFrame(()=>setActionPulse(`${id}-${action}`))};
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notify = (s: string) => {
    setToast(s)
    window.setTimeout(() => setToast(""), 3500)
  }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // WebRTC Сигналинг входящих звонков
  useEffect(() => {
    webrtc.initSignaling(name, (signal) => {
      if (signal.type === "call-request") {
        setActiveCall({
          recipientName: signal.fromName,
          recipientAvatar: signal.fromAvatar || "https://i.pravatar.cc/100?img=12",
          isVideo: signal.isVideo,
          isIncoming: true,
        })
      } else if (signal.type === "call-end") {
        setActiveCall(null)
      }
    })
  }, [name])

  const loadSupabasePosts = async () => {
    if (!isSupabaseConfigured) return
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(full_name, username, avatar_url, is_one_subscriber)")
        .order("created_at", { ascending: false })
        .limit(30)

      if (!error && data && data.length > 0) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.profiles?.full_name || p.profiles?.username || "Участник Netory",
          user: p.profiles?.username || "user",
          avatar: p.profiles?.avatar_url || 11,
          time: new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: p.content,
          image: p.media_url || "",
          likes: p.likes_count || 0,
          tag: "",
          category: "Запись",
        }))
        setPosts([...mapped, ...initialPosts])
      }
    } catch (err) {
      console.error("Ошибка загрузки постов:", err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const loadSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setAuth(true)
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.username
        if (metaName) setName(metaName)

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profile) {
          if (profile.full_name) setName(profile.full_name)
          if (profile.is_one_subscriber !== undefined) {
            setIsOneSubscriber(profile.is_one_subscriber)
          }
        }
      }
    }

    loadSessionAndProfile()
    loadSupabasePosts()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setAuth(true)
          const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.username
          if (metaName) setName(metaName)
        } else {
          setAuth(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  const closeModal = () => {
    setModal("")
  }
  const closeCircleRecorder = () => {
    setCircleRecorderOpen(false)
    if (page === "Видеокружок") nav("Лента")
  }
  const [threads, setThreads] = useState<Record<string, string[]>>(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem("netory-threads") || "{}")
      const valid: Record<string, string[]> = {}
      if (data && typeof data === "object" && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
            valid[key] = value
          }
        }
      }
      return valid
    } catch {
      return {}
    }
  })

  const saveThreads = (next: Record<string, string[]>) => {
    if (!auth) { nav("Сообщения"); return }
    setThreads(next)
    try {
      sessionStorage.setItem("netory-threads", JSON.stringify(next))
    } catch (e) {
      notify("Хранилище переполнено. Новые сообщения останутся только до перезагрузки страницы.")
    }
  }

  const handlePublishCircle = (clipUrl: string) => {
    if (!auth) { nav("Сообщения"); return }
    const targetRecipient = recipient || "Александр Морозов"
    const currentList = threads[targetRecipient] || []
    const nextThreads = {
      ...threads,
      [targetRecipient]: [...currentList, `circle:${clipUrl}`],
    }
    saveThreads(nextThreads)
    notify(`Видеокружок отправлен в ЛС (${targetRecipient})`)
    if (page !== "Сообщения") {
      nav("Сообщения")
    }
    closeCircleRecorder()
  }
  const publish = async (image = "") => {
    if (!auth) { nav("Войти"); return }
    if (!draft.trim() && !image) return
    const textToPublish = draft.trim()
    const newPost = {
      id: "temp-" + Date.now(),
      name: `${name}`,
      user: "you",
      avatar: 11,
      time: "Только что",
      text: textToPublish,
      image,
      likes: 0,
      tag: "",
      category: "Личное",
    }
    setPosts((prev) => [newPost, ...prev])
    setDraft("")
    nav("Лента")
    notify("Публикация появилась в вашей ленте")

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error } = await supabase.from("posts").insert({
            user_id: user.id,
            content: textToPublish,
            media_url: image || null,
          })
          if (!error) {
            loadSupabasePosts()
          } else {
            console.error("Ошибка сохранения публикации в Supabase:", error)
            if (error.message) notify(error.message)
          }
        }
      } catch (err) {
        console.error("Ошибка при публикации:", err)
      }
    }
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setAuth(false)
    nav("Лента")
    notify("Вы вышли из аккаунта")
  }
  const nav = (requested: string, afterLogin = false) => {
    let p = requested
    if (requested === "Войти" && page !== "Войти" && page !== "Регистрация") setReturnPage(page)
    if (!auth && !afterLogin && protectedPages.has(p)) {
      setReturnPage(p)
      p = "Войти"
    }
    const path = routes[p] || "/"
    if (window.location.pathname !== path)
      window.history.pushState({}, "", path)
    setPage(p)
    setQuery("")
    setTab("Для вас")
    setDialog("")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const setModal = (value: string) => {
    if (value === "Видеокружок") {
      if (!auth) { nav("Видеокружок"); return }
      setCircleRecorderOpen(true)
      return
    }
    if (routes[value]) nav(value)
    else setDialog(value)
  }
  const standalone =
    !mainPages.includes(page) && page !== "Войти" && page !== "Регистрация" && page !== "Видеокружок"
  const modal = dialog || (standalone ? page : "")
  const authPage = page === "Войти" || page === "Регистрация" || (!auth && protectedPages.has(page))
  useEffect(() => {
    if (!auth && protectedPages.has(page)) {
      setReturnPage(page)
      window.history.replaceState({}, "", "/login")
      setPage("Войти")
    }
  }, [page, auth])
  const communityCategory =
    page === "Дизайн каждый день"
      ? "Дизайн"
      : page === "За пределами города"
        ? "Путешествия"
        : page === "Музыка внутри"
          ? "Музыка"
          : ""
  useEffect(() => {
    const back = () => {
      setPage(currentPage())
      setQuery("")
      setTab("Для вас")
      setDialog("")
    }
    window.addEventListener("popstate", back)
    return () => window.removeEventListener("popstate", back)
  }, [])
  const visible = posts.filter(
    (p) =>
      (page !== "Сохранённое" || saved.includes(p.id)) &&
      (!query ||
        `${p.text} ${p.name} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!communityCategory || p.category === communityCategory) &&
      (page !== "Лента" || tab !== "Подписки" || followed.includes(p.name)),
  )
  return (
    <div className="app-shell" data-auth={auth} onClickCapture={(event) => {
      if (auth || authPage) return
      const target = event.target as HTMLElement
      if (target.closest(".composer, .story-my, .stories-more-btn, .post-actions button, .comment-send-btn, .directory-action")) {
        event.preventDefault(); event.stopPropagation(); nav("Войти")
      }
    }} onSubmitCapture={(event) => {
      if (!auth && !authPage) { event.preventDefault(); event.stopPropagation(); nav("Войти") }
    }}>
      <header className="header">
        <div className="header-inner">
          <button className="brand" onClick={() => nav("Лента")} aria-label="Netory Главная">
            <img src="/logo.png" alt="Netory" className="brand-logo" />
            <span className="brand-name">netory</span>
            <span className="brand-dot" />
          </button>

          <div className="header-search-bar">
            <Icon name="search" size={16} />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => {
                if (page !== "Лента" && page !== "Группы" && page !== "Друзья") nav("Лента")
                setQuery(e.target.value)
              }}
              placeholder="Поиск в Netory…"
              aria-label="Поиск в Netory"
            />
            {query ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery("")}
                aria-label="Очистить поиск"
              >
                <Icon name="close" size={13} />
              </button>
            ) : (
              <span className="search-kbd-hint">⌘K</span>
            )}
          </div>

          <div className="header-actions">
            <button
              className={`header-one-btn ${page === "Netory One" ? "active" : ""}`}
              onClick={() => nav("Netory One")}
              title="Netory One — Премиум возможности"
            >
              <img src="/one.png" alt="1" className="header-one-icon" />
              <span>Netory One</span>
              {isOneSubscriber && <span className="header-one-active-dot" />}
            </button>

            <button
              className="header-create-btn"
              onClick={() => setModal("Создать публикацию")}
              title="Создать публикацию"
            >
              <Icon name="plus" size={15} />
              <span>Создать</span>
            </button>

            <button
              className="header-icon-btn"
              onClick={() => nav("Сообщения")}
              data-tooltip="Сообщения"
              aria-label="Сообщения"
            >
              <Icon name="chat" size={18} />
              {auth && <span className="header-action-badge">3</span>}
            </button>

            <HeaderMenus
              name={name}
              auth={auth}
              onLogout={handleLogout}
              isOneSubscriber={isOneSubscriber}
              onNavigate={nav}
              onSelectRecipient={setRecipient}
            />
          </div>
        </div>
      </header>
      {(
        (
          <div
            className={`layout ${authPage ? "auth-layout focused-layout" : ""} ${
              ["Настройки", "Редактировать профиль", "Сообщения", "Друзья", "Музыка", "Группы", "Netorys", "Профиль", "Дизайн каждый день", "За пределами города", "Музыка внутри", "Netory One", "Карта"].includes(page)
                ? "focused-layout"
                : ""
            }`}
          >
            <aside className="left-sidebar" ref={sidebarRef}>
              <nav className="static-side-nav icon-only-sidebar" aria-label="Боковая панель">
                {[
                  ["Профиль", "user", ""],
                  ["Лента", "home", ""],
                  ["Netorys", "clapper", "клипы"],
                  ["Сообщения", "chat", "3"],
                  ["Карта", "map", "live"],
                  ["Netory One", "one", isOneSubscriber ? "" : "pro"],
                  ["Музыка", "music", ""],
                  ["Группы", "groups", ""],
                  ["Друзья", "friends", ""],
                  ["Звонки", "phone", ""],
                  ["Сохранённое", "bookmark", ""],
                ].map(([label, icon, badge]) => (
                  <button
                    key={label}
                    className={`side-nav-btn ${page === label ? "active" : ""}`}
                    onClick={() => nav(label)}
                    data-tooltip={label === "Netorys" ? "Видео" : label}
                    aria-label={label === "Netorys" ? "Видео" : label}
                  >
                    <Nav3DIcon name={icon} active={page === label} size={25} />
                    <span className="mobile-nav-label">{label === "Netorys" ? "Видео" : label}</span>
                    {badge && (
                      <span hidden={!auth && label === "Сообщения"} className={`side-badge ${badge === "клипы" ? "badge-dot" : "badge-count"}`}>
                        {badge === "клипы" ? "" : badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

            </aside>
            <main className="feed">
              <MusicPage visible={page === "Музыка"} canUpload={auth} onRequireAuth={() => nav("Войти")} />
              {authPage ? (
                <AuthPage
                  registration={page === "Регистрация"}
                  onNavigate={nav}
                  onComplete={(newName) => {
                    if (newName) setName(newName)
                    setAuth(true)
                    nav(returnPage, true)
                    notify("Добро пожаловать в Netory!")
                  }}
                />
              ) : page === "Создать публикацию" && auth ? (
                <CreatePostPage name={name} draft={draft} onDraft={setDraft} onPublish={publish} onCancel={() => nav("Лента")} />
              ) : page === "Профиль" ? (
                <ProfilePage
                  name={name}
                  onUpdateName={setName}
                  posts={posts}
                  liked={liked}
                  saved={saved}
                  onLike={(id) => {
                    animateAction(id, "like")
                    setLiked(
                      liked.includes(id)
                        ? liked.filter((x) => x !== id)
                        : [...liked, id]
                    )
                  }}
                  onSave={(id) => {
                    animateAction(id, "save")
                    setSaved(
                      saved.includes(id)
                        ? saved.filter((x) => x !== id)
                        : [...saved, id]
                    )
                    notify(
                      saved.includes(id)
                        ? "Удалено из закладок"
                        : "Сохранено в закладки"
                    )
                  }}
                  onNavigate={nav}
                  onSelectRecipient={setRecipient}
                  onPublishPost={(text) => {
                    setPosts([
                      {
                        id: Date.now(),
                        name: `${name} Смирнов`,
                        user: "alex.morozov",
                        avatar: 11,
                        time: "Только что",
                        text,
                        image: "",
                        likes: 0,
                        tag: "",
                        category: "Личное",
                      },
                      ...posts,
                    ])
                    notify("Публикация появилась на вашей странице")
                  }}
                  onOpenDonate={(targetName, avatar) =>
                    setDonateTarget({
                      isOpen: true,
                      name: targetName,
                      avatar,
                      role: "Автор профиля",
                    })
                  }
                  isOneSubscriber={isOneSubscriber}
                />
              ) : page === "Настройки" || page === "Редактировать профиль" ? (
                <SettingsPage key={page} name={name} editing={page === "Редактировать профиль"} onUpdateName={setName} onNavigate={nav} />
              ) : page === "Netory One" ? (
                <NetoryOnePage
                  isSubscriber={isOneSubscriber}
                  onToggleSubscription={toggleOneSubscription}
                  userName={name}
                  onNavigate={nav}
                />
              ) : page === "Netorys" ? (
                <NetorysPage
                  userName={name}
                  isOneSubscriber={isOneSubscriber}
                  onNavigate={nav}
                  canInteract={auth}
                  onWrite={(recipientName) => {
                    setRecipient(recipientName)
                    nav("Сообщения")
                  }}
                />
              ) : page === "Сообщения" ? (
                <MessagesPage
                  recipient={recipient}
                  onSelect={setRecipient}
                  onRecord={() => setCircleRecorderOpen(true)}
                  threads={threads}
                  onUpdateThreads={saveThreads}
                  onOpenDonate={(partnerName, partnerAvatar) =>
                    setDonateTarget({
                      isOpen: true,
                      name: partnerName,
                      avatar: partnerAvatar,
                      role: "Собеседник",
                    })
                  }
                  onStartCall={(rName, rAvatar, isVideo) => {
                    setActiveCall({
                      recipientName: rName,
                      recipientAvatar: rAvatar,
                      isVideo,
                    })
                  }}
                  currentUserName={name}
                />
              ) : page === "Друзья" ? (
                <FriendsPage
                  followed={followed}
                  onFollow={(n) =>
                    setFollowed(
                      followed.includes(n)
                        ? followed.filter((x) => x !== n)
                        : [...followed, n]
                    )
                  }
                  onWrite={(n) => {
                    setRecipient(n)
                    nav("Сообщения")
                  }}
                  currentUserName={name}
                />
              ) : page === "Группы" || ["Дизайн каждый день", "За пределами города", "Музыка внутри"].includes(page) ? (
                <GroupsPage initialGroupId={page === "Группы" ? undefined : page} authenticated={auth} onRequireAuth={() => nav("Войти")} />
              ) : page === "Карта" ? (
                <MapPage
                  userName={name}
                  onNavigate={nav}
                  onSelectRecipient={(r) => {
                    setRecipient(r)
                    nav("Сообщения")
                  }}
                />
              ) : page === "Музыка" ? null : page === "Звонки" ? (
                <UtilityPage
                  page={page}
                  currentUserName={name}
                  onWrite={(n) => {
                    setRecipient(n)
                    nav("Сообщения")
                  }}
                  onStartCall={(rName, rAvatar, isVideo, isTestEcho) => {
                    setActiveCall({
                      recipientName: rName,
                      recipientAvatar: rAvatar,
                      isVideo,
                      isTestEcho,
                    })
                  }}
                />
              ) : (
                <>
                  {page === "Лента" && <>
                      <div className="feed-tabs">
                        <div>
                          {["Для вас", "Подписки", "Популярное"].map((t) => (
                            <button
                              className={tab === t ? "selected" : ""}
                              onClick={() => setTab(t)}
                              key={t}
                            >
                              {t}
                              {t === "Для вас" && (
                                <span className="tiny-spark">✧</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <span className="live-label">
                          <i />
                          Всё самое настоящее
                        </span>
                      </div>
                      <section className="stories-container-card">
                        <div className="stories-track">
                          <button
                            className="story-pill story-my"
                            onClick={() => {
                              if (userCircleClip) {
                                setModal("Мой кружок")
                              } else {
                                setCircleRecorderOpen(true)
                              }
                            }}
                          >
                            <div className="story-circle-ring ring-add">
                              <img src={userCircleClip || avatar(11)} alt="" />
                              <span className="story-add-badge">
                                <Icon name={userCircleClip ? "check" : "plus"} size={12} />
                              </span>
                            </div>
                            <span className="story-title">Ваш кружок</span>
                          </button>
                          {[
                            ["Аня", 49, false],
                            ["Марк", 13, true],
                            ["София", 47, false],
                            ["Даня", 14, false],
                            ["Алиса", 44, false],
                            ["Никита", 53, false],
                          ].map(([n, id, isLive]) => (
                            <button
                              className="story-pill"
                              key={String(n)}
                              onClick={() => setModal(`Кружок · ${n}`)}
                            >
                              <div className="story-circle-ring">
                                <img src={avatar(Number(id))} alt={String(n)} />
                                {isLive && (
                                  <span className="story-live-badge">LIVE</span>
                                )}
                              </div>
                              <span className="story-title">{n}</span>
                            </button>
                          ))}
                          <button
                            className="stories-more-btn"
                            aria-label="Больше историй"
                            onClick={() => setCircleRecorderOpen(true)}
                            title="Записать видеокружок"
                          >
                            <Icon name="arrow" size={16} />
                          </button>
                        </div>
                      </section>
                      <section className="composer">
                        <div className="composer-input">
                          <img className="avatar" src={avatar(11)} alt="" />
                          <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={`Что нового, ${name}?`}
                          />
                          <span className="composer-spark">✧</span>
                        </div>
                        <div className="composer-bottom">
                          <button
                            onClick={() => setModal("Создать публикацию")}
                          >
                            <Icon name="image" size={18} />
                            Фото
                          </button>
                          <button onClick={() => setCircleRecorderOpen(true)}>
                            <Icon name="video" size={18} />
                            Кружок
                          </button>
                          <button onClick={() => setModal("Настроение")}>
                            <Icon name="smile" size={18} />
                            Настроение
                          </button>
                          <button
                            className="publish"
                            onClick={() => publish()}
                            aria-label="Опубликовать"
                          >
                            <Icon name="arrow" size={19} />
                          </button>
                        </div>
                      </section>
                    </>
                  }
                  {visible.length === 0 && (
                    <div className="empty-state">
                      <Icon name="bookmark" size={32} />
                      <strong>
                        {page === "Сохранённое"
                          ? "Здесь будет ваше вдохновение"
                          : "Пока ничего не найдено"}
                      </strong>
                      <p>
                        {page === "Сохранённое"
                          ? "Сохраняйте понравившиеся публикации, чтобы вернуться к ним."
                          : "Попробуйте другой запрос или подпишитесь на авторов."}
                      </p>
                    </div>
                  )}
                  {(tab === "Популярное"
                    ? [...visible].sort((a, b) => b.likes - a.likes)
                    : visible
                  ).map((p) => (
                    <article className="post" key={p.id}>
                      <div className="post-header">
                        <img className="avatar" src={avatar(p.avatar)} alt="" />
                        <div className="post-author">
                          <strong>
                            {p.name}
                            {p.user === "you" && isOneSubscriber && <OneBadge />}
                            <span className="verified">
                              <Icon name="check" size={9} />
                            </span>
                          </strong>
                          <span>
                            @{p.user}
                            <i>·</i>
                            {p.time}
                          </span>
                        </div>
                        <button
                          className="more"
                          aria-label="Действия с публикацией"
                          onClick={() => {
                            setSaved(
                              saved.includes(p.id)
                                ? saved.filter((x) => x !== p.id)
                                : [...saved, p.id],
                            )
                            notify(
                              saved.includes(p.id)
                                ? "Удалено из сохранённого"
                                : "Публикация сохранена",
                            )
                          }}
                        >
                          •••
                        </button>
                      </div>
                      <p className="post-text">{p.text.replace(" 🏔", "")}</p>
                      {p.image && (
                        <div className="post-image">
                          <img
                            src={p.image}
                            alt="Горы Доломитовых Альп отражаются в озере"
                          />
                          <span className="location">
                            <Icon name="globe" size={13} />
                            {p.tag}
                          </span>
                          <span className="image-count">1 / 3</span>
                          <div className="image-dots">
                            <i />
                            <i />
                            <i />
                          </div>
                        </div>
                      )}
                      <div className="post-actions">
                        <button
                          aria-label="Нравится" aria-pressed={liked.includes(p.id)} className={`${liked.includes(p.id)?"liked":""} ${actionPulse===`${p.id}-like`?"action-pop":""}`}
                          onClick={() => { animateAction(p.id,"like");
                            setLiked(
                              liked.includes(p.id)
                                ? liked.filter((x) => x !== p.id)
                                : [...liked, p.id],
                            )
                          }}
                        >
                          <Icon name="heart" />
                          {p.likes + (liked.includes(p.id) ? 1 : 0)}
                        </button>
                        <button
                          className={actionPulse===`${p.id}-comment`?"action-pop":""} aria-expanded={expandedComments.includes(p.id)} onClick={()=>{animateAction(p.id,"comment");setExpandedComments(expandedComments.includes(p.id)?expandedComments.filter(id=>id!==p.id):[...expandedComments,p.id])}}
                        >
                          <Icon name="chat" /> {p.id === 1 ? "24" : "12"}
                        </button>
                        <button
                          className={actionPulse===`${p.id}-share`?"action-send":""} aria-label="Поделиться"
                          onClick={() => {
                            animateAction(p.id,"share");
                            navigator.clipboard?.writeText(window.location.href).then(()=>notify("Ссылка скопирована")).catch(()=>notify("Не удалось скопировать ссылку"))
                          }}
                        >
                          <Icon name="send" />
                        </button>
                        <span className="post-views">
                          ◉ {p.id === 1 ? "1,2 тыс." : "846"}
                        </span>
                        <button
                          aria-pressed={saved.includes(p.id)} className={`${saved.includes(p.id)?"saved":""} ${actionPulse===`${p.id}-save`?"action-pop":""}`}
                          aria-label="Сохранить"
                          onClick={() => {animateAction(p.id,"save");
                            setSaved(
                              saved.includes(p.id)
                                ? saved.filter((x) => x !== p.id)
                                : [...saved, p.id],
                            )
                          }}
                        >
                          <Icon name="bookmark" />
                        </button>
                      </div>
                      <PostComments postId={p.id} name={name} isOneSubscriber={isOneSubscriber} open={expandedComments.includes(p.id)} onOpen={()=>setExpandedComments(ids=>ids.includes(p.id)?ids:[...ids,p.id])}/>
                    </article>
                  ))}
                </>
              )}
            </main>
            <aside className="right-sidebar" hidden={authPage}>
              <section className="recommendations">
                <div className="section-row">
                  <strong>Возможно, ваши люди</strong>
                  <Icon name="users" size={17} />
                </div>
                {[
                  ["Анна Белова", 49, "Дизайнер, влюблённый в жизнь"],
                  ["Марк Соколов", 13, "Музыка. Горы. Моменты."],
                  ["Елена Ким", 44, "Создаю и вдохновляюсь"],
                ].map(([n, id, bio]) => (
                  <div className="person" key={n}>
                    <img src={avatar(Number(id))} alt="" />
                    <div>
                      <strong>{n}</strong>
                      <span>{bio}</span>
                    </div>
                    <button
                      className={`person-add ${
                        followed.includes(String(n)) ? "following" : ""
                      }`}
                      aria-label={`Подписаться: ${n}`}
                      onClick={() =>
                        setFollowed(
                          followed.includes(String(n))
                            ? followed.filter((x) => x !== n)
                            : [...followed, String(n)],
                        )
                      }
                    >
                      <Icon
                        name={followed.includes(String(n)) ? "check" : "plus"}
                        size={17}
                      />
                    </button>
                  </div>
                ))}
                <button className="text-link" onClick={() => nav("Друзья")}>
                  Посмотреть всех <Icon name="arrow" size={14} />
                </button>
              </section>
              <section className="trending">
                <div className="section-row">
                  <strong>Сейчас обсуждают</strong>
                  <span className="trend-icon">↗</span>
                </div>
                {[
                  ["01", "Делать то, что любишь", "2,4 тыс. публикаций"],
                  ["02", "Маленькие путешествия", "1,8 тыс. публикаций"],
                  ["03", "Вдохновение в деталях", "956 публикаций"],
                ].map(([n, title, sub]) => (
                  <button
                    key={n}
                    onClick={() => {
                      nav("Обзор")
                      setQuery(
                        n === "02" ? "Путешествия" : n === "03" ? "Дизайн" : "",
                      )
                    }}
                  >
                    <span className="trend-number">{n}</span>
                    <div>
                      <strong>#{title.replace(/ /g, "")}</strong>
                      <small>{sub}</small>
                    </div>
                    <Icon name="arrow" size={15} />
                  </button>
                ))}
              </section>
              <div className="daily-note">
                <span>МЫСЛЬ ДНЯ</span>
                <p>
                  «Самое ценное в сети —<br />
                  связи, которые становятся
                  <br />
                  настоящими».
                </p>
                <div>
                  Меньше шума. Больше своего.<span>✳</span>
                </div>
              </div>
              <div className="right-legal">
                <span className="status-dot" />
                Ваше пространство. Ваши правила.
              </div>
            </aside>
          </div>
        )
      )}
      {(
        <footer className="site-footer">
          <div className="footer-brand">netory<span>®</span></div>
          <div className="footer-bottom">
            <span>Ближе друг к другу. Ближе к себе.</span>
            <nav>
              {["Лента", "Обзор", "Сообщения", "Друзья", "О Netory"].map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => (p === "О Netory" ? setModal(p) : nav(p))}
                  >
                    {p}
                  </button>
                ),
              )}
            </nav>
            <span>© Netory {new Date().getFullYear()}</span>
          </div>
        </footer>
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <div
          className={standalone ? "standalone-page" : "modal-overlay"}
          onClick={standalone ? undefined : closeModal}
        >
          <section
            className={standalone ? "modal page-panel" : "modal"}
            role={standalone ? undefined : "dialog"}
            aria-modal={standalone ? undefined : true}
            aria-label={modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              onClick={() => (standalone ? nav("Лента") : closeModal())}
              aria-label="Закрыть"
            >
              <Icon name="close" />
            </button>
            <div className="modal-title">{modal}</div>
            {modal === "Создать публикацию" ? (
              <div className="auth-form">
                <textarea
                  placeholder="Поделитесь тем, что важно…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button className="primary" onClick={() => publish()}>
                  Опубликовать
                  <Icon name="send" size={18} />
                </button>
              </div>
            ) : modal === "Мой кружок" ? (
              <div className="story-preview">
                {userCircleClip && userCircleClip.startsWith("blob:") ? (
                  <video
                    src={userCircleClip}
                    autoPlay
                    loop
                    playsInline
                    style={{
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "16px auto",
                      border: "4px solid #a855f7",
                      display: "block",
                    }}
                  />
                ) : (
                  <img
                    src={userCircleClip || avatar(11)}
                    alt="Ваш кружок"
                    style={{
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "16px auto",
                      border: "4px solid #a855f7",
                      display: "block",
                    }}
                  />
                )}
                <p>Ваш опубликованный видеокружок</p>
                <button
                  className="primary"
                  onClick={() => {
                    closeModal()
                    setCircleRecorderOpen(true)
                  }}
                >
                  Записать новый кружок
                  <Icon name="video" size={18} />
                </button>
              </div>
            ) : modal.startsWith("Кружок") ? (
              <div className="story-preview">
                <img
                  src={avatar(modal.includes("Аня") ? 49 : 13)}
                  alt="Профиль"
                />
                <p>Маленький момент большого дня.</p>
                <button
                  className="primary"
                  onClick={() => {
                    closeModal()
                    nav("Сообщения")
                  }}
                >
                  Ответить на кружок
                  <Icon name="send" size={18} />
                </button>
              </div>
            ) : modal.startsWith("Комментарии") ? (
              <div className="auth-form">
                <p>
                  <b>Анна Белова</b>
                  <br />
                  Как же красиво! Тоже мечтаю там побывать.
                </p>
                <input
                  placeholder="Ваш комментарий…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="primary"
                  onClick={() => {
                    if (message.trim()) {
                      notify("Комментарий добавлен")
                      setMessage("")
                      setModal("")
                    }
                  }}
                >
                  Отправить
                </button>
              </div>
            ) : modal === "Уведомления" ? (
              <div className="notifications-list">
                <p>
                  <b>Анна Белова</b> оценила вашу публикацию.
                  <small>5 минут назад</small>
                </p>
                <p>
                  <b>Александр Морозов</b> отправил вам сообщение.
                  <small>24 минуты назад</small>
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setModal("")
                    nav("Сообщения")
                  }}
                >
                  Открыть сообщения
                </button>
              </div>
            ) : modal === "Настройки" ? (
              <div className="auth-form">
                <label>
                  Ваше имя
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    nav("Лента")
                    notify("Настройки сохранены")
                  }}
                >
                  Сохранить
                </button>
                <button className="text-link" onClick={() => setModal("Войти")}>
                  {auth ? "Сменить аккаунт" : "Войти в аккаунт"}
                </button>
              </div>
            ) : (
              <div className="about-copy">
                {modal === "Конфиденциальность" ? (
                  <p>
                    Это демонстрация интерфейса Netory. Публикации, сообщения и данные профиля хранятся только в памяти текущей сессии вашего браузера. Камера включается исключительно по вашему нажатию для записи видеокружков.
                  </p>
                ) : (
                  <div className="about-modal-details">
                    <p>
                      <strong>Netory</strong> — социальная платформа нового поколения, построенная на искреннем общении, эстетике и звуке.
                    </p>
                    <div className="about-highlights-list">
                      <div className="about-highlight-item">
                        <strong>Видеокружки:</strong> мгновенная запись живых эмоций прямо в ЛС без лишних окон.
                      </div>
                      <div className="about-highlight-item">
                        <strong>Донаты:</strong> прямая поддержка любимых создателей контента.
                      </div>
                      <div className="about-highlight-item">
                        <strong>Netory One:</strong> премиальный статус, неоновая аура и расширенные лимиты.
                      </div>
                    </div>
                  </div>
                )}
                <button
                  className="primary"
                  onClick={() => {
                    closeModal()
                    nav("Лента")
                  }}
                >
                  Всё понятно
                  <Icon name="spark" size={17} />
                </button>
              </div>
            )}
          </section>
        </div>
      )}
      {auth && (circleRecorderOpen || page === "Видеокружок") && (
        <CircleRecorderOverlay
          isOpen={true}
          onClose={closeCircleRecorder}
          onPublish={handlePublishCircle}
          userName={name}
          userAvatar={11}
        />
      )}

      {donateTarget.isOpen && (
        <DonateModal
          isOpen={true}
          onClose={() => setDonateTarget((prev) => ({ ...prev, isOpen: false }))}
          recipientName={donateTarget.name}
          recipientAvatar={donateTarget.avatar}
          recipientRole={donateTarget.role}
          onDonated={(amt) => notify(`Донат ${amt} ₽ успешно отправлен для ${donateTarget.name}`)}
        />
      )}

      {activeCall && (
        <CallModal
          call={activeCall}
          currentUserName={name}
          onClose={() => setActiveCall(null)}
        />
      )}

    </div>
  )
}
