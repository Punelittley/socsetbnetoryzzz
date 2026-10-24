import { useState } from "react"
import PostComments from "./PostComments"
import DirectoryCard from "../components/DirectoryCard"
import "../components/DirectoryCard.css"

export interface Community {
  id: string
  name: string
  tag: string
  category: "design" | "travel" | "music" | "tech" | "slow" | "photo"
  description: string
  count: string
  membersCount: number
  onlineCount: number
  coverImage: string
  avatar: number
  activity: string
  friendsInGroup: number
  rules: string
  membersAvatars: number[]
  topics: {
    id: number
    title: string
    author: string
    authorAvatar: number
    replies: number
    lastActive: string
  }[]
  posts: {
    id: number
    author: string
    authorAvatar: number
    time: string
    text: string
    image?: string
    likes: number
    comments: number
  }[]
}

const defaultCommunities: Community[] = [
  {
    id: "design-daily",
    name: "Дизайн каждый день",
    tag: "Дизайн & Арт",
    category: "design",
    description:
      "Сообщество для тех, кто ценит типографику, визуальную культуру, дизайн-системы и современный UI/UX.",
    count: "12 480",
    membersCount: 12480,
    onlineCount: 84,
    coverImage:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    avatar: 49,
    activity: "28 постов на этой неделе",
    friendsInGroup: 6,
    rules:
      "Уважительная критика, отсутствие спама и саморекламы без согласования.",
    membersAvatars: [49, 47, 44],
    topics: [
      {
        id: 1,
        title:
          "Тренды веб-типографики 2025: возвращение антикв и кинетических шрифтов",
        author: "София Волкова",
        authorAvatar: 47,
        replies: 34,
        lastActive: "15 минут назад",
      },
      {
        id: 2,
        title: "Подборка дизайн-систем: как организовать токены в Figma",
        author: "Анна Белова",
        authorAvatar: 49,
        replies: 19,
        lastActive: "2 часа назад",
      },
      {
        id: 3,
        title: "Портфолио-ревью: делимся ссылками и помогаем улучшить кейсы",
        author: "Марк Соколов",
        authorAvatar: 13,
        replies: 52,
        lastActive: "Вчера",
      },
    ],
    posts: [
      {
        id: 101,
        author: "Анна Белова",
        authorAvatar: 49,
        time: "1 час назад",
        text: "Собрали подборку минималистичных интерфейсов с идеальным ритмом белого пространства. Меньше декора — больше ясности и фокуса на главном.",
        image:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        likes: 142,
        comments: 18,
      },
      {
        id: 102,
        author: "София Волкова",
        authorAvatar: 47,
        time: "3 часа назад",
        text: "Утренний опрос для дизайнеров: используете ли вы авто-лейауты для всех компонентов или верстаете сетку вручную?",
        likes: 89,
        comments: 42,
      },
    ],
  },
  {
    id: "travel-wild",
    name: "За пределами города",
    tag: "Путешествия",
    category: "travel",
    description:
      "Маршруты без спешки, горные походы, стоянки у озёр и люди, которые любят сворачивать с привычной дороги.",
    count: "8 960",
    membersCount: 8960,
    onlineCount: 42,
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    avatar: 12,
    activity: "14 новых отчетов",
    friendsInGroup: 4,
    rules:
      "Принцип Leave No Trace (Не оставляй следов), бережное отношение к дикой природе.",
    membersAvatars: [12, 14, 13],
    topics: [
      {
        id: 1,
        title: "Топ-5 пеших маршрутов на 2 дня вокруг Алтая и Кавказа",
        author: "Александр Морозов",
        authorAvatar: 12,
        replies: 41,
        lastActive: "40 минут назад",
      },
      {
        id: 2,
        title: "Какую палатку выбрать для осенних ночевок при +2°C?",
        author: "Даниил Орлов",
        authorAvatar: 14,
        replies: 28,
        lastActive: "Вчера",
      },
    ],
    posts: [
      {
        id: 201,
        author: "Александр Морозов",
        authorAvatar: 12,
        time: "4 часа назад",
        text: "Проснуться в палатке, когда над горным озером ещё стелется туман — бесценное ощущение полного покоя. Горы лечат любую усталость.",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        likes: 204,
        comments: 31,
      },
    ],
  },
  {
    id: "music-inside",
    name: "Музыка внутри",
    tag: "Музыка & Звук",
    category: "music",
    description:
      "Виниловые релизы, эмбиент, авторские плейлисты и аудио-культура для людей с чутким слухом.",
    count: "15 320",
    membersCount: 15320,
    onlineCount: 96,
    coverImage:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    avatar: 13,
    activity: "39 релизов недели",
    friendsInGroup: 7,
    rules:
      "Делимся треками с душой, уважаем вкусы других участников сообщества.",
    membersAvatars: [13, 49, 14],
    topics: [
      {
        id: 1,
        title: "Плейлист для глубокой концентрации и вечернего кодинга",
        author: "Марк Соколов",
        authorAvatar: 13,
        replies: 67,
        lastActive: "5 минут назад",
      },
      {
        id: 2,
        title:
          "Аналоговый винил vs стриминг без потерь: слышите ли вы разницу?",
        author: "Даниил Орлов",
        authorAvatar: 14,
        replies: 43,
        lastActive: "3 часа назад",
      },
    ],
    posts: [
      {
        id: 301,
        author: "Марк Соколов",
        authorAvatar: 13,
        time: "2 часа назад",
        text: "Собрали новый виниловый сет с нотками тёплого лоу-фай джаза и эмбиента. Идеально под вечернюю работу и тишину.",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        likes: 178,
        comments: 26,
      },
    ],
  },
  {
    id: "coding-culture",
    name: "Чистый код & IT",
    tag: "IT & Разработка",
    category: "tech",
    description:
      "Фронтенд, архитектура веб-приложений, современные технологии, пет-проекты и инженерная эстетика.",
    count: "21 400",
    membersCount: 21400,
    onlineCount: 112,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    avatar: 11,
    activity: "52 новых обсуждения",
    friendsInGroup: 6,
    rules: "Делимся реальным опытом, помогаем коллегам без снобизма.",
    membersAvatars: [11, 13, 14],
    topics: [
      {
        id: 1,
        title:
          "Архитектура современных SPA: что важнее — простота или масштабируемость?",
        author: "Алексей",
        authorAvatar: 11,
        replies: 47,
        lastActive: "20 минут назад",
      },
    ],
    posts: [
      {
        id: 601,
        author: "Алексей",
        authorAvatar: 11,
        time: "3 часа назад",
        text: "Лучший код — это код, который легко читать и поддерживать спустя полгода. Простота всегда побеждает чрезмерные абстракции.",
        likes: 164,
        comments: 29,
      },
    ],
  },
  {
    id: "slow-life",
    name: "Медленная жизнь",
    tag: "Лайфстайл",
    category: "slow",
    description:
      "Меньше спешки, больше осознанности. Пространство уюта, чтения книг, домашней эстетики и тёплых разговоров.",
    count: "7 350",
    membersCount: 7350,
    onlineCount: 28,
    coverImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    avatar: 44,
    activity: "Уютный круг общения",
    friendsInGroup: 3,
    rules: "Спокойная атмосфера, никакого достигаторства и токсичности.",
    membersAvatars: [44, 47, 12],
    topics: [
      {
        id: 1,
        title: "Один маленький утренний ритуал, который меняет весь день",
        author: "Елена Ким",
        authorAvatar: 44,
        replies: 38,
        lastActive: "1 час назад",
      },
      {
        id: 2,
        title: "Книги, которые помогают замедлиться и перестать тревожиться",
        author: "Анна Белова",
        authorAvatar: 49,
        replies: 24,
        lastActive: "Вчера",
      },
    ],
    posts: [
      {
        id: 401,
        author: "Елена Ким",
        authorAvatar: 44,
        time: "5 часов назад",
        text: "Заварить свежий кофе в керамической чашке, открыть окно и 10 минут просто слушать утреннюю улицу. Иногда это лучше любого отдыха.",
        image:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        likes: 122,
        comments: 15,
      },
    ],
  },
  {
    id: "film-photo",
    name: "Плёночная фотография",
    tag: "Фотография",
    category: "photo",
    description:
      "Тёплые цвета Kodak Gold, контраст Ilford HP5, винтажные дальномерные камеры и магия ручной проявки.",
    count: "9 180",
    membersCount: 9180,
    onlineCount: 39,
    coverImage:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    avatar: 14,
    activity: "45 кадров за неделю",
    friendsInGroup: 5,
    rules: "Только аутентичная плёнка (35mm / 120 / Polaroid).",
    membersAvatars: [14, 44, 49],
    topics: [
      {
        id: 1,
        title:
          "Любимая пленка для уличных портретов: Portra 400 vs Cinestill 800T",
        author: "Даниил Орлов",
        authorAvatar: 14,
        replies: 39,
        lastActive: "30 минут назад",
      },
    ],
    posts: [
      {
        id: 501,
        author: "Даниил Орлов",
        authorAvatar: 14,
        time: "Вчера",
        text: "Свежие сканы с Olympus OM-1. Зернистость пленки придает кадру ощущение теплого воспоминания, которого никогда не даст цифра.",
        image:
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        likes: 215,
        comments: 17,
      },
    ],
  },
]

export default function GroupsPage({ initialGroupId, authenticated = false, onRequireAuth = () => {} }: {
  initialGroupId?: string
  authenticated?: boolean
  onRequireAuth?: () => void
} = {}) {
  const [communities, setCommunities] =
    useState<Community[]>(defaultCommunities)
  const [filterOnlyJoined, setFilterOnlyJoined] = useState(false)
  const [sortBy, setSortBy] = useState<"popular" | "activity" | "newest">(
    "popular",
  )
  const [query, setQuery] = useState("")
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(authenticated ? [
    "design-daily",
    "music-inside",
    "coding-culture",
  ] : [])
  const [selectedGroup, setSelectedGroup] = useState<Community | null>(() => {
    if (initialGroupId) {
      return (
        defaultCommunities.find(
          (c) => c.id === initialGroupId || c.name === initialGroupId,
        ) || null
      )
    }
    return null
  })
  const [groupViewTab, setGroupViewTab] =
    useState<"wall" | "topics" | "members" | "photos">("wall")
  const [newPostDraft, setNewPostDraft] = useState("")
  const [isCreatingModal, setIsCreatingModal] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createCategory, setCreateCategory] = useState<any>("design")
  const [createDesc, setCreateDesc] = useState("")
  const [toast, setToast] = useState("")
  const [expandedComments, setExpandedComments] = useState<number[]>([])

  const triggerToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2400)
  }

  const toggleJoin = (groupId: string, groupName: string) => {
    if (!authenticated) { onRequireAuth(); return }
    setJoinedGroupIds((prev) => {
      const isJoined = prev.includes(groupId)
      if (isJoined) {
        triggerToast(`Вы вышли из сообщества «${groupName}»`)
        return prev.filter((id) => id !== groupId)
      } else {
        triggerToast(`Вы вступили в сообщество «${groupName}»`)
        return [...prev, groupId]
      }
    })
  }

  const handlePublishToGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated) { onRequireAuth(); return }
    if (!newPostDraft.trim() || !selectedGroup) return
    const newPost = {
      id: Date.now(),
      author: "Вы",
      authorAvatar: 11,
      time: "Только что",
      text: newPostDraft.trim(),
      likes: 1,
      comments: 0,
    }
    const updated = communities.map((c) =>
      c.id === selectedGroup.id ? { ...c, posts: [newPost, ...c.posts] } : c,
    )
    setCommunities(updated)
    setSelectedGroup({
      ...selectedGroup,
      posts: [newPost, ...selectedGroup.posts],
    })
    setNewPostDraft("")
    triggerToast("Запись опубликована на стене сообщества")
  }

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated) { onRequireAuth(); return }
    if (!createName.trim()) return

    const tagMap: Record<string, string> = {
      design: "Дизайн & Арт",
      travel: "Путешествия",
      music: "Музыка & Звук",
      tech: "IT & Разработка",
      slow: "Лайфстайл",
      photo: "Фотография",
    }

    const coverMap: Record<string, string> = {
      design:
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      travel:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      music:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      tech: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      slow: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      photo:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    }

    const newComm: Community = {
      id: `comm-${Date.now()}`,
      name: createName.trim(),
      tag: tagMap[createCategory] || "Клуб",
      category: createCategory,
      description:
        createDesc.trim() || "Новое открытое сообщество единомышленников.",
      count: "1",
      membersCount: 1,
      onlineCount: 1,
      coverImage: coverMap[createCategory] || coverMap.design,
      avatar: 11,
      activity: "Новое сообщество",
      friendsInGroup: 1,
      rules: "Уважение к участникам и дружелюбная атмосфера.",
      membersAvatars: [11],
      topics: [
        {
          id: 1,
          title: `Добро пожаловать в сообщество «${createName.trim()}»!`,
          author: "Вы",
          authorAvatar: 11,
          replies: 0,
          lastActive: "Только что",
        },
      ],
      posts: [
        {
          id: Date.now(),
          author: "Вы",
          authorAvatar: 11,
          time: "Только что",
          text:
            createDesc.trim() ||
            "Приветствуем участников! Делитесь мыслями и интересными материалами.",
          likes: 1,
          comments: 0,
        },
      ],
    }
    setCommunities([newComm, ...communities])
    setJoinedGroupIds((prev) => [...prev, newComm.id])
    setIsCreatingModal(false)
    setCreateName("")
    setCreateDesc("")
    triggerToast(`Сообщество «${newComm.name}» создано`)
  }

  // Filter & Sort
  const filteredCommunities = communities
    .filter((g) => {
      const matchesSearch = `${g.name} ${g.tag} ${g.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesJoined = !filterOnlyJoined || joinedGroupIds.includes(g.id)
      return matchesSearch && matchesJoined
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.membersCount - a.membersCount
      if (sortBy === "activity") return b.onlineCount - a.onlineCount
      return 0
    })

  return (
    <div className="groups-space-wrapper">
      {toast && <div className="groups-toast-pill">{toast}</div>}

      {/* ========================================================
          SINGLE COMMUNITY FULL PAGE VIEW (WHEN CLICKED)
      ======================================================== */}
      {selectedGroup ? (
        <div className="community-full-view">
          {/* Top Bar Navigation */}
          <div className="comm-top-nav-bar">
            <button
              className="comm-back-hub-btn"
              onClick={() => setSelectedGroup(null)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Назад ко всем сообществам</span>
            </button>

          </div>

          {/* Social Panoramic Hero Banner */}
          <div className="comm-social-hero-banner">
            <div className="comm-hero-cover-wrap">
              <img
                src={selectedGroup.coverImage}
                alt={selectedGroup.name}
                className="comm-hero-cover-img"
              />
              <div className="comm-hero-cover-shadow" />
              <span className="comm-hero-tag-badge">{selectedGroup.tag}</span>
            </div>

            <div className="comm-hero-profile-row">
              <div className="comm-hero-avatar-wrap">
                <img
                  src={`https://i.pravatar.cc/160?img=${selectedGroup.avatar}`}
                  alt=""
                />
              </div>

              <div className="comm-hero-identity">
                <div className="comm-title-row">
                  <h2>{selectedGroup.name}</h2>
                  <span
                    className="comm-verified-badge"
                    title="Официальное сообщество"
                  >
                    ✓
                  </span>
                </div>
                <p className="comm-hero-desc">{selectedGroup.description}</p>
                <div className="comm-stats-row">
                  <span>
                    <strong>{selectedGroup.count}</strong> участников
                  </span>
                  <span className="comm-dot">·</span>
                  <span>
                    <strong>{selectedGroup.onlineCount}</strong> онлайн
                  </span>
                  <span className="comm-dot">·</span>
                  <span>
                    <strong>{selectedGroup.friendsInGroup}</strong> ваших друзей
                    в группе
                  </span>
                </div>
              </div>
              <button className={`comm-header-join-btn ${joinedGroupIds.includes(selectedGroup.id) ? "joined" : ""}`} onClick={() => toggleJoin(selectedGroup.id, selectedGroup.name)}>
                {joinedGroupIds.includes(selectedGroup.id) ? "Отписаться" : "Подписаться"}
              </button>
            </div>

            {/* Inner Community Tabs */}
            <div className="comm-inner-tabs-row">
              <button className={`comm-tab-btn ${groupViewTab === "photos" ? "active" : ""}`} onClick={() => setGroupViewTab("photos")}>Фотографии <span>{selectedGroup.posts.filter((post) => post.image).length}</span></button>
              <button
                className={`comm-tab-btn ${
                  groupViewTab === "wall" ? "active" : ""
                }`}
                onClick={() => setGroupViewTab("wall")}
              >
                Стена сообщества <span>{selectedGroup.posts.length}</span>
              </button>
              <button
                className={`comm-tab-btn ${
                  groupViewTab === "topics" ? "active" : ""
                }`}
                onClick={() => setGroupViewTab("topics")}
              >
                Обсуждения <span>{selectedGroup.topics.length}</span>
              </button>
              <button
                className={`comm-tab-btn ${
                  groupViewTab === "members" ? "active" : ""
                }`}
                onClick={() => setGroupViewTab("members")}
              >
                Участники <span>{selectedGroup.count}</span>
              </button>
            </div>
          </div>

          <div className="community-overview">
            <section className="community-info-card">
              <span className="detail-eyebrow">О СООБЩЕСТВЕ</span>
              <h3>Место, где есть свои</h3>
              <p>{selectedGroup.description}</p>
              <p className="community-rules"><strong>Правила общения</strong><br />{selectedGroup.rules}</p>
              <small>Демонстрационное сообщество · подписки действуют в текущей сессии</small>
            </section>
            <div className="community-quick-cards">
              <button onClick={() => setGroupViewTab("members")}><strong>{selectedGroup.count}</strong><span>Участники</span><div className="community-avatar-stack">{selectedGroup.membersAvatars.slice(0, 5).map((id, i) => <img key={i} src={`https://i.pravatar.cc/80?img=${id}`} alt="" />)}</div></button>
              <button onClick={() => setGroupViewTab("topics")}><strong>{selectedGroup.topics.length}</strong><span>Обсуждения</span><small>{selectedGroup.topics[0]?.title || "Пока нет обсуждений"}</small></button>
              <button onClick={() => setGroupViewTab("wall")}><strong>{selectedGroup.posts.length}</strong><span>Публикации на стене</span><small>Мысли, находки и новости сообщества</small></button>
            </div>
          </div>
          {groupViewTab === "photos" && <section className="community-photo-section"><h3>Фотографии сообщества</h3><div className="community-photo-grid">{selectedGroup.posts.filter((post) => post.image).map((post) => <a key={post.id} href={post.image} target="_blank" rel="noreferrer"><img src={post.image} alt={`Фото из публикации ${post.author}`} /></a>)}</div>{!selectedGroup.posts.some((post) => post.image) && <p>В публикациях пока нет фотографий.</p>}</section>}

          {/* TAB 1: WALL */}
          {groupViewTab === "wall" && (
            <div className="comm-wall-section">
              {/* Post Composer */}
              <form
                className="comm-post-composer"
                onSubmit={handlePublishToGroup}
              >
                <div className="composer-row">
                  <img
                    src="https://i.pravatar.cc/100?img=11"
                    alt="Вы"
                    className="composer-user-avatar"
                  />
                  <textarea
                    rows={2}
                    placeholder={`Напишите что-нибудь на стене «${selectedGroup.name}»...`}
                    value={newPostDraft}
                    onChange={(e) => setNewPostDraft(e.target.value)}
                  />
                </div>
                <div className="composer-footer">
                  <span className="composer-rules-hint">
                    Правила: {selectedGroup.rules}
                  </span>
                  <button
                    type="submit"
                    className="composer-submit-btn"
                    disabled={!newPostDraft.trim()}
                  >
                    Опубликовать
                  </button>
                </div>
              </form>

              {/* Feed of Posts */}
              <div className="comm-posts-feed">
                {selectedGroup.posts.map((post) => (
                  <article className="post" key={post.id}>
                    <div className="post-header">
                      <img
                        src={`https://i.pravatar.cc/100?img=${post.authorAvatar}`}
                        alt=""
                        className="avatar"
                      />
                      <div className="post-author">
                        <strong>
                          {post.author}
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
                        <span>{post.time} · Запись на стене</span>
                      </div>
                      <button className="more" aria-label="Действия">
                        •••
                      </button>
                    </div>

                    <p className="post-text">{post.text}</p>

                    {post.image && (
                      <div className="post-image">
                        <img src={post.image} alt="" />
                      </div>
                    )}

                    <div className="post-actions">
                      <button
                        className="liked"
                        onClick={() => triggerToast("Вам нравится эта запись")}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        {post.likes}
                      </button>

                      <button
                        onClick={() =>
                          setExpandedComments((prev) =>
                            prev.includes(post.id)
                              ? prev.filter((x) => x !== post.id)
                              : [...prev, post.id],
                          )
                        }
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
                        {post.comments}
                      </button>

                      <button
                        onClick={() =>
                          triggerToast("Ссылка на публикацию скопирована")
                        }
                      >
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
                    </div>

                    <PostComments
                      name="Вы"
                      open={expandedComments.includes(post.id)}
                      onOpen={() =>
                        setExpandedComments((prev) =>
                          prev.includes(post.id)
                            ? prev.filter((x) => x !== post.id)
                            : [...prev, post.id],
                        )
                      }
                    />
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TOPICS */}
          {groupViewTab === "topics" && (
            <div className="comm-topics-section">
              <div className="topics-heading-row">
                <h3>Темы и обсуждения сообщества</h3>
                <button
                  className="btn-add-topic"
                  onClick={() => triggerToast("Создание новой темы")}
                >
                  + Новая тема
                </button>
              </div>

              <div className="topics-cards-stack">
                {selectedGroup.topics.map((topic, i) => (
                  <div
                    className="topic-list-card"
                    key={topic.id}
                    onClick={() =>
                      triggerToast(`Тема «${topic.title}» открыта`)
                    }
                  >
                    <span className="topic-num-pill">0{i + 1}</span>
                    <div className="topic-copy">
                      <h4>{topic.title}</h4>
                      <small>
                        Автор: {topic.author} · Активность: {topic.lastActive}
                      </small>
                    </div>
                    <span className="topic-replies-pill">
                      {topic.replies} ответов
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERS */}
          {groupViewTab === "members" && (
            <div className="comm-members-section">
              <div className="members-heading-row">
                <h3>Участники сообщества</h3>
                <span className="members-online-badge">
                  В сети: {selectedGroup.onlineCount}
                </span>
              </div>

              <div className="members-two-col-grid">
                {[49, 12, 13, 47, 44, 14, 11, 28].map((id, i) => (
                  <div className="comm-member-item-card" key={id}>
                    <img src={`https://i.pravatar.cc/100?img=${id}`} alt="" />
                    <div className="member-meta">
                      <strong>
                        {
                          [
                            "Анна Белова",
                            "Александр Морозов",
                            "Марк Соколов",
                            "София Волкова",
                            "Елена Ким",
                            "Даниил Орлов",
                            "Алексей Смирнов",
                            "Виктор",
                          ][i]
                        }
                      </strong>
                      <small>
                        {i === 0
                          ? "Администратор"
                          : i < 3
                            ? "Модератор"
                            : "Участник"}
                      </small>
                    </div>
                    <button
                      className="btn-member-message"
                      onClick={() => triggerToast("Переход в диалог...")}
                    >
                      Написать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
            MAIN SOCIAL NETWORK COMMUNITIES HUB
        ======================================================== */
        <div className="groups-main-hub directory-page">
          {/* Top Control Bar: Search + Create Button */}
          {/* Top Control Bar: Search + Subscriptions + Sorting + Create Button */}
          <div className="directory-toolbar">
            <div className="groups-search-input-box">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Поиск сообществ по названию, теме или тегу..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="btn-clear-query"
                  onClick={() => setQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="groups-toolbar-actions-cluster">
              <button
                className={`filter-toggle-joined ${
                  filterOnlyJoined ? "active" : ""
                }`}
                onClick={() => setFilterOnlyJoined(!filterOnlyJoined)}
              >
                Мои подписки ({joinedGroupIds.length})
              </button>

              <select
                className="groups-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
              >
                <option value="popular">По популярности</option>
                <option value="activity">По активности</option>
              </select>

              <button
                className="btn-social-create-community"
                onClick={() => authenticated ? setIsCreatingModal(true) : onRequireAuth()}
              >
                <span className="btn-plus-icon">+</span>
                <span className="btn-text">Создать сообщество</span>
              </button>
            </div>
          </div>

          {/* Communities Cards Grid (Authentic Social Media Look) */}
          <div className="directory-grid">
            {filteredCommunities.map((community) => {
              const isJoined = joinedGroupIds.includes(community.id)
              return (
                <DirectoryCard
                  key={community.id}
                  title={community.name}
                  description={community.description}
                  avatar={`https://i.pravatar.cc/140?img=${community.avatar}`}
                  cover={community.coverImage}
                  category={community.tag}
                  meta={`${community.count} участников · ${community.onlineCount} в сети`}
                  social={
                    community.friendsInGroup > 0
                      ? `${community.friendsInGroup} ваших друзей подписаны`
                      : `${community.count} участников`
                  }
                  selected={isJoined}
                  actionLabel={isJoined ? "Отписаться" : "Подписаться"}
                  onAction={() => toggleJoin(community.id, community.name)}
                  onOpen={() => setSelectedGroup(community)}
                  openLabel="Открыть"
                />
              )
            })}
          </div>

          {/* Empty State */}
          {!filteredCommunities.length && (
            <div className="groups-empty-state-box">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
              <button
                className="btn-reset-search"
                onClick={() => {
                  setQuery("")
                  setFilterOnlyJoined(false)
                }}
              >
                Сбросить поиск
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          CREATE COMMUNITY MODAL
      ======================================================== */}
      {isCreatingModal && (
        <div
          className="create-community-backdrop"
          onClick={() => setIsCreatingModal(false)}
        >
          <div
            className="create-community-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Создать новое сообщество</h3>
              <button
                className="modal-close-cross"
                onClick={() => setIsCreatingModal(false)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleCreateCommunity}
              className="create-community-form"
            >
              <label>
                Название сообщества
                <input
                  required
                  placeholder="Например: Плёночная эстетика, IT клуб..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </label>

              <label>
                Категория
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                >
                  <option value="design">Дизайн & Арт</option>
                  <option value="travel">Путешествия & Горы</option>
                  <option value="music">Музыка & Звук</option>
                  <option value="tech">IT & Разработка</option>
                  <option value="slow">Лайфстайл & Уют</option>
                  <option value="photo">Фотография</option>
                </select>
              </label>

              <label>
                Описание
                <textarea
                  rows={3}
                  placeholder="О чем ваше сообщество? Кого вы хотите объединить?"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                />
              </label>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsCreatingModal(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-create-submit"
                  disabled={!createName.trim()}
                >
                  Создать сообщество
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
