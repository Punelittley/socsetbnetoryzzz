import { useState } from "react"
import "./SettingsPage.css"

const fields = [
  ["name", "Имя", "text"],
  ["city", "Город", "text"],
  ["occupation", "Занятие", "text"],
  ["website", "Сайт", "url"],
  ["interests", "Интересы через запятую", "text"],
] as const

export default function SettingsPage({ name, editing, onUpdateName, onNavigate }: {
  name: string
  editing: boolean
  onUpdateName: (name: string) => void
  onNavigate: (route: string) => void
}) {
  const [profile, setProfile] = useState<Record<string, string>>(() => {
    const fallback = { name, city: "", occupation: "", website: "", interests: "", about: "" }
    try {
      const stored = JSON.parse(localStorage.getItem("netory-profile-details") || "{}")
      return Object.fromEntries(Object.entries(fallback).map(([key, value]) => [key, typeof stored[key] === "string" ? stored[key] : value]))
    } catch { return fallback }
  })
  const [status, setStatus] = useState("")
  return (
    <section className="account-page">
      <header className="account-heading"><span className="detail-eyebrow">{editing ? "ВАШЕ ПРОСТРАНСТВО" : "АККАУНТ"}</span><h1>{editing ? "Расскажите о себе." : "Настройки"}</h1><p>{editing ? "Пусть ваша страница будет такой же настоящей, как вы." : "Личные данные и параметры вашего аккаунта."}</p></header>
      <nav className="account-tabs" aria-label="Настройки аккаунта"><button className={!editing ? "is-active" : ""} onClick={() => onNavigate("Настройки")}>Общее</button><button className={editing ? "is-active" : ""} onClick={() => onNavigate("Редактировать профиль")}>Личная страница</button></nav>
      {editing ? <><div className="account-profile-preview"><div className="account-preview-art" /><img src="https://i.pravatar.cc/160?img=11" alt="Ваш профиль" /><div><span>ПРЕДПРОСМОТР СТРАНИЦЫ</span><h2>{profile.name || "Ваше имя"}</h2><p>{profile.occupation || "То, что вас вдохновляет"}{profile.city ? ` · ${profile.city}` : ""}</p></div><button onClick={() => onNavigate("Профиль")}>Моя страница ↗</button></div><form className="account-panel account-form" onSubmit={e => {
        e.preventDefault()
        try {
          const next = { ...profile, name: profile.name.trim() }
          localStorage.setItem("netory-profile-details", JSON.stringify(next))
          onUpdateName(next.name)
          setStatus("Профиль сохранён в этом браузере.")
        } catch { setStatus("Не удалось сохранить изменения. Хранилище браузера недоступно.") }
      }}>
        <h2>Основная информация <small>01 / Личная страница</small></h2>
        {fields.map(([key, label, type]) => <label key={key}>{label}<input type={type} required={key === "name"} maxLength={key === "name" ? 80 : 240} pattern={key === "name" ? ".*\\S.*" : undefined} value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} /></label>)}
        <label className="account-wide">О себе<textarea maxLength={2000} rows={5} value={profile.about} onChange={e => setProfile({ ...profile, about: e.target.value })} /></label>
        <div className="account-form-footer"><button className="primary" type="submit">Сохранить изменения</button><button type="button" onClick={() => onNavigate("Профиль")}>Открыть профиль</button></div>
        <p className="account-wide account-note" role="status">{status || "Изменения сохраняются только на этом устройстве. Серверное хранение пока не подключено."}</p>
      </form></> : <>
        <section className="account-panel"><h2>Профиль</h2><div className="account-row"><div><strong>{name}</strong><p>Имя, описание, город, интересы и сайт</p></div><button onClick={() => onNavigate("Редактировать профиль")}>Редактировать</button></div></section>
        <section className="account-panel"><h2>Безопасность и конфиденциальность</h2><div className="account-row"><div><strong>Пароль и восстановление доступа</strong><p>Будут доступны после подключения серверной авторизации.</p></div><span>Не подключено</span></div><div className="account-row"><div><strong>Приватность и блокировки</strong><p>Серверные ограничения доступа ещё не работают.</p></div><span>Не подключено</span></div></section>
        <section className="account-panel"><h2>О текущей версии</h2><p className="account-note">Это демонстрационный интерфейс. Аккаунты, сообщения, счётчики и подписки не отражают реальные данные пользователей. Оплата отключена.</p></section>
      </>}
    </section>
  )
}
