interface Nav3DIconProps {
  name: string
  active?: boolean
  size?: number
}

export default function Nav3DIcon({ name, active = false, size = 26 }: Nav3DIconProps) {
  if (["user", "home", "clapper", "chat", "music", "groups", "friends", "phone"].includes(name)) {
    return <img className="nav-uploaded-icon" src={`/nav/${name}.webp`} width={size} height={size} alt="" aria-hidden="true" />
  }
  const primaryGradId = `grad_p_${name}_${active ? "act" : "inact"}`
  const accentGradId = `grad_a_${name}_${active ? "act" : "inact"}`
  const shadowFilterId = `shadow_${name}_${active ? "act" : "inact"}`

  // Colors strictly White, Black, Purple
  const p1 = active ? "#9333ea" : "#a899b8"
  const p2 = active ? "#6d28d9" : "#7d6b91"
  const pLight = active ? "#c084fc" : "#cfc2de"
  const pDark = active ? "#4c1d95" : "#5d4e72"
  const whiteGloss = "rgba(255, 255, 255, 0.85)"
  const deepShadow = active ? "rgba(109, 40, 217, 0.35)" : "rgba(45, 15, 75, 0.12)"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        {/* Main 3D Volume Gradient */}
        <linearGradient id={primaryGradId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={pLight} />
          <stop offset="50%" stopColor={p1} />
          <stop offset="100%" stopColor={p2} />
        </linearGradient>

        {/* Secondary Accent Gradient */}
        <linearGradient id={accentGradId} x1="8" y1="2" x2="24" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor={pLight} />
          <stop offset="100%" stopColor={pDark} />
        </linearGradient>

        {/* 3D Drop Shadow */}
        <filter id={shadowFilterId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor={deepShadow} />
        </filter>
      </defs>

      <g filter={`url(#${shadowFilterId})`}>
        {name === "user" && (
          // 3D Person Avatar: Volumetric sphere head + curved 3D shoulders
          <g>
            {/* Shoulders */}
            <path
              d="M6 26.5C6 21.8 10.5 19 16 19C21.5 19 26 21.8 26 26.5C26 27.3 25.3 28 24.5 28H7.5C6.7 28 6 27.3 6 26.5Z"
              fill={`url(#${primaryGradId})`}
            />
            {/* Shoulders rim light */}
            <path
              d="M8.5 25.5C9.5 22.5 12.5 20.2 16 20.2C19.5 20.2 22.5 22.5 23.5 25.5"
              stroke={whiteGloss}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Head sphere */}
            <circle cx="16" cy="11.5" r="5.5" fill={`url(#${primaryGradId})`} />
            {/* Head 3D Specular Highlight */}
            <ellipse cx="14" cy="9" rx="2.5" ry="1.6" transform="rotate(-25 14 9)" fill="#ffffff" opacity="0.65" />
          </g>
        )}

        {name === "home" && (
          // 3D Volumetric House: dimensional roof + house body + inset arched door
          <g>
            {/* House body */}
            <rect x="7.5" y="13" width="17" height="13.5" rx="3.5" fill={`url(#${primaryGradId})`} />
            {/* Inset Door */}
            <path
              d="M13 26.5V20C13 18.9 13.9 18 15 18H17C18.1 18 19 18.9 19 20V26.5"
              fill={active ? "#4c1d95" : "#5d4e72"}
              opacity="0.85"
            />
            {/* Door light glow */}
            <circle cx="17.5" cy="22.5" r="0.8" fill="#ffffff" opacity="0.9" />
            {/* 3D Roof */}
            <path
              d="M4.5 14L14.8 5.2C15.5 4.6 16.5 4.6 17.2 5.2L27.5 14C28.2 14.6 27.8 15.8 26.8 15.8H5.2C4.2 15.8 3.8 14.6 4.5 14Z"
              fill={`url(#${accentGradId})`}
            />
            {/* Roof edge specular shine */}
            <path
              d="M6 14.2L15.3 6.3C15.7 6 16.3 6 16.7 6.3L26 14.2"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        )}

        {name === "clapper" && (
          // 3D Netorys Clapperboard: Angled 3D clapper with stripes + film body
          <g>
            {/* Clapperboard base box */}
            <rect x="5" y="11" width="22" height="15" rx="3" fill={`url(#${primaryGradId})`} />
            {/* Play symbol on body */}
            <path
              d="M14 15.5L19.5 18.5L14 21.5V15.5Z"
              fill="#ffffff"
              opacity="0.9"
            />
            {/* Top clapper arm angled */}
            <path
              d="M5 8.5C5 7.4 5.9 6.5 7 6.5H25C26.1 6.5 27 7.4 27 8.5V11.5H5V8.5Z"
              fill={active ? "#4c1d95" : "#453856"}
            />
            {/* White stripes on clapper */}
            <path d="M9 6.5L7 11.5M15 6.5L13 11.5M21 6.5L19 11.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
            {/* Gloss sheen */}
            <path d="M6 12.5H26" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
          </g>
        )}

        {name === "chat" && (
          // 3D Speech Cloud / Bubble with puffy rounded volume & sheen
          <g>
            {/* Volumetric bubble with tail */}
            <path
              d="M6 15C6 9.5 10.5 5 16 5C21.5 5 26 9.5 26 15C26 20.5 21.5 25 16 25C14.3 25 12.7 24.5 11.3 23.7L6.8 25.4C6.2 25.6 5.6 25.1 5.8 24.5L7 20.5C6.4 18.8 6 17 6 15Z"
              fill={`url(#${primaryGradId})`}
            />
            {/* 3D Glossy curved highlight reflection */}
            <path
              d="M10 9C12 7.2 14 6.8 17 6.8C20 6.8 22 7.5 23.5 9.5"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Embossed Chat Dots */}
            <circle cx="11.5" cy="15" r="1.6" fill="#ffffff" opacity="0.95" />
            <circle cx="16" cy="15" r="1.6" fill="#ffffff" opacity="0.95" />
            <circle cx="20.5" cy="15" r="1.6" fill="#ffffff" opacity="0.95" />
          </g>
        )}

        {name === "music" && (
          // 3D Double Eighth Musical Notes: dimensional round heads + angled beam
          <g>
            {/* Left note head */}
            <ellipse cx="10" cy="22" rx="4" ry="3" transform="rotate(-18 10 22)" fill={`url(#${primaryGradId})`} />
            <ellipse cx="9" cy="21" rx="1.6" ry="0.8" transform="rotate(-18 9 21)" fill="#ffffff" opacity="0.65" />
            {/* Right note head */}
            <ellipse cx="22" cy="19" rx="4" ry="3" transform="rotate(-18 22 19)" fill={`url(#${primaryGradId})`} />
            <ellipse cx="21" cy="18" rx="1.6" ry="0.8" transform="rotate(-18 21 18)" fill="#ffffff" opacity="0.65" />
            {/* Vertical stems */}
            <rect x="12" y="8" width="2.6" height="14" rx="1.2" fill={`url(#${primaryGradId})`} />
            <rect x="24" y="5" width="2.6" height="14" rx="1.2" fill={`url(#${primaryGradId})`} />
            {/* Top connecting beam with bevel */}
            <path
              d="M12 9.5L25.5 6.5C26.2 6.3 26.8 6.9 26.6 7.6L25.8 9.5C25.7 9.8 25.4 10 25 10.1L12.5 12.8C11.8 13 11.2 12.4 11.4 11.7L12 9.5Z"
              fill={`url(#${accentGradId})`}
            />
            {/* Beam top shine */}
            <path d="M12.5 9.2L25.2 6.4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          </g>
        )}

        {name === "users" && (
          // 3D Community / Groups: Layered multi-user figures with depth
          <g>
            {/* Back figure right */}
            <circle cx="21.5" cy="10.5" r="3.8" fill={`url(#${primaryGradId})`} opacity="0.65" />
            <path
              d="M17.5 24C17.5 20.8 20 18.5 23 18.5C25.5 18.5 27.5 20.5 27.5 24"
              stroke={`url(#${primaryGradId})`}
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.65"
            />
            {/* Front prominent figure */}
            <path
              d="M6 25.5C6 21.2 10 18.5 14.5 18.5C19 18.5 23 21.2 23 25.5C23 26.3 22.3 27 21.5 27H7.5C6.7 27 6 26.3 6 25.5Z"
              fill={`url(#${accentGradId})`}
            />
            <path
              d="M8.5 24.5C9.5 21.8 11.8 20 14.5 20C17.2 20 19.5 21.8 20.5 24.5"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle cx="14.5" cy="11.5" r="5" fill={`url(#${accentGradId})`} />
            <ellipse cx="13" cy="9" rx="2.2" ry="1.3" transform="rotate(-25 13 9)" fill="#ffffff" opacity="0.7" />
          </g>
        )}

        {name === "phone" && (
          // 3D Glossy Telephone Handset
          <g transform="translate(16 16) rotate(-28) translate(-16 -16)">
            {/* Ergonomic handle body */}
            <path
              d="M10 8C10 6.3 11.3 5 13 5H19C20.7 5 22 6.3 22 8C22 9.7 20.7 11 19 11H17.5C17.5 14 17.5 18 17.5 21H19C20.7 21 22 22.3 22 24C22 25.7 20.7 27 19 27H13C11.3 27 10 25.7 10 24C10 22.3 11.3 21 13 21H14.5C14.5 18 14.5 14 14.5 11H13C11.3 11 10 9.7 10 8Z"
              fill={`url(#${primaryGradId})`}
            />
            {/* Top earpiece shine */}
            <ellipse cx="16" cy="7.5" rx="3.5" ry="1.4" fill="#ffffff" opacity="0.6" />
            {/* Bottom mic shine */}
            <ellipse cx="16" cy="24.5" rx="3.5" ry="1.4" fill="#ffffff" opacity="0.5" />
          </g>
        )}

        {name === "bookmark" && (
          // 3D Folded Ribbon / Bookmark with specular sheen
          <g>
            {/* Ribbon body with V-cutout */}
            <path
              d="M8 6C8 4.9 8.9 4 10 4H22C23.1 4 24 4.9 24 6V26.5C24 27.4 23.1 27.9 22.3 27.4L16 23.2L9.7 27.4C8.9 27.9 8 27.4 8 26.5V6Z"
              fill={`url(#${primaryGradId})`}
            />
            {/* Top folded edge depth */}
            <path
              d="M10 5.5H22C22.6 5.5 23 5.9 23 6.5V8H9V6.5C9 5.9 9.4 5.5 10 5.5Z"
              fill="#ffffff"
              opacity="0.3"
            />
            {/* Specular vertical streak */}
            <path
              d="M11 6V23M13 6V21.5"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
        )}

        {name === "plus" && (
          // 3D Dimensional Plus Icon
          <g>
            <path
              d="M16 7V25M7 16H25"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M16 8V24M8 16H24"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {name === "one" && (
          // 3D Netory One Ribbon Emblem
          <image href="/one.png" x="3" y="3" width="26" height="26" preserveAspectRatio="xMidYMid meet" />
        )}
      </g>
    </svg>
  )
}
