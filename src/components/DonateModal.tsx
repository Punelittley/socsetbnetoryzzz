import { useState, type ChangeEvent, type FormEvent } from "react"

interface DonateModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  recipientAvatar?: string
  recipientRole?: string
  onDonated?: (amount: number, message: string) => void
}

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500]

export default function DonateModal({
  isOpen,
  onClose,
  recipientName,
  recipientAvatar,
  recipientRole = "Автор контента",
  onDonated,
}: DonateModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(250)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  if (!isOpen) return null

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    setCustomAmount(val)
    if (val) {
      setSelectedAmount(0)
    } else {
      setSelectedAmount(250)
    }
  }

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (effectiveAmount <= 0) return

    setIsSuccess(true)
    if (onDonated) {
      onDonated(effectiveAmount, message)
    }

    // Save to localStorage tips log
    try {
      const prevTips = JSON.parse(localStorage.getItem("netory_tips") || "[]")
      const newTip = {
        id: Date.now(),
        recipient: recipientName,
        amount: effectiveAmount,
        message: message.trim(),
        date: new Date().toISOString(),
      }
      localStorage.setItem("netory_tips", JSON.stringify([newTip, ...prevTips]))
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSuccess(false)
      setMessage("")
      setCustomAmount("")
      setSelectedAmount(250)
      onClose()
    }, 1800)
  }

  return (
    <div className="modal-overlay donate-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="donate-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Close */}
        <button className="donate-close-btn" onClick={onClose} aria-label="Закрыть">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="donate-success-state">
            <div className="donate-success-ring">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Донат отправлен!</h3>
            <p className="donate-success-amount">+{effectiveAmount} ₽</p>
            <p className="donate-success-sub">Спасибо за поддержку {recipientName}</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="donate-form">
            {/* Target Creator Profile */}
            <div className="donate-recipient-header">
              <div className="donate-avatar-wrap">
                <img
                  src={recipientAvatar || `https://i.pravatar.cc/120?u=${recipientName}`}
                  alt={recipientName}
                  className="donate-avatar-img"
                />
                <span className="donate-badge-spark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" />
                  </svg>
                </span>
              </div>
              <div className="donate-recipient-info">
                <strong>{recipientName}</strong>
                <span>{recipientRole}</span>
              </div>
            </div>

            <div className="donate-title-block">
              <h4>Поддержать автора</h4>
              <p>Отправьте мгновенный донат на творчество и новые релизы</p>
            </div>

            {/* Amount Selection Buttons */}
            <div className="donate-presets-grid">
              {PRESET_AMOUNTS.map((amt) => {
                const isActive = !customAmount && selectedAmount === amt
                return (
                  <button
                    type="button"
                    key={amt}
                    className={`donate-preset-btn ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectPreset(amt)}
                  >
                    <span>{amt} ₽</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Amount Input */}
            <div className="donate-custom-wrap">
              <label htmlFor="custom-donate-input">Или своя сумма:</label>
              <div className="donate-input-shell">
                <input
                  id="custom-donate-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Любая сумма"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="donate-field"
                />
                <span className="donate-currency-mark">₽</span>
              </div>
            </div>

            {/* Warm Message */}
            <div className="donate-message-wrap">
              <label htmlFor="donate-message-input">Сообщение или пожелание (необязательно):</label>
              <input
                id="donate-message-input"
                type="text"
                placeholder="Спасибо за вдохновение!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                className="donate-field"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={effectiveAmount <= 0}
              className="donate-submit-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M15 10H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9" />
              </svg>
              <span>Отправить {effectiveAmount > 0 ? `${effectiveAmount} ₽` : "донат"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
