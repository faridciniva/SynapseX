import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SynapseXLogo from './SynapseXLogo'
import ScrambleText from './ScrambleText'
import SquashHamburger from './SquashHamburger'
import LlamaIcon from './LlamaIcon'

const TEAL = '#00CDB0'
const SPRING = { type: 'spring' as const, stiffness: 350, damping: 28 }

interface Props {
  entranceComplete: boolean
}

export default function Navbar({ entranceComplete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [aboutHovered, setAboutHovered] = useState(false)
  const [metricsHovered, setMetricsHovered] = useState(false)
  const [downloadHovered, setDownloadHovered] = useState(false)

  const scrollTo = (target: number) => {
    window.scrollTo({ top: target, behavior: 'smooth' })
    setMenuOpen(false)
  }

  const toggle = () => setMenuOpen((o) => !o)

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* ─── DESKTOP (sm and above) ─────────────────────────── */}
      <div className="hidden sm:flex w-full items-center justify-between">
        {/* Left group */}
        <div className="flex items-center gap-2">

          {/* Logo QualioAI — fondo transparente con screen blend */}
          <motion.div
            className={`cursor-pointer select-none ${menuOpen ? 'hidden md:flex' : 'flex'}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src="/qualio-logo.png"
              alt="QualioAI"
              style={{
                height: 64,
                width: 'auto',
                display: 'block',
              }}
            />
          </motion.div>

          {/* Expanding menu pill */}
          <motion.div
            className="relative flex items-center h-12 rounded-[14px] overflow-hidden"
            style={{ background: 'rgba(0,205,176,0.12)', backdropFilter: 'blur(12px)' }}
            animate={{ width: menuOpen ? 290 : 48 }}
            transition={SPRING}
          >
            {/* Hamburger button — resizes when open */}
            <motion.button
              className="flex items-center justify-center flex-shrink-0"
              animate={{
                width: menuOpen ? 36 : 48,
                height: menuOpen ? 36 : 48,
                borderRadius: menuOpen ? 11 : 14,
                marginLeft: menuOpen ? 6 : 0,
              }}
              transition={SPRING}
              style={{
                background: menuOpen ? 'rgba(0,205,176,0.15)' : 'transparent',
              }}
              onClick={toggle}
            >
              <SquashHamburger isOpen={menuOpen} />
            </motion.button>

            {/* Nav links */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="flex items-center gap-6 ml-4 whitespace-nowrap"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    className="text-base font-normal text-white/85 hover:text-white transition-colors"
                    onMouseEnter={() => setAboutHovered(true)}
                    onMouseLeave={() => setAboutHovered(false)}
                    onClick={() => scrollTo(window.innerHeight)}
                  >
                    <ScrambleText text="About" isHovered={aboutHovered} />
                  </button>
                  <button
                    className="text-base font-normal text-white/85 hover:text-white transition-colors"
                    onMouseEnter={() => setMetricsHovered(true)}
                    onMouseLeave={() => setMetricsHovered(false)}
                    onClick={() => scrollTo(window.innerHeight * 2)}
                  >
                    <ScrambleText text="Metrics" isHovered={metricsHovered} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Download button */}
        <motion.button
          className="h-12 px-6 rounded-full flex items-center gap-2 font-medium text-black"
          style={{ background: TEAL }}
          whileHover={{ scale: 1.03, background: '#00FFD4' }}
          whileTap={{ scale: 0.97 }}
          onMouseEnter={() => setDownloadHovered(true)}
          onMouseLeave={() => setDownloadHovered(false)}
        >
          <LlamaIcon size={20} color="black" />
          <ScrambleText text="Contactar" isHovered={downloadHovered} className="text-black" />
        </motion.button>
      </div>

      {/* ─── MOBILE (below sm) ───────────────────────────────── */}
      <div className="flex sm:hidden w-full items-center gap-2">

        {/* Logo pill — collapses when menu opens */}
        <motion.div
          className="overflow-hidden flex-shrink-0 h-10 rounded-[10px] flex items-center"
          style={{ background: 'rgba(0,205,176,0.12)' }}
          animate={{ maxWidth: menuOpen ? 0 : 140, opacity: menuOpen ? 0 : 1 }}
          transition={SPRING}
        >
          <div className="flex items-center px-2.5 whitespace-nowrap">
            <img
              src="/qualio-logo.png"
              alt="QualioAI"
              style={{ height: 32, width: 'auto', display: 'block' }}
            />
          </div>
        </motion.div>

        {/* Menu pill — expands to fill */}
        <div
          className="flex-1 relative flex items-center h-9 rounded-[10px] overflow-hidden"
          style={{ background: 'rgba(0,205,176,0.12)' }}
        >
          <button
            className="flex items-center justify-center w-9 h-9 rounded-[10px] flex-shrink-0"
            onClick={toggle}
          >
            <SquashHamburger isOpen={menuOpen} mobile />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="flex items-center gap-4 ml-2 whitespace-nowrap"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className="text-[13px] text-white/85"
                  onClick={() => scrollTo(window.innerHeight)}
                >
                  About
                </button>
                <button
                  className="text-[13px] text-white/85"
                  onClick={() => scrollTo(window.innerHeight * 2)}
                >
                  Metrics
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile download */}
        <motion.button
          className="h-9 px-3.5 rounded-full flex items-center gap-1.5 text-black text-[13px] font-medium flex-shrink-0"
          style={{ background: TEAL }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <LlamaIcon size={16} color="black" />
          <span>Contactar</span>
        </motion.button>
      </div>
    </motion.nav>
  )
}
