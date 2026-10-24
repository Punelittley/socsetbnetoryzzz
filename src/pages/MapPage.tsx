import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { playStickerSound } from "../lib/vibeAudio"
import "./MapPage.css"

interface FriendLocation {
  id: number | string
  name: string
  avatar: string
  lat: number
  lng: number
  status: string
  emoji: string
  lastActive: string
  track?: string
}

interface MeetupPoint {
  id: string
  name: string
  category: string
  emoji: string
  lat: number
  lng: number
  creator: string
  attendees: number
  expiresIn: string
}

const initialFriends: FriendLocation[] = [
  {
    id: 1,
    name: "Анна Белова",
    avatar: "https://i.pravatar.cc/100?img=49",
    lat: 55.759,
    lng: 37.618,
    status: "Пьёт фильтр-кофе на Патриарших",
    emoji: "☕",
    lastActive: "2 мин назад",
  },
  {
    id: 2,
    name: "Марк Соколов",
    avatar: "https://i.pravatar.cc/100?img=13",
    lat: 55.751,
    lng: 37.602,
    status: "Слушает Ambient Dreams в Netory",
    emoji: "🎧",
    lastActive: "сейчас",
    track: "Ocean Ambient Dream",
  },
  {
    id: 3,
    name: "Александр Морозов",
    avatar: "https://i.pravatar.cc/100?img=12",
    lat: 55.744,
    lng: 37.635,
    status: "Кодит новый релиз Netory",
    emoji: "💻",
    lastActive: "15 мин назад",
  },
  {
    id: 4,
    name: "Елена Ким",
    avatar: "https://i.pravatar.cc/100?img=44",
    lat: 55.728,
    lng: 37.601,
    status: "Гуляет в Парке Горького",
    emoji: "🌿",
    lastActive: "5 мин назад",
  },
  {
    id: 5,
    name: "София Волкова",
    avatar: "https://i.pravatar.cc/100?img=47",
    lat: 55.768,
    lng: 37.595,
    status: "Рисует иллюстрации",
    emoji: "🎨",
    lastActive: "сейчас",
  },
]

const initialMeetups: MeetupPoint[] = [
  {
    id: "m-1",
    name: "Движ на веранде Сёрф",
    category: "coffee",
    emoji: "☕",
    lat: 55.756,
    lng: 37.625,
    creator: "Анна Белова",
    attendees: 4,
    expiresIn: "ещё 2 ч",
  },
  {
    id: "m-2",
    name: "Чилл с гитарой у набережной",
    category: "music",
    emoji: "🎵",
    lat: 55.738,
    lng: 37.606,
    creator: "Марк Соколов",
    attendees: 6,
    expiresIn: "ещё 3 ч",
  },
]

const stickers = [
  { id: "ping", icon: "⚡", label: "Ты где?", sound: "ping" as const },
  { id: "bump", icon: "🔥", label: "Разрыв", sound: "bump" as const },
  { id: "coffee", icon: "☕", label: "Го кофе", sound: "coffee" as const },
  { id: "rocket", icon: "🚀", label: "Лечу", sound: "rocket" as const },
  { id: "heart", icon: "💖", label: "Тепло", sound: "heart" as const },
]

export default function MapPage({
  userName,
  onNavigate,
  onSelectRecipient,
}: {
  userName: string
  onNavigate: (page: string) => void
  onSelectRecipient: (name: string) => void
}) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletInstance = useRef<L.Map | null>(null)
  const markersLayer = useRef<L.LayerGroup | null>(null)

  const [filter, setFilter] = useState<"all" | "friends" | "meetups">("all")
  const [selectedFriend, setSelectedFriend] = useState<FriendLocation | null>(null)
  const [flyingSticker, setFlyingSticker] = useState<{
    icon: string
    x: number
    y: number
  } | null>(null)
  const [toastMessage, setToastMessage] = useState("")

  const [meetupModalOpen, setMeetupModalOpen] = useState(false)
  const [newMeetupTitle, setNewMeetupTitle] = useState("")
  const [newMeetupCategory, setNewMeetupCategory] = useState("☕")
  const [meetups, setMeetups] = useState<MeetupPoint[]>(initialMeetups)

  const [myStatus, setMyStatus] = useState("На волне Netory ⚡")
  const [myCoordinates] = useState<[number, number]>([55.753, 37.62])

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return

    const map = L.map(mapRef.current, {
      center: myCoordinates,
      zoom: 13,
      zoomControl: false,
    })

    // Стильные минималистичные тайлы CartoDB Positron
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    markersLayer.current = layerGroup
    leafletInstance.current = map

    return () => {
      map.remove()
      leafletInstance.current = null
    }
  }, [myCoordinates])

  // Отрисовка маркеров при изменении фильтров
  useEffect(() => {
    if (!leafletInstance.current || !markersLayer.current) return
    const layer = markersLayer.current
    layer.clearLayers()

    // 1. Маркер текущего пользователя ("Вы")
    const myIcon = L.divIcon({
      className: "custom-map-friend-marker",
      html: `
        <div class="friend-marker-bubble" style="border-color: #9333ea; box-shadow: 0 0 25px rgba(147, 51, 234, 0.6);">
          <img src="https://i.pravatar.cc/100?img=11" class="friend-marker-avatar" alt="Вы" />
          <div class="friend-marker-glow" style="border-color: #9333ea;"></div>
          <div class="friend-marker-status-tag" style="background: #7c3aed;">Вы · ${myStatus}</div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    })
    L.marker(myCoordinates, { icon: myIcon }).addTo(layer)

    // 2. Маркеры друзей
    if (filter === "all" || filter === "friends") {
      initialFriends.forEach((friend) => {
        const friendIcon = L.divIcon({
          className: "custom-map-friend-marker",
          html: `
            <div class="friend-marker-bubble">
              <img src="${friend.avatar}" class="friend-marker-avatar" alt="${friend.name}" />
              <div class="friend-marker-glow"></div>
              <div class="friend-marker-status-tag">${friend.emoji} ${friend.status}</div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        })

        const marker = L.marker([friend.lat, friend.lng], { icon: friendIcon })
        marker.on("click", () => {
          setSelectedFriend(friend)
        })
        marker.addTo(layer)
      })
    }

    // 3. Маркеры точек тусовок
    if (filter === "all" || filter === "meetups") {
      meetups.forEach((m) => {
        const meetupIcon = L.divIcon({
          className: "custom-map-meetup-marker",
          html: `
            <div class="meetup-marker-bubble">
              <div class="meetup-marker-halo"></div>
              <span>${m.emoji}</span>
              <div class="friend-marker-status-tag" style="background: #9333ea;">
                ${m.name} (${m.attendees} чел)
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })

        const marker = L.marker([m.lat, m.lng], { icon: meetupIcon })
        marker.on("click", () => {
          setToastMessage(`Точка тусовки: «${m.name}». Создатель: ${m.creator}`)
          setTimeout(() => setToastMessage(""), 3500)
        })
        marker.addTo(layer)
      })
    }
  }, [filter, meetups, myStatus, myCoordinates])

  // Отправка стикера (Стикер-бомбинг)
  const handleSendSticker = (sticker: (typeof stickers)[0]) => {
    if (!selectedFriend) return

    playStickerSound(sticker.sound)

    // Анимация летящего стикера
    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) {
      setFlyingSticker({
        icon: sticker.icon,
        x: rect.width / 2,
        y: rect.height / 2,
      })
      setTimeout(() => setFlyingSticker(null), 1200)
    }

    setToastMessage(`Взрывной стикер ${sticker.icon} ${sticker.label} отправлен ${selectedFriend.name}!`)
    setTimeout(() => setToastMessage(""), 3000)
  }

  // Создание новой точки сбора
  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMeetupTitle.trim()) return

    const newPoint: MeetupPoint = {
      id: `m-${Date.now()}`,
      name: newMeetupTitle.trim(),
      category: "custom",
      emoji: newMeetupCategory,
      lat: myCoordinates[0] + (Math.random() - 0.5) * 0.015,
      lng: myCoordinates[1] + (Math.random() - 0.5) * 0.015,
      creator: userName,
      attendees: 1,
      expiresIn: "ещё 3 ч",
    }

    setMeetups((prev) => [newPoint, ...prev])
    setMeetupModalOpen(false)
    setNewMeetupTitle("")
    setToastMessage(`Точка «${newPoint.name}» появилась на карте Вайба!`)
    setTimeout(() => setToastMessage(""), 3500)
  }

  return (
    <div className="vibe-map-container">
      {/* Верхняя панель управления */}
      <div className="map-top-bar">
        <div className="map-brand-badge">
          <div className="map-live-dot" />
          <strong>Карта Вайба</strong>
          <span>LIVE</span>
        </div>

        <div className="map-controls-group">
          <button
            className={`map-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Все
          </button>
          <button
            className={`map-filter-btn ${filter === "friends" ? "active" : ""}`}
            onClick={() => setFilter("friends")}
          >
            Друзья ({initialFriends.length})
          </button>
          <button
            className={`map-filter-btn ${filter === "meetups" ? "active" : ""}`}
            onClick={() => setFilter("meetups")}
          >
            Точки сбора ({meetups.length})
          </button>
          <button
            className="map-action-btn primary"
            onClick={() => setMeetupModalOpen(true)}
          >
            + Точка сбора
          </button>
        </div>
      </div>

      {/* Всплывающий стикер-эффект */}
      {flyingSticker && (
        <div
          className="flying-sticker-effect"
          style={{ left: `${flyingSticker.x}px`, top: `${flyingSticker.y}px` }}
        >
          {flyingSticker.icon}
        </div>
      )}

      {/* Тост уведомление */}
      {toastMessage && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: "9999px",
            fontSize: "0.88rem",
            fontWeight: 600,
            zIndex: 2000,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Панель стикер-бомбинга при выборе друга (как в Blink) */}
      {selectedFriend && (
        <div className="sticker-bomb-card">
          <div className="sticker-target-header">
            <div className="sticker-target-info">
              <img
                src={selectedFriend.avatar}
                alt=""
                className="sticker-target-avatar"
              />
              <div>
                <div className="sticker-target-name">{selectedFriend.name}</div>
                <div className="sticker-target-status">
                  {selectedFriend.emoji} {selectedFriend.status} · {selectedFriend.lastActive}
                </div>
              </div>
            </div>
            <button
              className="sticker-close-btn"
              onClick={() => setSelectedFriend(null)}
            >
              ✕
            </button>
          </div>

          <div className="sticker-tray">
            {stickers.map((s) => (
              <button
                key={s.id}
                className="sticker-item-btn"
                onClick={() => handleSendSticker(s)}
                title={s.label}
              >
                <span className="sticker-item-icon">{s.icon}</span>
                <span className="sticker-item-label">{s.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => {
                onSelectRecipient(selectedFriend.name)
                onNavigate("Сообщения")
              }}
            >
              💬 Написать в чат
            </button>
            {selectedFriend.track && (
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#7c3aed",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  onNavigate("Музыка")
                  setToastMessage(`Включаем трек: ${selectedFriend.track}`)
                }}
              >
                🎧 Слушать вместе
              </button>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно создания точки сбора */}
      {meetupModalOpen && (
        <div className="meetup-modal-backdrop">
          <form className="meetup-modal-box" onSubmit={handleCreateMeetup}>
            <h3>📍 Поставить точку сбора</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Друзья рядом увидят светящуюся метку и смогут подтянуться к вам.
            </p>

            <div className="meetup-cat-picker">
              {["☕", "🍕", "🎵", "💻", "🛹"].map((em) => (
                <button
                  type="button"
                  key={em}
                  className={`meetup-cat-btn ${newMeetupCategory === em ? "selected" : ""}`}
                  onClick={() => setNewMeetupCategory(em)}
                >
                  {em}
                </button>
              ))}
            </div>

            <input
              className="meetup-modal-input"
              required
              placeholder="Например: Пьём чай на веранде, кто рядом?"
              value={newMeetupTitle}
              onChange={(e) => setNewMeetupTitle(e.target.value)}
              maxLength={60}
            />

            <div className="meetup-modal-actions">
              <button
                type="button"
                className="map-filter-btn"
                onClick={() => setMeetupModalOpen(false)}
              >
                Отмена
              </button>
              <button type="submit" className="map-action-btn primary">
                Запустить точку ⚡
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Контейнер рендеринга Leaflet */}
      <div ref={mapRef} className="map-viewport" />
    </div>
  )
}
