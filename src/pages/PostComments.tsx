import { useEffect, useState } from "react"
import OneBadge from "../components/OneBadge"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || loading) return

    const text = draft.trim()
    setDraft("")
    if (!open) onOpen()

    const newComment: CommentItem = {
      author: name,
      avatar: "https://i.pravatar.cc/100?img=11",
      text,
      time: "только что",
      isOne: isOneSubscriber,
    }

    setComments((prev) => [...prev, newComment])

    // Если подключен Supabase и это пост из БД — сохраняем
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
        console.error("Ошибка добавления комментария в Supabase:", err)
      } finally {
        setLoading(false)
      }
    }
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
              Начните разговор — поделитесь своими мыслями.
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
              <div>
                <strong>
                  {item.author}
                  {item.isOne && <OneBadge />}
                  <small>{item.time}</small>
                </strong>
                <p>{item.text}</p>
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
            placeholder="Оставьте немного тепла…"
            aria-label="Комментарий"
            className="comment-text-input"
          />
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
    </div>
  )
}
