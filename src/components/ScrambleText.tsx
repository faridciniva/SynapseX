import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><'

interface Props {
  text: string
  isHovered: boolean
  className?: string
}

export default function ScrambleText({ text, isHovered, className }: Props) {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (isHovered) {
      frameRef.current = 0

      intervalRef.current = setInterval(() => {
        frameRef.current++
        const revealCursor = Math.floor(frameRef.current / 4)

        const chars = text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < revealCursor) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })

        setDisplay(chars.join(''))

        if (revealCursor >= text.length) {
          setDisplay(text)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      }, 25)
    } else {
      setDisplay(text)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isHovered, text])

  return <span className={className}>{display}</span>
}
