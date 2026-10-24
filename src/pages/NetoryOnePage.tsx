import { useRef, useState } from "react"
import OneBadge from "../components/OneBadge"
import "./NetoryOnePage.css"

interface NetoryOnePageProps {
  isSubscriber: boolean
  onToggleSubscription: () => void
  userName: string
  onNavigate: (route: string) => void
}

const features = [
  [
    "01",
    "Небольшая деталь. Ваш характер.",
    "Значок One рядом с именем и фиолетовое свечение аватара.",
    "Оформление профиля",
  ],
  [
    "02",
    "Поддержка того, что вам близко.",
    "Подписка задумана как способ поддерживать развитие Netory.",
    "Для сообщества",
  ],
  [
    "03",
    "Больше места для своих идей.",
    "Расширенные видеокружки и дополнительные обложки — в планах.",
    "Скоро",
  ],
  [
    "04",
    "Музыка объединяет.",
    "Расширенные музыкальные комнаты появятся в следующих обновлениях.",
    "Скоро",
  ],
]

export default function NetoryOnePage({
  isSubscriber,
  onToggleSubscription,
  userName,
  onNavigate,
}: NetoryOnePageProps) {
  const [annual, setAnnual] = useState(true)
  const [orderAnnual, setOrderAnnual] = useState(true)
  const checkoutDialog = useRef<HTMLDialogElement>(null)
  const purchaseButton = useRef<HTMLButtonElement>(null)
  const openCheckout = () => {
    setOrderAnnual(annual)
    checkoutDialog.current?.showModal()
  }
  return (
    <div className="membership-page">
      <section className="membership-intro">
        <div>
          <span className="membership-kicker">NETORY / ПОДПИСКА ONE</span>
          <h1>
            Netory One<span>.</span>
          </h1>
          <p>
            Ваш профиль. Ваш характер.
            <br />Поддержите Netory и добавьте личную деталь.
          </p>
        </div>
        <span className="membership-edition">
          ONE MEMBERSHIP
          <br />
          NETORY / 2026
        </span>
      </section>

      <div className="membership-main">
        <section
          className="membership-art"
          aria-label="Карта участника Netory One"
        >
          <div className="membership-art-caption">
            <span>ПЕРСОНАЛЬНОЕ ОФОРМЛЕНИЕ</span>
            <span>№ 001</span>
          </div>
          <div className="membership-card">
            <div className="membership-card-top">
              <span>netory</span>
              <span>MEMBER</span>
            </div>
            <div className="membership-card-word">
              one<span>®</span>
            </div>
            <div className="membership-card-bottom">
              <span>
                {userName}
                <small>УЧАСТНИК NETORY</small>
              </span>
              <span className="membership-card-mark" aria-hidden="true">
                n.
              </span>
            </div>
          </div>
          <div className="membership-art-bottom">
            <span>
              Меньше лишнего.
              <br />
              Больше своего.
            </span>
            <span className="membership-art-seal" aria-hidden="true">
              N / 1
            </span>
          </div>
        </section>

        <section className="membership-checkout" aria-label="Выбор тарифа">
          <div className="membership-checkout-top">
            <h2>
              Одна подписка.
              <br />
              Ваш Netory.
            </h2>
            <span className="membership-label">ONE</span>
          </div>
          <p className="membership-checkout-copy">
            Оформление профиля и поддержка проекта.
            <br />
            Без обещаний, написанных мелким шрифтом.
          </p>
          <div className="membership-period" aria-label="Период подписки">
            <button
              className={!annual ? "is-active" : ""}
              aria-pressed={!annual}
              onClick={() => setAnnual(false)}
            >
              На месяц
            </button>
            <button
              className={annual ? "is-active" : ""}
              aria-pressed={annual}
              onClick={() => setAnnual(true)}
            >
              На год <span>−37,6%</span>
            </button>
          </div>
          <div className="membership-price">
            <strong>{annual ? "124" : "199"}</strong>
            <span>₽ / месяц{annual ? " ≈" : ""}</span>
          </div>
          <p className="membership-billing">
            {annual
              ? "1 490 ₽ за год · на 898 ₽ выгоднее"
              : "199 ₽ при ежемесячной оплате"}
          </p>
          <button
            ref={purchaseButton}
            className="membership-subscribe"
            onClick={openCheckout}
          >
            Посмотреть заказ · {annual ? "1 490 ₽ / год" : "199 ₽ / месяц"}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="membership-payment-note">
            Сейчас это демо. Оплата не подключена,
            <br />
            деньги не списываются.
          </p>
          <button className="membership-demo-button" onClick={onToggleSubscription}>
            {isSubscriber ? "Выключить демо-оформление" : "Бесплатно примерить значок"}
          </button>
          <div className="membership-account">
            <img src="https://i.pravatar.cc/80?img=11" alt="" />
            <span>
              <span className="one-name">{userName}{isSubscriber && <OneBadge />}</span>
              <small>
                {isSubscriber ? "Оформление One включено" : "Обычный профиль"}
              </small>
            </span>
            <button onClick={() => onNavigate("Профиль")}>Профиль ↗</button>
          </div>
        </section>
      </div>

      <section className="membership-features">
        <div className="membership-section-title">
          <h2>Что входит в One</h2>
          <p>Что уже есть и что появится дальше</p>
        </div>
        <div className="membership-feature-grid">
          {features.map(([number, title, text, tag]) => (
            <article className="membership-feature" key={number}>
              <div>
                <span>{number}</span>
                <small>{tag}</small>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="membership-faq">
        <h2>Если остались вопросы</h2>
        <div>
          <details>
            <summary>Можно попробовать значок до покупки?</summary>
            <p>
              Включится демонстрационное оформление профиля. Оно сохраняется в
              этом браузере. Банковская карта не нужна.
            </p>
          </details>
          <details>
            <summary>Все возможности уже доступны?</summary>
            <p>
              Пока доступно оформление профиля. Оплата, расширенные видеокружки
              и многопользовательские музыкальные комнаты ещё не подключены.
            </p>
          </details>
          <details>
            <summary>Как отключить One?</summary>
            <p>
              Нажмите «Выключить демо-оформление» на этой странице. Оформление вернётся
              к обычному, ваши публикации останутся на месте.
            </p>
          </details>
        </div>
      </section>
      <dialog className="membership-order-dialog" ref={checkoutDialog} aria-labelledby="membership-order-title" onClick={e => { if (e.target === e.currentTarget) checkoutDialog.current?.close() }}>
        <div className="membership-order-heading"><span>NETORY ONE</span><button autoFocus aria-label="Закрыть оформление" onClick={() => checkoutDialog.current?.close()}>×</button></div>
        <h2 id="membership-order-title">Оформление подписки</h2>
        <div className="membership-order-account"><img src="https://i.pravatar.cc/80?img=11" alt="" /><span>{userName}<small>Подписка для вашего аккаунта</small></span><OneBadge /></div>
        <dl className="membership-order-summary">
          <div><dt>Период доступа</dt><dd>{orderAnnual ? "12 месяцев" : "1 месяц"}</dd></div>
          {orderAnnual && <div><dt>Экономия за год</dt><dd>898 ₽</dd></div>}
          <div className="membership-order-total"><dt>К оплате</dt><dd>{orderAnnual ? "1 490" : "199"} ₽</dd></div>
        </dl>
        <div className="membership-order-unavailable"><strong>Оплата пока не подключена</strong><p>Нужны платёжный сервис и серверное подтверждение покупки. Сейчас деньги не списываются и платная подписка не оформляется.</p></div>
        <button className="membership-subscribe" disabled>Перейти к оплате — недоступно</button>
        <button className="membership-order-back" onClick={() => checkoutDialog.current?.close()}>Вернуться к тарифам</button>
      </dialog>
    </div>
  )
}
