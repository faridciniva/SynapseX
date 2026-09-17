import { useEffect, useState, useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from 'framer-motion'
import Navbar from './components/Navbar'
import ScrambleIn from './components/ScrambleIn'
import SynapseXLogo from './components/SynapseXLogo'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#00CDB0'

const VIDEOS = {
  hero: '/hero-teal.mp4',
  cinema: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4',
  metrics: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4',
  technology: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4',
  footer: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4',
}

const METRICS = [
  { value: '+300%', label: 'Crecimiento Promedio' },
  { value: '98%', label: 'Clientes Satisfechos' },
  { value: '+50', label: 'Marcas Lanzadas' },
]

const TECH_FEATURES = [
  { title: 'Brand Strategy', desc: 'Definimos la identidad, el tono y la dirección de tu marca.' },
  { title: 'Content Creation', desc: 'Contenido que conecta, convierte y genera comunidad.' },
  { title: 'Digital Ads', desc: 'Campañas optimizadas con IA para el mayor retorno posible.' },
  { title: 'Analytics & Growth', desc: 'Datos reales, decisiones inteligentes, resultados medibles.' },
]

const ARCH_LAYERS = [
  { num: 'Fase 1', name: 'Estrategia' },
  { num: 'Fase 2', name: 'Ejecución' },
  { num: 'Fase 3', name: 'Escala' },
]

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false)

  // Hero video refs for mouse-scrub
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const isSeekingRef = useRef(false)
  const pendingDeltaRef = useRef(0)

  // Cinema section ref for scroll-linked 3D transform
  const cinemaRef = useRef<HTMLElement>(null)

  // Laptop showcase refs
  const laptopRef    = useRef<HTMLDivElement>(null)
  const iframeRef    = useRef<HTMLIFrameElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)

  // LTX preview iframe + cursor refs
  const ltxIframeRef  = useRef<HTMLIFrameElement>(null)
  const cursorLtxRef  = useRef<HTMLDivElement>(null)

  // ── Background video: force-play on mobile when browser has enough data ──
  const bgVideoPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget
    v.muted = true
    if (v.paused) v.play().catch(() => {})
  }

  // ── Scroll-driven 3D text (Section 2) ──────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: cinemaRef,
    offset: ['start end', 'end start'],
  })
  const cinemaSpring = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 })
  const cinemaY = useTransform(cinemaSpring, [0, 1], [60, -120])
  const cinemaOpacity = useTransform(cinemaSpring, [0.1, 0.35], [0, 1])
  const cinemaTransform = useMotionTemplate`rotateX(24deg) translateY(${cinemaY}px) translateZ(15px)`

  // ── Entrance timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 800)
    return () => clearTimeout(t)
  }, [])

  // ── Spotlight auto-simulación: trayectoria Lissajous en loop ─────────────
  useEffect(() => {
    const iframe  = iframeRef.current
    const dot     = cursorDotRef.current
    if (!iframe || !dot) return

    // Dimensiones internas del iframe (el viewport que ve el Cyber Ronin)
    const IW = 1440, IH = 900
    // Factor de escala CSS del iframe → posición visible = coord_interna × SCALE
    const SCALE = 0.625

    let raf: number
    let t0: number | null = null

    const tick = (ts: number) => {
      if (t0 === null) t0 = ts
      const t = (ts - t0) / 1000                          // segundos

      // Figura-8 (Lissajous 1:2) centrada en el hero
      const x = IW * 0.50 + IW * 0.31 * Math.cos(t * 0.38)
      const y = IH * 0.46 + IH * 0.27 * Math.sin(t * 0.76)

      // Enviar posición al Cyber Ronin dentro del iframe
      try { iframe.contentWindow?.postMessage({ type: 'spotlight', x, y }, '*') } catch (_) {}

      // Mover el cursor dot visible (posición escalada al 62.5%)
      dot.style.left    = x * SCALE + 'px'
      dot.style.top     = y * SCALE + 'px'
      dot.style.opacity = '1'

      raf = requestAnimationFrame(tick)
    }

    // Delay inicial para que el iframe termine de cargar
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick) }, 1400)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      dot.style.opacity = '0'
    }
  }, [])

  // ── Hero video: autoplay on mobile, mouse-scrub on desktop ────────────
  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    // maxTouchPoints > 0 is the most reliable mobile detection across iOS/Android
    const isMobile = navigator.maxTouchPoints > 0
    if (isMobile) {
      video.muted = true
      // Play immediately if ready, otherwise wait for canplay
      const doPlay = () => video.play().catch(() => {})
      if (video.readyState >= 2) doPlay()
      else video.addEventListener('canplay', doPlay, { once: true })
      return () => { video.pause() }
    }

    // Desktop: pause and let mouse scrub control playback
    video.pause()

    const handleSeeked = () => {
      isSeekingRef.current = false
      if (pendingDeltaRef.current !== 0 && !isNaN(video.duration)) {
        video.currentTime = Math.max(
          0,
          Math.min(video.duration, video.currentTime + pendingDeltaRef.current),
        )
        pendingDeltaRef.current = 0
        isSeekingRef.current = true
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isNaN(video.duration)) return
      const delta = e.movementX * 0.8 * 0.01
      if (!isSeekingRef.current) {
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta))
        isSeekingRef.current = true
      } else {
        pendingDeltaRef.current += delta
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    video.addEventListener('seeked', handleSeeked)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      video.removeEventListener('seeked', handleSeeked)
    }
  }, [])

  // ── Background video autoplay guarantee (mobile browsers ignore [autoplay] attr) ──
  useEffect(() => {
    const tryPlay = (v: HTMLVideoElement) => {
      if (v.paused && v.hasAttribute('autoplay')) {
        v.muted = true
        v.play().catch(() => {})
      }
    }

    // Initial attempt after DOM settles
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLVideoElement>('video[autoplay]').forEach(tryPlay)
    }, 600)

    // Resume when video scrolls into view (mobile recycles off-screen video resources)
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) tryPlay(e.target as HTMLVideoElement) }),
      { threshold: 0.05 }
    )
    document.querySelectorAll<HTMLVideoElement>('video[autoplay]').forEach(v => io.observe(v))

    return () => { clearTimeout(t); io.disconnect() }
  }, [])

  // ── LTX cursor simulation: DOM directo (mismo origen), videos a 2× velocidad
  useEffect(() => {
    const iframe  = ltxIframeRef.current
    const cursor  = cursorLtxRef.current
    if (!iframe || !cursor) return

    const SCALE    = 0.40
    const CHROME_H = 41
    const CTRL_Y   = Math.round(457 * SCALE) + CHROME_H  // ≈224px
    const CTRL_L   = 280 * SCALE
    const CELL_W   = 176 * SCALE
    const BTN_X    = [1,2,3,4].map(col => Math.round(CTRL_L + CELL_W * (col + 0.5)))

    // Videos reales: 2080ms. A 2× = 1040ms. Buffers generosos.
    const RATE  = 2
    const FWD_RAW = [2080, 2080, 2080, 3000]
    const REV_RAW = [2080, 2040, 2080, 2480]
    const HOVER = 150   // ms hover antes de click directo
    const GAP   = 300   // ms entre reset y siguiente

    const timers: ReturnType<typeof setTimeout>[] = []

    const moveCursor = (x: number, y: number) => {
      cursor.style.left    = x + 'px'
      cursor.style.top     = y + 'px'
      cursor.style.opacity = '1'
    }

    // Acceso DOM directo (mismo origen → sin postMessage)
    const getLtxDOM = () => {
      try {
        const d = iframe.contentDocument
        if (!d) return null
        const btns = [...d.querySelectorAll<HTMLButtonElement>('button[data-idx]')]
        const ctrl = d.querySelector<HTMLElement>('.controller')
        const cap  = d.querySelector<HTMLElement>('.capsule')
        return { d, btns, ctrl, cap }
      } catch { return null }
    }

    const setRate = () => {
      try { iframe.contentDocument?.querySelectorAll('video').forEach(v => { v.playbackRate = RATE }) }
      catch (_) {}
    }

    // Mover cápsula directamente vía CSS custom prop
    const setCapPos = (ltxCtrl: HTMLElement | null, idx: number) => {
      if (!ltxCtrl) return
      const CAPS = [
        { l: '-5px', w: 'calc(20% + 5px)' },
        { l: '20%',  w: '20%' },
        { l: '40%',  w: '20%' },
        { l: '60%',  w: '20%' },
        { l: '80%',  w: 'calc(20% + 5px)' },
      ]
      const c = CAPS[idx]
      ltxCtrl.style.setProperty('--cap-l', c.l)
      ltxCtrl.style.setProperty('--cap-w', c.w)
    }

    let step    = 0
    let running = true

    const runCycle = () => {
      if (!running) return
      const idx     = step % 4
      const fwdMs   = Math.ceil(FWD_RAW[idx] / RATE) + 200  // forward wait
      const revMs   = Math.ceil(REV_RAW[idx] / RATE) + 200  // reverse wait

      setRate()
      const dom = getLtxDOM()

      // 1. Cursor al botón + mover cápsula (efecto hover visual)
      moveCursor(BTN_X[idx], CTRL_Y)
      if (dom) setCapPos(dom.ctrl, idx + 1)

      // 2. Click directo al botón
      const t1 = setTimeout(() => {
        setRate()
        const d2 = getLtxDOM()
        const btn = d2?.btns[idx]
        if (btn && !btn.disabled) btn.click()
      }, HOVER)

      // 3. Reset: buscar botón .sel y click
      const t2 = setTimeout(() => {
        const d3 = getLtxDOM()
        if (!d3) return
        const selBtn = d3.d.querySelector<HTMLButtonElement>('button.sel')
        if (selBtn) {
          selBtn.disabled = false
          selBtn.click()
        }
        setCapPos(d3.ctrl, 0)
        moveCursor(BTN_X[idx], CTRL_Y - 14)
      }, HOVER + fwdMs)

      // 4. Siguiente botón
      const t3 = setTimeout(() => {
        step++
        runCycle()
      }, HOVER + fwdMs + revMs + GAP)

      timers.push(t1, t2, t3)
    }

    // Iniciar tras 2s (iframe load + videos preload)
    moveCursor(BTN_X[0] - 30, CTRL_Y - 8)
    const init = setTimeout(() => {
      setRate()
      cursor.style.opacity = '1'
      runCycle()
    }, 2000)
    timers.push(init)

    return () => {
      running = false
      timers.forEach(clearTimeout)
      cursor.style.opacity = '0'
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: '"Space Mono", monospace' }}>
      <Navbar entranceComplete={entranceComplete} />

      {/* ══════════════════════════════════════════════════════════
          §1  HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen h-[100dvh] overflow-hidden flex flex-col bg-black">

        {/* Background video: mouse-scrubbed on desktop, autoplays on mobile */}
        <video
          ref={heroVideoRef}
          src={VIDEOS.hero}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          preload="auto"
          muted
          loop
        />

        {/* Teal dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${TEAL} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.05,
          }}
        />

        {/* TRANSCENDENCE watermark — teal radial gradient, clipped to text */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, calc(-50% + 50px))',
            fontFamily: '"Anton SC", sans-serif',
            fontSize: 'clamp(120px, 30vw, 521px)',
            letterSpacing: '-4px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            opacity: 0.1,
            background: `radial-gradient(circle, rgba(0,205,176,0) 0%, ${TEAL} 70%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          TRANSCENDENCE
        </div>

        {/* Content — fades in with entrance */}
        <motion.div
          className="relative z-10 flex flex-col flex-1 px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: entranceComplete ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex-1" />

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left heading + description */}
            <div className="flex flex-col gap-4">
              <h1
                className="text-white font-light leading-[0.95] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(26px, 9vw, 100px)' }}
              >
                <ScrambleIn text="Tu Marca" delay={200} triggered={entranceComplete} />
                <br />
                <ScrambleIn text="Nuestra Misión" delay={500} triggered={entranceComplete} />
              </h1>

              <motion.p
                className="max-w-sm text-white/60 leading-relaxed"
                style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
                initial={{ opacity: 0, y: 25 }}
                animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.61, 0.355, 1.0] }}
              >
                Agencia de marketing potenciada por inteligencia artificial. Construimos marcas
                que crecen, campañas que convierten y estrategias que generan resultados
                medibles desde el primer día.
              </motion.p>
            </div>

            {/* Right heading */}
            <h1
              className="text-white font-light leading-[0.95] tracking-[-0.03em] text-left md:text-right"
              style={{ fontSize: 'clamp(26px, 9vw, 100px)' }}
            >
              <ScrambleIn text="Ideas" delay={700} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Que Convierten" delay={1000} triggered={entranceComplete} />
            </h1>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §2  CINEMATIC TEXT
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={cinemaRef}
        className="relative w-full h-screen h-[100dvh] overflow-hidden flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)',
        }}
      >
        {/* Teal glow central brillante */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(0,200,220,0.22) 0%, rgba(0,180,210,0.06) 55%, transparent 75%)',
          }}
        />

        {/* Teal dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${TEAL} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            opacity: 0.07,
          }}
        />

        {/* Línea horizontal teal arriba */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: 1, background: `linear-gradient(to right, transparent, ${TEAL}88, transparent)` }}
        />

        {/* Línea horizontal teal abajo */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 1, background: `linear-gradient(to right, transparent, ${TEAL}88, transparent)` }}
        />

        {/* Top gradient bleed from previous section */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{ height: 180, background: 'linear-gradient(to bottom, #010103, transparent)' }}
        />

        {/* 3D scroll-driven paragraph */}
        <div className="relative z-20 max-w-5xl w-full overflow-hidden" style={{ perspective: '400px' }}>
          <motion.p
            className="font-sans font-normal text-white leading-[1.35] tracking-[-0.02em] select-none text-center px-6 sm:px-12"
            style={{
              fontSize: 'clamp(16px, 4.5vw, 42px)',
              transform: cinemaTransform,
              opacity: cinemaOpacity,
            }}
          >
            Construimos marcas que dominan su mercado. Combinamos inteligencia artificial,
            creatividad estratégica y ejecución impecable para llevar tu negocio al siguiente
            nivel. Cada campaña es un sistema diseñado para crecer. Cada decisión está
            respaldada por datos reales y visión de largo plazo.
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §3  HERO — MASCOTA TEAL
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-[100dvh] lg:h-[100dvh] overflow-hidden flex flex-col"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 65% 55%, #0d2535 0%, #071520 50%, #030a10 100%)',
        }}
      >

        {/* Glow teal central — mismo ambiente que el hero 1 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 65% 55%, rgba(0,205,176,0.32) 0%, rgba(0,205,176,0.10) 55%, transparent 78%)`,
          }}
        />

        {/* Dot grid teal — igual al hero 1 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${TEAL} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.05,
          }}
        />

        {/* TRANSCENDENCE watermark — igual al hero 1 */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            right: '-5%',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: '"Anton SC", sans-serif',
            fontSize: 'clamp(100px, 28vw, 480px)',
            letterSpacing: '-4px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            opacity: 0.07,
            background: `radial-gradient(circle, ${TEAL} 0%, rgba(0,205,176,0) 70%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          SYNAPSE
        </div>

        {/* ── LTX panel — área marcada: upper-center-right ── */}
        <motion.div
          className="absolute hidden lg:flex flex-col pointer-events-none"
          style={{ left: '50%', top: '30%', zIndex: 10 }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.3, delay: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
        >
          {/* Cursor simulado — se mueve sobre los botones */}
          <div
            ref={cursorLtxRef}
            style={{
              position: 'absolute', zIndex: 30, pointerEvents: 'none',
              width: 18, height: 18, borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.95)',
              background: 'rgba(255,255,255,0.15)',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.12), 0 0 20px rgba(255,255,255,0.6)',
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              transition: 'left 600ms cubic-bezier(0.22,1,0.36,1), top 500ms cubic-bezier(0.22,1,0.36,1), opacity 0.5s',
              willChange: 'left, top',
            }}
          />

          {/* Card con glow */}
          <div style={{
            borderRadius: 20,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(0,205,176,0.1)',
            overflow: 'hidden',
          }}>
            {/* Browser chrome */}
            <div style={{
              background: 'rgba(14,22,32,0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '11px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
              height: 41,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['#ff5f57','#febc2e','#28c840'] as const).map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6,
                padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.3)',
                textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.04em',
              }}>
                ltx.ai
              </div>
              <div style={{ width: 10 }} />
            </div>
            {/* Iframe — LTX 1440×900 → visible 576×360 (scale 0.40) */}
            <div style={{
              position: 'relative', width: 576, height: 360, overflow: 'hidden', background: '#000',
            }}>
              <iframe
                ref={ltxIframeRef}
                src="/ltx/index.html"
                title="LTX — The world model"
                scrolling="no"
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '250%', height: '250%',
                  border: 'none',
                  transformOrigin: 'top left',
                  transform: 'scale(0.40)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Badge */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: TEAL,
              boxShadow: `0 0 8px ${TEAL}`,
            }} />
            <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, letterSpacing: '0.03em' }}>
              LTX World Model · Demo en vivo
            </span>
          </div>
        </motion.div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col flex-1 px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12">

          {/* ── LTX panel — MOBILE: en flujo normal, visible sin conflicto de z-index ── */}
          <div className="lg:hidden flex flex-col items-center mb-4 mt-2">
            {/* Clip container: dimensiones exactas del panel escalado */}
            <div style={{
              width: 334, height: 233, overflow: 'hidden', flexShrink: 0,
              borderRadius: 12,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 40px rgba(0,205,176,0.15)',
            }}>
              {/* Inner 576px card escalado 58% desde top-left */}
              <div style={{ transform: 'scale(0.58)', transformOrigin: 'top left', width: 576 }}>
                <div style={{ overflow: 'hidden' }}>
                  {/* Browser chrome */}
                  <div style={{
                    background: 'rgba(14,22,32,0.98)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10, height: 41,
                  }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['#ff5f57','#febc2e','#28c840'] as const).map(c => (
                        <div key={`mb-${c}`} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                      ))}
                    </div>
                    <div style={{
                      flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 6,
                      padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.04em',
                    }}>ltx.ai</div>
                    <div style={{ width: 10 }} />
                  </div>
                  {/* Iframe LTX */}
                  <div style={{ position: 'relative', width: 576, height: 360, overflow: 'hidden', background: '#050d15' }}>
                    <iframe
                      src="/ltx/index.html"
                      title="LTX mobile"
                      scrolling="no"
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '250%', height: '250%', border: 'none',
                        transformOrigin: 'top left', transform: 'scale(0.40)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Badge */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingLeft: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: TEAL, boxShadow: `0 0 8px ${TEAL}`, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, letterSpacing: '0.03em' }}>
                LTX World Model · Demo en vivo
              </span>
            </div>
          </div>

          {/* Spacer — solo en desktop empuja el texto al fondo */}
          <div className="hidden lg:block flex-1" />

          <div className="flex flex-col gap-6 max-w-xl">
            {/* Tag */}
            <motion.span
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium"
              style={{ color: TEAL }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8 }}
            >
              <span
                className="inline-block w-5 h-px"
                style={{ background: TEAL }}
              />
              Marketing · IA · Growth
            </motion.span>

            {/* Heading */}
            <motion.h2
              className="text-white font-light leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(40px, 10vw, 96px)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.0, delay: 0.1 }}
            >
              Crece Con
              <br />
              <span style={{ color: TEAL }}>Propósito</span>
            </motion.h2>

            {/* Descripción */}
            <motion.p
              className="text-white/55 leading-relaxed max-w-sm"
              style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.25 }}
            >
              Diseñamos estrategias que convierten audiencias en clientes, clientes en comunidades
              y comunidades en marcas que lideran su industria.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex items-center gap-4 mt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.4 }}
            >
              <motion.button
                className="h-12 px-7 rounded-full font-medium text-black text-sm"
                style={{ background: TEAL }}
                whileHover={{ scale: 1.04, background: '#00FFD4' }}
                whileTap={{ scale: 0.97 }}
              >
                Empezar Ahora
              </motion.button>
              <motion.button
                className="h-12 px-7 rounded-full font-medium text-sm border"
                style={{ color: TEAL, borderColor: `${TEAL}55`, background: 'rgba(0,205,176,0.07)' }}
                whileHover={{ background: 'rgba(0,205,176,0.15)' }}
                whileTap={{ scale: 0.97 }}
              >
                Ver Servicios
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §4  LAPTOP SHOWCASE — Jack 3D Portfolio
      ══════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;500;700;900&display=swap');
        @keyframes mq-left  { from { transform: translateX(0) }    to { transform: translateX(-50%) } }
        @keyframes mq-right { from { transform: translateX(-50%) } to { transform: translateX(0)   } }
      `}</style>
      <section
        className="relative w-full overflow-hidden flex flex-col items-center"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)',
          paddingTop:    'clamp(72px, 10vw, 130px)',
          paddingBottom: 'clamp(80px, 12vw, 160px)',
        }}
      >
        {/* Glow morado/rosa ambiental */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '90%', height: '55%',
            background: 'radial-gradient(ellipse, rgba(182,0,168,0.22) 0%, rgba(118,33,176,0.12) 45%, transparent 72%)',
            filter: 'blur(55px)',
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${TEAL} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            opacity: 0.05,
          }}
        />

        {/* ── Header ── */}
        <motion.div
          className="relative z-10 text-center mb-14 sm:mb-20 px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
        >
          <p
            className="uppercase tracking-[0.2em] mb-4"
            style={{ color: 'rgba(0,205,176,0.6)', fontSize: 'clamp(11px, 1vw, 13px)' }}
          >
            Portafolio de Clientes
          </p>
          <h2
            className="text-white font-light tracking-tight leading-tight mb-5"
            style={{ fontSize: 'clamp(28px, 5.5vw, 54px)' }}
          >
            Sitios web que generan{' '}
            <span style={{ color: TEAL }}>impacto real</span>
          </h2>
          <p
            className="text-white/40 max-w-md mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(13px, 1.2vw, 15px)' }}
          >
            Diseñamos y desarrollamos sitios con animaciones de alto nivel.
            Cada proyecto, una identidad única que conecta y convierte.
          </p>
        </motion.div>

        {/* ── Laptop ── */}
        <motion.div
          ref={laptopRef}
          className="relative z-10 w-full px-4 sm:px-8 md:px-12"
          style={{ maxWidth: 960 }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.215, 0.61, 0.355, 1.0] }}
        >
          {/* Aura detrás del laptop */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: '-70px -50px',
              background: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(182,0,168,0.28) 0%, rgba(118,33,176,0.14) 50%, transparent 80%)',
              filter: 'blur(40px)',
            }}
          />

          {/* ─ LID ─ */}
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(160deg, #1e1e26 0%, #141418 100%)',
              borderRadius: '20px 20px 0 0',
              border: '2.5px solid #2e2e3a',
              borderBottom: 'none',
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: '16/10',
              boxShadow: '0 -12px 60px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Cámara */}
            <div
              style={{
                position: 'absolute', top: 10, left: '50%',
                transform: 'translateX(-50%)',
                width: 9, height: 9, borderRadius: '50%',
                background: '#252530', zIndex: 20,
                boxShadow: 'inset 0 0 0 3px #111115',
              }}
            />

            {/* Bezel pantalla */}
            <div
              style={{
                position: 'absolute',
                inset: '22px 18px 16px',
                borderRadius: 14,
                overflow: 'hidden',
                background: '#0C0C0C',
              }}
            >
              {/* Chrome navegador */}
              <div
                style={{
                  height: 30,
                  background: '#111115',
                  borderBottom: '1px solid #1e1e26',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: 7,
                  flexShrink: 0,
                }}
              >
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
                <div
                  style={{
                    flex: 1, marginLeft: 10,
                    background: '#1e1e26', borderRadius: 7,
                    height: 20, display: 'flex', alignItems: 'center', paddingLeft: 12,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(215,226,234,0.35)', letterSpacing: '0.02em' }}>
                    cyber-ronin.studio
                  </span>
                </div>
              </div>

              {/* ── CYBER RONIN iframe + cursor simulado ── */}
              <div style={{ width: '100%', height: 'calc(100% - 30px)', overflow: 'hidden', position: 'relative' }}>

                <iframe
                  ref={iframeRef}
                  src="/cyber-ronin/index.html"
                  title="Cyber Ronin // Neural Edges"
                  scrolling="no"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '160%',
                    height: '160%',
                    border: 'none',
                    transformOrigin: 'top left',
                    transform: 'scale(0.625)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Cursor dot animado — sigue la trayectoria Lissajous */}
                <div
                  ref={cursorDotRef}
                  style={{
                    position: 'absolute',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(251,219,175,0.95)',
                    background: 'rgba(251,219,175,0.18)',
                    boxShadow: '0 0 0 3px rgba(251,219,175,0.12), 0 0 18px rgba(251,219,175,0.6)',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                    willChange: 'left, top',
                  }}
                />

              </div>
            </div>
          </div>

          {/* ─ BASE / TECLADO ─ */}
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(180deg,#1e1e28 0%,#131318 100%)',
              borderRadius: '0 0 16px 16px',
              border: '2.5px solid #2e2e3a',
              borderTop: '1px solid #3e3e4c',
              height: 32,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Trackpad */}
            <div
              style={{
                width: 110, height: 15,
                borderRadius: 7,
                border: '1px solid #2e2e3a',
                background: '#1a1a22',
              }}
            />
          </div>

          {/* Reflejo de superficie */}
          <div
            style={{
              width: '86%', margin: '0 auto',
              height: 28,
              background: 'linear-gradient(180deg, rgba(182,0,168,0.18) 0%, transparent 100%)',
              borderRadius: '0 0 28px 28px',
            }}
          />
        </motion.div>

        {/* Etiqueta inferior */}
        <motion.div
          className="relative z-10 mt-14 w-full flex justify-center px-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div
            className="flex items-center gap-3 rounded-full px-4 sm:px-6 py-3 overflow-hidden"
            style={{
              background: 'rgba(0,205,176,0.06)',
              border: `1px solid rgba(0,205,176,0.2)`,
              maxWidth: '100%',
            }}
          >
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: TEAL, boxShadow: `0 0 10px ${TEAL}`,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              className="truncate"
              style={{
                color: 'rgba(0,205,176,0.8)',
                fontSize: 12, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              Cyber Ronin — Neural Edges · Proyecto Activo
            </span>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §5  METRICS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-screen overflow-hidden flex items-center"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)' }}
      >
        <video
          src={VIDEOS.metrics}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'hue-rotate(200deg) saturate(1.4) brightness(0.80)' }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={bgVideoPlay}
        />
        {/* Overlay oscuro para que el texto sea legible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,8,6,0.35)' }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto pt-32 pb-32 px-6">
          <motion.p
            className="text-center mb-20 uppercase tracking-[0.2em]"
            style={{ color: 'rgba(0,205,176,0.6)', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
          >
            Resultados Reales
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <div
                  className="text-white font-light leading-none"
                  style={{
                    fontSize: 'clamp(48px, 10vw, 96px)',
                    letterSpacing: '-0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {m.value}
                </div>
                <div
                  className="mt-4 tracking-wide"
                  style={{ color: 'rgba(0,205,176,0.55)', fontSize: 'clamp(13px, 1.1vw, 15px)' }}
                >
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §4  TECHNOLOGY / ADAPTIVE INTELLIGENCE
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full h-screen h-[100dvh] overflow-hidden flex flex-col"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)' }}
      >
        <video
          src={VIDEOS.technology}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'hue-rotate(200deg) saturate(1.4) brightness(0.80)' }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={bgVideoPlay}
        />
        {/* Overlay oscuro para legibilidad */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0,8,6,0.35)' }}
        />

        <div className="relative z-10 flex flex-col flex-1 px-5 sm:px-12 md:px-16 py-10 sm:py-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <motion.h2
              className="text-white font-light leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(36px, 8vw, 72px)' }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.0 }}
            >
              Estrategia
              <br />
              Inteligente
            </motion.h2>

            <motion.p
              className="text-white/50 leading-relaxed max-w-xs md:text-right md:pt-2"
              style={{ fontSize: 'clamp(13px, 1.1vw, 15px)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.0, delay: 0.2 }}
            >
              Analizamos tu mercado, tu audiencia y tu competencia para construir una estrategia
              personalizada que genera resultados desde el primer mes.
            </motion.p>
          </div>

          <div className="flex-1" />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.3 }}
          >
            {TECH_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <div
                  className="text-white font-normal mb-2"
                  style={{ fontSize: 'clamp(14px, 1.1vw, 16px)' }}
                >
                  {f.title}
                </div>
                <div
                  className="text-white/40 leading-relaxed"
                  style={{ fontSize: 'clamp(12px, 1vw, 14px)' }}
                >
                  {f.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          §5  ARCHITECTURE
      ══════════════════════════════════════════════════════════ */}
      <section
        className="w-full min-h-screen flex items-center justify-center relative"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)' }}
      >
        <div className="w-full max-w-3xl mx-auto px-6 py-16 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.0 }}
          >
            <p
              className="uppercase tracking-[0.2em] mb-8"
              style={{ color: 'rgba(0,205,176,0.6)', fontSize: 'clamp(13px, 1.1vw, 14px)' }}
            >
              Nuestro Proceso
            </p>
            <h2
              className="text-white font-light leading-[1.15] tracking-[-0.02em] mb-10"
              style={{ fontSize: 'clamp(28px, 6vw, 56px)' }}
            >
              Tres fases. Resultados sin límite.
            </h2>
            <p
              className="text-white/45 leading-relaxed max-w-xl mx-auto"
              style={{ fontSize: 'clamp(15px, 1.3vw, 17px)' }}
            >
              Primero entendemos tu negocio y tu mercado. Luego ejecutamos con precisión.
              Finalmente escalamos lo que funciona para maximizar tu crecimiento.
            </p>
          </motion.div>

          <motion.div
            className="mt-20 flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {ARCH_LAYERS.map((layer) => (
              <div
                key={layer.num}
                className="w-full max-w-md h-[72px] rounded-lg flex items-center justify-between px-4 sm:px-6"
                style={{ border: '1px solid rgba(0,205,176,0.18)' }}
              >
                <span
                  className="uppercase tracking-[0.15em]"
                  style={{ color: 'rgba(0,205,176,0.45)', fontSize: 12 }}
                >
                  {layer.num}
                </span>
                <span
                  className="text-white font-light"
                  style={{ fontSize: 'clamp(16px, 1.5vw, 18px)' }}
                >
                  {layer.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer
        className="w-full overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #0d2535 0%, #071520 50%, #030a10 100%)' }}
      >
        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Left — video */}
          <div className="relative h-[300px] md:h-auto md:flex-1 overflow-hidden">
            <video
              src={VIDEOS.footer}
              className="w-full h-full object-cover"
              style={{
                filter: 'hue-rotate(200deg) saturate(1.4) brightness(1.1) contrast(1.1)',
                mixBlendMode: 'screen',
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={bgVideoPlay}
            />
          </div>

          {/* Right — branding + copy */}
          <div className="md:flex-1 flex flex-col justify-between p-10 sm:p-16">
            <div>
              <div className="mb-8">
                <img
                  src="/qualio-logo.png"
                  alt="QualioAI"
                  style={{
                    height: 100,
                    width: 'auto',
                    display: 'block',
                  }}
                />
              </div>
              <p
                className="text-white/40 leading-relaxed max-w-sm"
                style={{ fontSize: 'clamp(14px, 1.2vw, 15px)' }}
              >
                Marketing con inteligencia artificial. Construido para marcas que se niegan
                a ser ordinarias.
              </p>
            </div>

            <p className="text-white/25 mt-12" style={{ fontSize: 12 }}>
              © 2026 QualioAI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
