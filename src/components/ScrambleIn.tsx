import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><'

interface Props {
  text: string
  delay: number
  triggered: boolean
}

export default function ScrambleIn({ text, delay, triggered }: Props) {
  const [display, setDisplay] = useState(' '.repeat(text.length))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!triggered) {
      setDisplay(' '.repeat(text.length))
      return
    }

    timerRef.current = setTimeout(() => {
      let frame = 0

      intervalRef.current = setInterval(() => {
        frame++
        const revealCursor = frame * 0.5

        const chars = text.split('').map((char, i) => {
          if (char === ' ') return ' '
          if (i < revealCursor) return text[i]
          if (i < revealCursor + 3) return CHARS[Math.floor(Math.random() * CHARS.length)]
          return ''
        })

        setDisplay(chars.join(''))

        if (revealCursor >= text.length) {
          setDisplay(text)
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      }, 25)
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [triggered, text, delay])

  return <span>{display}</span>
}
