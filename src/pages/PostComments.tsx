import { useEffect, useState } from "react"
import OneBadge from "../components/OneBadge"
import CircleRecorderOverlay from "../components/CircleRecorderOverlay"
import { supabase, isSupabaseConfigured } from "../lib/supabase"

interface CommentItem {
  id?: string | number
  author: string
  avatar: string
  text: string
  time: string
  isOne?: boolean
}

export default function PostComments({
  open,
  name,
  onOpen,
  isOneSubscriber = false,
  postId,
}: {
  open: boolean
  name: string
  onOpen: () => void
  isOneSubscriber?: boolean
  postId?: string | number
}) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [draft, setDraft] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recorderOpen, setRecorderOpen] = useState(false)
  const [activeCirclePlay, setActiveCirclePlay] = useState<string | number | null>(null)

  // Загружаем комментарии из Supabase, если передан реальный postId
  useEffect(() => {
    if (!open || !postId || !isSupabaseConfigured || typeof postId !== "string" || postId.startsWith("temp-")) {
      return
    }

    const loadComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*, profiles(full_name, username, avatar_url, is_one_subscriber)")
          .eq("post_id", postId)
          .order("created_at", { ascending: true })
          .limit(50)

        if (!error && data) {
          setComments(
            data.map((c: any) => ({
              id: c.id,
              author: c.profiles?.full_name || c.profiles?.username || "Участник Netory",
              avatar: c.profiles?.avatar_url || "https://i.pravatar.cc/100?img=11",
              text: c.text,
              time: new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isOne: c.profiles?.is_one_subscriber || false,
            }))
          )
        }
      } catch (err) {
        console.error("Ошибка загрузки комментариев:", err)
      }
    }

    loadComments()
  }, [open, postId])

  const addCommentItem = async (text: string) => {
    if (!open) onOpen()

    const newComment: CommentItem = {
      id: "c-" + Date.now(),
      author: name,
      avatar: "https://i.pravatar.cc/100?img=11",
      text,
      time: "только что",
      isOne: isOneSubscriber,
    }

    setComments((prev) => [...prev, newComment])

    // Сохраняем в Supabase при наличии подключения
    if (isSupabaseConfigured && postId && typeof postId === "string" && !postId.startsWith("temp-")) {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("comments").insert({
            post_id: postId,
            user_id: user.id,
            text,
          })
        }
      } catch (err) {
        console.error("Ошибка сохранения комментария в Supabase:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || loading) return
    const text = draft.trim()
    setDraft("")
    addCommentItem(text)
  }

  const handlePublishCircleComment = (clipUrl: string) => {
    addCommentItem(`circle:${clipUrl}`)
  }

  return (
    <div className={`inline-comments ${open ? "expanded" : ""}`}>
      {open && (
        <div className="comment-thread">
          <div className="thread-caption">
            Обсуждение <span>{comments.length}</span>
          </div>
          {!comments.length && (
            <p className="first-comment">
              Начните разговор — поделитесь своими мыслями или запишите видеокружок.
            </p>
          )}
          {comments.map((item, i) => (
            <div className="inline-comment" key={item.id || i}>
              <img
                src={
                  item.avatar && (item.avatar.startsWith("http") || item.avatar.startsWith("data:"))
                    ? item.avatar
                    : "https://i.pravatar.cc/100?img=11"
                }
                alt=""
              />
              <div style={{ flex: 1 }}>
                <strong>
                  {item.author}
                  {item.isOne && <OneBadge />}
                  <small>{item.time}</small>
                </strong>

                {item.text.startsWith("circle:") ? (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        position: "relative",
                        width: "116px",
                        height: "116px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid #9333ea",
                        boxShadow: "0 6px 20px rgba(147, 51, 234, 0.35)",
                        cursor: "pointer",
                        background: "#000",
                      }}
                      onClick={() =>
                        setActiveCirclePlay(activeCirclePlay === (item.id || i) ? null : (item.id || i))
                      }
                      title="Нажмите, чтобы включить звук"
                    >
                      <video
                        src={item.text.replace("circle:", "")}
                        autoPlay
                        loop
                        playsInline
                        muted={activeCirclePlay !== (item.id || i)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          right: "6px",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(4px)",
                          borderRadius: "9999px",
                          padding: "2px 6px",
                          fontSize: "10px",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {activeCirclePlay === (item.id || i) ? "🔊 Звук" : "🔇 Видео"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>{item.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="post-comment" onSubmit={handleSubmit}>
        <img
          src="https://i.pravatar.cc/100?img=11"
          alt=""
          className="comment-author-avatar"
        />
        <div className={`comment-input-box ${isFocused ? "focused" : ""}`}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              if (!open) onOpen()
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Оставьте комментарий или кружок…"
            aria-label="Комментарий"
            className="comment-text-input"
          />

          <button
            type="button"
            aria-label="Записать видеокружок в ответ"
            title="Записать видеокружок в ответ"
            onClick={() => {
              if (!open) onOpen()
              setRecorderOpen(true)
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "17px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
              transition: "transform 0.15s ease",
            }}
          >
            🎥
          </button>

          <button
            type="submit"
            disabled={!draft.trim() || loading}
            aria-label="Отправить комментарий"
            className="comment-send-btn"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>

      {/* Оверлей записи видеокружка для комментария */}
      {recorderOpen && (
        <CircleRecorderOverlay
          isOpen={true}
          onClose={() => setRecorderOpen(false)}
          onPublish={(clipUrl) => {
            setRecorderOpen(false)
            handlePublishCircleComment(clipUrl)
          }}
          userName={name}
        />
      )}
    </div>
  )
}
