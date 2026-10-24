import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

type Props = {
  registration: boolean
  onNavigate: (page: string) => void
  onComplete: (name?: string) => void
}

export default function AuthPage({ registration, onNavigate, onComplete }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successInfo, setSuccessInfo] = useState('')

  const strength =
    Number(password.length >= 6) +
    Number(password.length >= 10) +
    Number(/[0-9]/.test(password) && /[a-zа-я]/i.test(password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessInfo('')

    if (!isSupabaseConfigured) {
      // Режим офлайн / локальный демо
      onComplete(registration ? name.trim() : undefined)
      return
    }

    setLoading(true)
    try {
      if (registration) {
        const trimmedName = name.trim() || 'Пользователь'
        const username =
          trimmedName.toLowerCase().replace(/[\s\W]+/g, '_') ||
          'user_' + Date.now().toString(36)

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: trimmedName,
              username,
            },
          },
        })

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('Пользователь с такой электронной почтой уже существует. Попробуйте войти.')
          }
          if (error.message.toLowerCase().includes('rate limit')) {
            throw new Error('Превышен лимит отправки подтверждающих писем Supabase. Отключите «Confirm email» в настройках Supabase (Authentication -> Providers -> Email), чтобы создавать аккаунты мгновенно.')
          }
          throw error
        }

        if (data.session) {
          onComplete(trimmedName)
        } else if (data.user && !data.session) {
          // Supabase может требовать подтверждения почты, если включена опция
          setSuccessInfo('Регистрация прошла успешно! Если требуется подтверждение, проверьте почту.')
          setTimeout(() => onComplete(trimmedName), 2000)
        } else {
          onComplete(trimmedName)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Неверная почта или пароль. Пожалуйста, проверьте введённые данные.')
          }
          throw error
        }

        let userDisplayName =
          data.user?.user_metadata?.full_name ||
          data.user?.user_metadata?.username ||
          email.split('@')[0]

        // Проверяем таблицу profiles
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', data.user.id)
            .maybeSingle()

          if (profile?.full_name) {
            userDisplayName = profile.full_name
          }
        } catch {
          // игнорируем ошибку чтения профиля
        }

        onComplete(userDisplayName)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Произошла непредвиденная ошибка при авторизации.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="entry-experience">
      <div className="entry-visual">
        <div className="entry-visual-top">
          <span className="entry-mark">
            <i />
            <i />
            <i />
          </span>
          <span>ЛЮДИ. МОМЕНТЫ. ВЫ.</span>
        </div>
        <div className="entry-collage">
          <div className="entry-orbit orbit-a" />
          <div className="entry-orbit orbit-b" />
          <div className="entry-note">
            <span>маленькое напоминание</span>
            <p>
              Быть собой —<br />
              уже достаточно.
            </p>
            <div>
              сохраните это чувство <span>♡</span>
            </div>
          </div>
          <div className="entry-mini-message">
            <img src="https://i.pravatar.cc/100?img=49" alt="" />
            <div>
              <strong>Анна</strong>
              <p>Кажется, мы на одной волне.</p>
            </div>
            <span>сейчас</span>
          </div>
          <div className="entry-mood">
            <span>≈</span>
            <strong>Свои находятся.</strong>
            <div>
              {[13, 47, 44, 12].map((id) => (
                <img src={`https://i.pravatar.cc/100?img=${id}`} key={id} alt="" />
              ))}
              <span>и вы тоже</span>
            </div>
          </div>
          <span className="entry-flower">✳</span>
        </div>
        <div className="entry-visual-bottom">
          <p>
            Не идеальная картинка.<br />
            <span>Настоящая связь.</span>
          </p>
          <div>
            <span>01</span>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <section className="entry-form-panel">
        <div className="entry-panel-top">
          <button onClick={() => onNavigate('Лента')}>← В ленту</button>
          <span>
            {registration ? 'Уже с нами?' : 'Впервые здесь?'}
            <button
              onClick={() => {
                setErrorMessage('')
                setSuccessInfo('')
                onNavigate(registration ? 'Войти' : 'Регистрация')
              }}
            >
              {registration ? 'Войти' : 'Создать аккаунт'} ↗
            </button>
          </span>
        </div>
        <div className="entry-form-content" key={registration ? 'register' : 'login'}>
          <div className="entry-step">
            <span />
            {registration ? 'ДАВАЙТЕ ЗНАКОМИТЬСЯ' : 'ХОРОШО, ЧТО ВЫ ЗДЕСЬ'}
          </div>
          <div className="entry-title">
            {registration ? 'Ваше место\nсреди своих.' : 'С возвращением\nв свой круг.'}
            <span>↗</span>
          </div>
          <p className="entry-description">
            {registration
              ? 'Создайте аккаунт и добавьте немного себя.'
              : 'Продолжим с того места, где остановились.'}
          </p>

          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                fontSize: '0.9rem',
                marginBottom: '1rem',
              }}
            >
              {errorMessage}
            </div>
          )}

          {successInfo && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16a34a',
                fontSize: '0.9rem',
                marginBottom: '1rem',
              }}
            >
              {successInfo}
            </div>
          )}

          <form className="auth-form entry-form" onSubmit={handleSubmit}>
            {registration && (
              <label>
                Как вас зовут?
                <input
                  autoComplete="name"
                  required
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  pattern=".*\S.*"
                  disabled={loading}
                />
              </label>
            )}
            <label>
              Электронная почта
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>
            <label>
              Пароль
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={registration ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                  placeholder="Не менее 6 символов"
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </label>
            {registration && (
              <>
                <div className="password-strength" aria-label="Надёжность пароля">
                  <div>
                    {[1, 2, 3].map((n) => (
                      <i className={strength >= n ? 'filled' : ''} key={n} />
                    ))}
                  </div>
                  <span>
                    {!password
                      ? 'Пусть он будет только вашим'
                      : strength === 3
                      ? 'Хороший пароль'
                      : strength === 2
                      ? 'Можно сделать ещё надёжнее'
                      : 'Добавьте длину и цифры'}
                  </span>
                </div>
                <label className="consent">
                  <input type="checkbox" required />
                  <span>
                    Принимаю{' '}
                    <button type="button" onClick={() => onNavigate('Конфиденциальность')}>
                      условия конфиденциальности
                    </button>
                  </span>
                </label>
              </>
            )}
            <button className="primary" type="submit" disabled={loading}>
              {loading
                ? 'Подключение…'
                : registration
                ? 'Присоединиться'
                : 'Войти в аккаунт'}
              <span>→</span>
            </button>
            <div className="entry-privacy">
              <span>◇</span>
              Защищено сквозным шифрованием Supabase & RLS.
            </div>
          </form>
        </div>
        <div className="entry-disclaimer">
          Подключено к Supabase Database · Безопасные токены сессии
        </div>
      </section>
    </main>
  )
}
