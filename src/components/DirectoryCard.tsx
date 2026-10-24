interface DirectoryCardProps {
  title: string
  description: string
  avatar: string
  cover?: string
  tone?: string
  category: string
  meta: string
  social: string
  online?: boolean
  selected: boolean
  actionLabel: string
  onAction: () => void
  onOpen: () => void
  openLabel: string
}

export default function DirectoryCard(props: DirectoryCardProps) {
  return (
    <article className="directory-card">
      <button
        className={`directory-cover directory-cover--${props.tone || "design"}`}
        onClick={props.onOpen}
        aria-label={`${props.openLabel}: ${props.title}`}
      >
        {props.cover && <img src={props.cover} alt="" loading="lazy" />}
        <span className="directory-category">{props.category}</span>
      </button>
      <div className="directory-body">
        <div className="directory-identity">
          <button
            className="directory-avatar"
            onClick={props.onOpen}
            aria-label={`${props.openLabel}: ${props.title}`}
          >
            <img src={props.avatar} alt="" loading="lazy" />
            {props.online && <i aria-label="В сети" />}
          </button>
          <button
            className={`directory-action ${
              props.selected ? "is-selected" : ""
            }`}
            onClick={props.onAction}
            aria-pressed={props.selected}
          >
            {props.actionLabel}
          </button>
        </div>
        <button className="directory-title" onClick={props.onOpen}>
          {props.title}
        </button>
        <p className="directory-meta">{props.meta}</p>
        <p className="directory-description">{props.description}</p>
        <div className="directory-footer">
          <span>{props.social}</span>
          <button onClick={props.onOpen}>
            {props.openLabel}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  )
}
