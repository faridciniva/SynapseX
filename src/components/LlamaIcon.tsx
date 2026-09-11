interface Props {
  size?: number
  color?: string
  className?: string
}

export default function LlamaIcon({ size = 20, color = 'currentColor', className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cabeza — más grande, centrada */}
      <ellipse cx="50" cy="58" rx="28" ry="32" />
      {/* Oreja izquierda */}
      <ellipse cx="28" cy="22" rx="8" ry="18" transform="rotate(-10 28 22)" />
      {/* Oreja derecha */}
      <ellipse cx="72" cy="22" rx="8" ry="18" transform="rotate(10 72 22)" />
      {/* Gafas VR — montura completa */}
      <rect x="18" y="52" width="64" height="18" rx="8" fill="white" />
      {/* Lente izquierdo */}
      <rect x="18" y="44" width="27" height="22" rx="7" fill="white" />
      {/* Lente derecho */}
      <rect x="55" y="44" width="27" height="22" rx="7" fill="white" />
      {/* Interior lente — vacío (color del fondo) */}
      <rect x="21" y="47" width="21" height="16" rx="5" fill={color} opacity="0.18" />
      <rect x="58" y="47" width="21" height="16" rx="5" fill={color} opacity="0.18" />
      {/* Brillo lente izquierdo */}
      <rect x="23" y="49" width="7" height="3" rx="1.5" fill="white" opacity="0.5" />
      {/* Brillo lente derecho */}
      <rect x="60" y="49" width="7" height="3" rx="1.5" fill="white" opacity="0.5" />
    </svg>
  )
}
