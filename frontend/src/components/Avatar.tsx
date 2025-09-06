import React from "react"

type AvatarProps = {
  name: string
  src?: string
  size?: number // in px
  className?: string
}

const getInitials = (name: string) => {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return (first + last).toUpperCase() || first.toUpperCase() || "?"
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 56,
  className = "",
}) => {
  const styles: React.CSSProperties = {
    width: size,
    height: size,
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border-2 border-black bg-white overflow-hidden ${className}`}
      style={styles}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span
          className="font-bold"
          style={{ fontSize: Math.max(12, Math.floor(size / 3)) }}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}

export default Avatar
