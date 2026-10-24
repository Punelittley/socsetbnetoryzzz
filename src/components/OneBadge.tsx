import "./OneBadge.css"

export default function OneBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`one-mark ${className}`} role="img" aria-label="Netory One" title="Netory One">
      <img src="/one.png" alt="" />
    </span>
  )
}
