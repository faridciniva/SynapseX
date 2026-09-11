import { motion } from 'framer-motion'

interface Props {
  isOpen: boolean
  mobile?: boolean
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }

export default function SquashHamburger({ isOpen, mobile = false }: Props) {
  const w = mobile ? 15 : 18
  const h = mobile ? 10 : 12
  const barH = mobile ? 1.2 : 1.5
  const yOffset = (h - barH) / 2

  return (
    <div style={{ width: w, height: h, position: 'relative', flexShrink: 0 }}>
      {/* Top bar */}
      <motion.span
        animate={isOpen ? { rotate: 45, y: yOffset } : { rotate: 0, y: 0 }}
        transition={SPRING}
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: barH,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      />
      {/* Middle bar */}
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={SPRING}
        style={{
          display: 'block',
          position: 'absolute',
          top: '50%',
          left: 0,
          marginTop: -(barH / 2),
          width: '100%',
          height: barH,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      />
      {/* Bottom bar */}
      <motion.span
        animate={isOpen ? { rotate: -45, y: -yOffset } : { rotate: 0, y: 0 }}
        transition={SPRING}
        style={{
          display: 'block',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: barH,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      />
    </div>
  )
}
