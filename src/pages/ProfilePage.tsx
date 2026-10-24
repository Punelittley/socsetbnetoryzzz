import { useEffect, useState } from "react"
import PostComments from "./PostComments"
import OneBadge from "../components/OneBadge"

interface ProfileProps {
  name: string
  onUpdateName: (name: string) => void
  posts: any[]
  liked: (number | string)[]
  saved: (number | string)[]
  onLike: (id: any) => void
  onSave: (id: any) => void
  onNavigate: (route: string) => void
  onSelectRecipient: (name: string) => void
  onPublishPost: (text: string) => void
  onOpenDonate?: (recipientName: string, recipientAvatar?: string) => void
  isOneSubscriber?: boolean
}

interface FriendItem {
  id: number
  name: string
  handle: string
  avatar: number
  info: string
  mutual: number
  online: boolean
}

interface ProfileDetails {
  name: string
  about: string
  interests: string
  city: string
  occupation: string
  website: string
}

function readProfile(name: string): ProfileDetails {
  const empty = {
    name,
    about: "",
    interests: "",
    city: "",
    occupation: "",
    website: "",
  }
  try {
    const stored = JSON.parse(
      localStorage.getItem("netory-profile-details") || "{}",
    )
    for (const key of Object.keys(empty) as Array<keyof ProfileDetails>) {
      if (typeof stored?.[key] === "string") empty[key] = stored[key]
    }
  } catch {
    /* An unavailable store should not prevent profile editing. */
  }
  return empty
}

const initialFriendsList: FriendItem[] = [
  {
    id: 1,
    name: "Анна Белова",
    handle: "anna_belova",
    avatar: 49,
    info: "Дизайн и визуальные концепты",
    mutual: 18,
    online: true,
  },
  {
    id: 2,
    name: "Марк Соколов",
    handle: "mark_sokolov",
    avatar: 13,
    info: "Эмбиент и саунд-дизайн",
    mutual: 14,
    online: true,
  },
  {
    id: 3,
    name: "София Волкова",
    handle: "sofia_v",
    avatar: 47,
    info: "Типографика и фотография",
    mutual: 25,
    online: false,
  },
  {
    id: 4,
    name: "Даниил Орлов",
    handle: "daniil_orlov",
    avatar: 14,
    info: "Путешествия и горные маршруты",
    mutual: 8,
    online: true,
  },
  {
    id: 5,
    name: "Алиса Романова",
    handle: "alisa_r",
    avatar: 44,
    info: "Архитектура и минимализм",
    mutual: 12,
    online: false,
  },
  {
    id: 6,
    name: "Никита Морозов",
    handle: "nikita_m",
    avatar: 53,
    info: "Интерфейсы и разработка",
    mutual: 31,
    online: true,
  },
  {
    id: 7,
    name: "Елена Ким",
    handle: "elena_kim",
    avatar: 32,
    info: "Современная графика",
    mutual: 9,
    online: false,
  },
  {
    id: 8,
    name: "Виктор Смирнов",
    handle: "viktor_s",
    avatar: 28,
    info: "Плёночная фотография",
    mutual: 16,
    online: true,
  },
]

export default function ProfilePage({
  name,
  onUpdateName,
  posts,
  liked,
  saved,
  onLike,
  onSave,
  onNavigate,
  onSelectRecipient,
  onPublishPost,
  onOpenDonate,
  isOneSubscriber = false,
}: ProfileProps) {
  const [tab, setTab] = useState<"posts" | "friends" | "saved">("posts")
  const [friendsFilter, setFriendsFilter] = useState<"all" | "online">("all")
  const [friendsSearch, setFriendsSearch] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [details, setDetails] = useState(() => readProfile(name))
  const [editDetails, setEditDetails] = useState(details)
  const [editName, setEditName] = useState(name)
  const bio = details.about
  const [draftPost, setDraftPost] = useState("")
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [toast, setToast] = useState("")
  const [selectedFriendModal, setSelectedFriendModal] =
    useState<FriendItem | null>(null)
  useEffect(() => {
    if (details.name.trim()) onUpdateName(details.name)
  }, [details.name, onUpdateName])

  const openEditor = () => {
    onNavigate("Редактировать профиль")
  }

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2200)
  }

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) return
    const next = { ...editDetails, name: editName.trim() }
    setDetails(next)
    onUpdateName(next.name)
    setIsEditing(false)
    try {
      localStorage.setItem("netory-profile-details", JSON.stringify(next))
      triggerToast("Изменения сохранены в этом браузере")
    } catch {
      triggerToast("Профиль обновлён, но браузер не разрешил сохранение")
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    triggerToast("Ссылка скопирована")
  }

  const toggleComment = (id: number) => {
    setExpandedComments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftPost.trim()) return
    onPublishPost(draftPost.trim())
    setDraftPost("")
    triggerToast("Запись опубликована")
  }

  const filteredFriends = initialFriendsList.filter((f) => {
    const matchesQuery = `${f.name} ${f.handle} ${f.info}`
      .toLowerCase()
      .includes(friendsSearch.toLowerCase())
    const matchesFilter =
      friendsFilter === "all" || (friendsFilter === "online" && f.online)
    return matchesQuery && matchesFilter
  })

  return (
    <div className="profile-page-shell">
      {toast && <div className="profile-toast">{toast}</div>}

      {/* Main Profile Header Card (Strict & Elegant) */}
      <div className="profile-hero-card">
        {/* Sleek Minimal Cover */}
        <div className="profile-cover">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt="Обложка профиля"
            className="profile-cover-img"
          />
          <div className="profile-cover-overlay" />
        </div>

        {/* Profile Info Header */}
        <div className="profile-header-content">
          <div className="profile-avatar-row">
            <div
              className={`profile-avatar-wrapper ${
                isOneSubscriber ? "has-one-glow" : ""
              }`}
            >
              <img
                src="https://i.pravatar.cc/200?img=11"
                alt={name}
                className="profile-avatar-img"
              />
              <span className="profile-online-badge" title="В сети" />
            </div>

            <div className="profile-actions-bar">

              <button className="profile-primary-btn" onClick={openEditor}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Редактировать</span>
              </button>

              <button
                className="profile-icon-btn"
                onClick={handleShare}
                title="Поделиться профилем"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>

          {/* User Identity Details */}
          <div className="profile-meta">
            <div className="profile-name-heading">
              <h2>{name} Смирнов</h2>
              {isOneSubscriber && (
                <button
                  className="profile-one-image-button"
                  aria-label="Ваша подписка Netory One"
                  onClick={() => onNavigate("Netory One")}
                >
                  <OneBadge />
                </button>
              )}
              <span
                className="profile-badge-check"
                title="Верифицированный профиль"
              >
                ✓
              </span>
            </div>

            <div className="profile-subline">
              <span className="profile-handle">
                @{name.toLowerCase().replace(/\s+/g, "_")}
              </span>
              <span className="dot-sep">·</span>
              <span className="profile-joined-text">На Netory с 2024 года</span>
            </div>

            <p className="profile-bio-text">{bio}</p>

            {/* Strict Numerical Stats Line with Clickable Friends View */}
            <div className="profile-strict-stats-row">
              <button
                type="button"
                className={`stat-link-btn ${tab === "friends" ? "active" : ""}`}
                onClick={() => setTab("friends")}
              >
                <strong>342</strong> друга
              </button>
              <span className="dot-sep">·</span>
              <span className="stat-text-item">
                <strong>1.4k</strong> подписчиков
              </span>
              <span className="dot-sep">·</span>
              <button
                type="button"
                className={`stat-link-btn ${tab === "posts" ? "active" : ""}`}
                onClick={() => setTab("posts")}
              >
                <strong>{posts.length + 1}</strong> записей
              </button>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="profile-tabs-bar">
          <button
            className={`profile-tab-btn ${tab === "posts" ? "active" : ""}`}
            onClick={() => setTab("posts")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>Записи</span>
            <span className="tab-counter">{posts.length + 1}</span>
          </button>

          <button
            className={`profile-tab-btn ${tab === "friends" ? "active" : ""}`}
            onClick={() => setTab("friends")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Друзья</span>
            <span className="tab-counter">{initialFriendsList.length}</span>
          </button>

          <button
            className={`profile-tab-btn ${tab === "saved" ? "active" : ""}`}
            onClick={() => setTab("saved")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Закладки</span>
            <span className="tab-counter">{saved.length}</span>
          </button>
        </div>
      </div>

      {/* Profile Content Body */}
      <div className="profile-details-grid">
        <section className="profile-detail-card">
          <div className="profile-section-heading">
            <h3>О себе</h3>
            <button onClick={openEditor}>Редактировать</button>
          </div>
          <p className={details.about ? "" : "profile-unfilled"}>
            {details.about ||
              "Расскажите о себе — чем занимаетесь и что вам интересно."}
          </p>
          {details.interests.trim() && (
            <div className="profile-interest-chips">
              {details.interests
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((interest, i) => (
                  <span key={`${interest}-${i}`}>{interest}</span>
                ))}
            </div>
          )}
        </section>
        <section className="profile-detail-card">
          <div className="profile-section-heading">
            <h3>Информация</h3>
            <button onClick={openEditor}>Изменить</button>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Город</dt>
              <dd>{details.city || "Не указан"}</dd>
            </div>
            <div>
              <dt>Занятие</dt>
              <dd>{details.occupation || "Не указано"}</dd>
            </div>
            <div>
              <dt>Сайт</dt>
              <dd>{details.website || "Не указан"}</dd>
            </div>
          </dl>
        </section>
      </div>
      <div className="profile-tab-content">
        {/* ========================================================
            TAB 1: WALL POSTS (EXACT FEED POSTS FROM MAIN PAGE)
        ======================================================== */}
        {tab === "posts" && (
          <div className="profile-feed-container">
            {/* Quick Composer */}
            <section className="composer">
              <div className="composer-input">
                <img
                  className="avatar"
                  src="https://i.pravatar.cc/100?img=11"
                  alt=""
                />
                <input
                  value={draftPost}
                  onChange={(e) => setDraftPost(e.target.value)}
                  placeholder={`Что у вас нового, ${name}?`}
                />
              </div>
              <div className="composer-bottom">
                <div style={{ flex: 1 }} />
                <button
                  className="publish"
                  onClick={handleCreatePost}
                  disabled={!draftPost.trim()}
                  aria-label="Опубликовать"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </section>

            {/* Pinned Post (Styled Exactly Like Main Feed Post) */}
            <article className="post">
              <div className="post-header">
                <img
                  className="avatar"
                  src="https://i.pravatar.cc/100?img=11"
                  alt=""
                />
                <div className="post-author">
                  <strong>
                    {name} Смирнов
                    {isOneSubscriber && <OneBadge />}
                    <span className="verified">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </strong>
                  <span>
                    @{name.toLowerCase().replace(/\s+/g, "_")}
                    <i>·</i>
                    Закреплённая запись
                  </span>
                </div>
                <button
                  className="more"
                  aria-label="Действия с публикацией"
                  onClick={() => triggerToast("Действия с публикацией")}
                >
                  •••
                </button>
              </div>

              <p className="post-text">
                Добро пожаловать в профиль. Здесь публикую концепции
                интерфейсов, заметки о дизайне, фото и рабочие мысли.
              </p>

              <div className="post-image">
                <img
                  src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80"
                  alt="Интерфейс"
                />
                <span className="image-count">1 / 1</span>
              </div>

              <div className="post-actions">
                <button
                  aria-label="Нравится"
                  aria-pressed={liked.includes(9999)}
                  className={liked.includes(9999) ? "liked" : ""}
                  onClick={() => onLike(9999)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={liked.includes(9999) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  {142 + (liked.includes(9999) ? 1 : 0)}
                </button>

                <button
                  aria-expanded={expandedComments.includes(9999)}
                  onClick={() => toggleComment(9999)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z" />
                  </svg>
                  18
                </button>

                <button aria-label="Поделиться" onClick={handleShare}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>

                <span className="post-views">◉ 1,2 тыс.</span>

                <button
                  aria-pressed={saved.includes(9999)}
                  className={saved.includes(9999) ? "saved" : ""}
                  aria-label="Сохранить"
                  onClick={() => onSave(9999)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={saved.includes(9999) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </button>
              </div>

              <PostComments
                isOneSubscriber={isOneSubscriber}
                name={name}
                open={expandedComments.includes(9999)}
                onOpen={() => toggleComment(9999)}
              />
            </article>

            {/* User Posts Feed (Identical to Main Feed Structure) */}
            {posts.map((p) => (
              <article className="post" key={p.id}>
                <div className="post-header">
                  <img
                    className="avatar"
                    src={`https://i.pravatar.cc/100?img=${p.avatar || 11}`}
                    alt=""
                  />
                  <div className="post-author">
                    <strong>
                      {p.name}
                      {p.user === "you" && isOneSubscriber && <OneBadge />}
                      <span className="verified">
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </strong>
                    <span>
                      @{p.user || name.toLowerCase().replace(/\s+/g, "_")}
                      <i>·</i>
                      {p.time}
                    </span>
                  </div>
                  <button
                    className="more"
                    aria-label="Действия с публикацией"
                    onClick={() => onSave(p.id)}
                  >
                    •••
                  </button>
                </div>

                <p className="post-text">{p.text}</p>

                {p.image && (
                  <div className="post-image">
                    <img src={p.image} alt="" />
                    {p.tag && (
                      <span className="location">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        {p.tag}
                      </span>
                    )}
                    <span className="image-count">1 / 1</span>
                  </div>
                )}

                <div className="post-actions">
                  <button
                    aria-label="Нравится"
                    aria-pressed={liked.includes(p.id)}
                    className={liked.includes(p.id) ? "liked" : ""}
                    onClick={() => onLike(p.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={liked.includes(p.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {p.likes + (liked.includes(p.id) ? 1 : 0)}
                  </button>

                  <button
                    aria-expanded={expandedComments.includes(p.id)}
                    onClick={() => toggleComment(p.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z" />
                    </svg>
                    {p.id === 1 ? "24" : "12"}
                  </button>

                  <button aria-label="Поделиться" onClick={handleShare}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>

                  <span className="post-views">
                    ◉ {p.id === 1 ? "1,2 тыс." : "846"}
                  </span>

                  <button
                    aria-pressed={saved.includes(p.id)}
                    className={saved.includes(p.id) ? "saved" : ""}
                    aria-label="Сохранить"
                    onClick={() => onSave(p.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={saved.includes(p.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </button>
                </div>

                <PostComments
                isOneSubscriber={isOneSubscriber}
                  name={name}
                  open={expandedComments.includes(p.id)}
                  onOpen={() => toggleComment(p.id)}
                />
              </article>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 2: FRIENDS VIEW (PROPER, DETAILED & SEARCHABLE)
        ======================================================== */}
        {tab === "friends" && (
          <div className="profile-friends-view">
            <div className="friends-toolbar">
              <div className="friends-filter-tabs">
                <button
                  className={`sub-tab-btn ${
                    friendsFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setFriendsFilter("all")}
                >
                  Все друзья <span>{initialFriendsList.length}</span>
                </button>
                <button
                  className={`sub-tab-btn ${
                    friendsFilter === "online" ? "active" : ""
                  }`}
                  onClick={() => setFriendsFilter("online")}
                >
                  Сейчас в сети{" "}
                  <span>
                    {initialFriendsList.filter((f) => f.online).length}
                  </span>
                </button>
              </div>

              <div className="friends-search-box">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск среди друзей..."
                  value={friendsSearch}
                  onChange={(e) => setFriendsSearch(e.target.value)}
                />
                {friendsSearch && (
                  <button
                    className="btn-clear-search"
                    onClick={() => setFriendsSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Friends Cards Grid */}
            <div className="friends-card-grid">
              {filteredFriends.map((f) => (
                <div className="friend-card" key={f.id}>
                  <div
                    className="friend-avatar-wrap"
                    onClick={() => setSelectedFriendModal(f)}
                  >
                    <img
                      src={`https://i.pravatar.cc/120?img=${f.avatar}`}
                      alt={f.name}
                      className="friend-avatar-img"
                    />
                    {f.online && (
                      <span className="friend-online-dot" title="В сети" />
                    )}
                  </div>

                  <div className="friend-info-col">
                    <strong
                      className="friend-name-link"
                      onClick={() => setSelectedFriendModal(f)}
                    >
                      {f.name}
                    </strong>
                    <span className="friend-handle">@{f.handle}</span>
                    <p className="friend-status-desc">{f.info}</p>
                    <span className="friend-mutual-text">
                      {f.mutual} общих друзей
                    </span>
                  </div>

                  <div className="friend-card-actions">
                    <button
                      className="btn-friend-msg"
                      onClick={() => {
                        onSelectRecipient(f.name)
                        onNavigate("Сообщения")
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z" />
                      </svg>
                      <span>Написать</span>
                    </button>

                    <button
                      className="btn-friend-view"
                      onClick={() => setSelectedFriendModal(f)}
                      title="Просмотреть профиль"
                    >
                      Профиль
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredFriends.length === 0 && (
              <div className="friends-empty-box">
                <p>Никого не найдено по вашему запросу</p>
                <button
                  className="btn-reset-friends-filter"
                  onClick={() => {
                    setFriendsSearch("")
                    setFriendsFilter("all")
                  }}
                >
                  Сбросить поиск
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: SAVED POSTS
        ======================================================== */}
        {tab === "saved" && (
          <div className="profile-feed-container">
            {saved.length === 0 ? (
              <div className="profile-empty-state">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.8"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <h3>Нет сохранённых записей</h3>
                <p>
                  Сохраняйте понравившиеся посты в закладки, чтобы быстро
                  возвращаться к ним.
                </p>
              </div>
            ) : (
              posts
                .filter((p) => saved.includes(p.id))
                .map((p) => (
                  <article className="post" key={p.id}>
                    <div className="post-header">
                      <img
                        className="avatar"
                        src={`https://i.pravatar.cc/100?img=${p.avatar || 11}`}
                        alt=""
                      />
                      <div className="post-author">
                        <strong>{p.name}{p.user === "you" && isOneSubscriber && <OneBadge />}</strong>
                        <span>
                          @{p.user || "alex.morozov"} · {p.time}
                        </span>
                      </div>
                    </div>
                    <p className="post-text">{p.text}</p>
                    {p.image && (
                      <div className="post-image">
                        <img src={p.image} alt="" />
                      </div>
                    )}
                    <div className="post-actions">
                      <button className="saved" onClick={() => onSave(p.id)}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        Сохранено
                      </button>
                    </div>
                  </article>
                ))
            )}
          </div>
        )}
      </div>

      {/* Friend Detail Modal */}
      {selectedFriendModal && (
        <div
          className="profile-modal-overlay"
          onClick={() => setSelectedFriendModal(null)}
        >
          <div
            className="friend-detail-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="friend-detail-header">
              <img
                src={`https://i.pravatar.cc/160?img=${selectedFriendModal.avatar}`}
                alt={selectedFriendModal.name}
                className="friend-modal-avatar"
              />
              <button
                className="modal-close-btn"
                onClick={() => setSelectedFriendModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="friend-detail-body">
              <div className="friend-detail-title">
                <h3>{selectedFriendModal.name}</h3>
                {selectedFriendModal.online && (
                  <span className="online-tag">В сети</span>
                )}
              </div>
              <span className="friend-modal-handle">
                @{selectedFriendModal.handle}
              </span>
              <p className="friend-modal-desc">{selectedFriendModal.info}</p>

              <div className="friend-modal-stats">
                <span>{selectedFriendModal.mutual} общих друзей</span>
                <span>·</span>
                <span>На Netory с 2024</span>
              </div>

              <div className="friend-modal-actions">
                <button
                  className="profile-primary-btn"
                  onClick={() => {
                    onSelectRecipient(selectedFriendModal.name)
                    setSelectedFriendModal(null)
                    onNavigate("Сообщения")
                  }}
                >
                  Написать сообщение
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setSelectedFriendModal(null)}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Strict & Clean) */}
      {isEditing && (
        <div
          className="profile-modal-overlay"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="profile-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-editor-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="profile-editor-title">Редактировать профиль</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditing(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveProfile} className="profile-edit-form">
              <label>
                Имя профиля
                <input
                  type="text"
                  maxLength={80}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </label>

              <label>
                О себе
                <textarea
                  rows={3}
                  value={editDetails.about}
                  maxLength={600}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, about: e.target.value })
                  }
                  placeholder="Коротко о вас и ваших интересах..."
                />
              </label>
              <label>
                Интересы
                <input
                  value={editDetails.interests}
                  maxLength={180}
                  onChange={(e) =>
                    setEditDetails({
                      ...editDetails,
                      interests: e.target.value,
                    })
                  }
                  placeholder="Например: музыка, кино, путешествия"
                />
                <small>Перечислите через запятую</small>
              </label>
              <label>
                Город
                <input
                  value={editDetails.city}
                  maxLength={80}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, city: e.target.value })
                  }
                  placeholder="Где вы живёте"
                />
              </label>
              <label>
                Занятие
                <input
                  value={editDetails.occupation}
                  maxLength={100}
                  onChange={(e) =>
                    setEditDetails({
                      ...editDetails,
                      occupation: e.target.value,
                    })
                  }
                  placeholder="Работа, учёба или любимое дело"
                />
              </label>
              <label>
                Сайт
                <input
                  type="url"
                  value={editDetails.website}
                  maxLength={200}
                  onChange={(e) =>
                    setEditDetails({ ...editDetails, website: e.target.value })
                  }
                  placeholder="https://"
                />
              </label>
              <p className="profile-editor-note">
                Эти данные видны в вашем профиле. Изменения сохраняются только в
                этом браузере.
              </p>

              <div className="modal-buttons-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="profile-primary-btn">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
