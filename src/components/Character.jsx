import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useEmotionStore } from '../store/emotionStore'

// ─── Animation Variants ───────────────────────────────────────────

const ANIMATIONS = {
  breathe: {
    animate: { scale: [1, 1.04, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
  },
  wobble: {
    animate: { rotate: [0, -10, 10, -10, 10, 0], transition: { duration: .6, repeat: 2 } }
  },
  shake: {
    animate: { x: [0, -8, 8, -8, 8, 0], transition: { duration: .5, repeat: 1 } }
  },
  bounce: {
    animate: { y: [0, -12, 0, -6, 0], transition: { duration: .7, ease: 'easeOut' } }
  },
  spin: {
    animate: { rotate: [0, 360], scale: [1, 1.2, 1], transition: { duration: .6 } }
  },
  run: {
    animate: { x: [0, 6, -3, 6, 0], rotate: [0, 5, -5, 5, 0], transition: { duration: .8 } }
  },
  party: {
    animate: { y: [0, -14, 0, -8, 0], rotate: [0, 15, -15, 0], scale: [1, 1.3, 1], transition: { duration: .8 } }
  },
  sparkle: {
    animate: { scale: [1, 1.25, .95, 1.1, 1], rotate: [0, 10, -5, 0], transition: { duration: .7 } }
  },
  sleep: {
    animate: { y: [0, 3, 0], scale: [1, .97, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
  },
  nudge: {
    animate: { rotate: [0, -8, 0, -5, 0], transition: { duration: .6 } }
  },
  dizzy: {
    animate: { rotate: [0, 30, -30, 20, -20, 0], scale: [1, .95, 1], transition: { duration: .8 } }
  },
}

// ─── Particle Effect (for party / sparkle) ───────────────────────

function Particles({ active, color }) {
  if (!active) return null
  const dots = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    angle: (i / 6) * 360,
    delay: i * 0.05,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {dots.map(d => (
        <motion.div
          key={d.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((d.angle * Math.PI) / 180) * 28,
            y: Math.sin((d.angle * Math.PI) / 180) * 28,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{ duration: 0.7, delay: d.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 6, height: 6,
            borderRadius: 3,
            background: color,
            marginTop: -3, marginLeft: -3,
          }}
        />
      ))}
    </div>
  )
}

// ─── Character Component ──────────────────────────────────────────

export default function Character({ size = 'md', showLabel = true, showMessage = true }) {
  const { currentState, emotion, isVisible } = useEmotionStore()
  const controls = useAnimation()
  const prevState = useRef(currentState)
  const particleKey = useRef(0)
  const [showParticles, setShowParticles] = React.useState(false)

  const sizeMap = { sm: 36, md: 56, lg: 72 }
  const emojiSize = sizeMap[size] ?? 56
  const anim = ANIMATIONS[emotion.animation] ?? ANIMATIONS.breathe

  useEffect(() => {
    if (currentState !== prevState.current) {
      prevState.current = currentState
      controls.stop()
      controls.start(anim.animate)

      if (['party', 'sparkle', 'spin'].includes(emotion.animation)) {
        particleKey.current += 1
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 900)
      }
    }
  }, [currentState, emotion.animation])

  useEffect(() => {
    controls.start(anim.animate)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={currentState}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            userSelect: 'none',
          }}
        >
          {/* Emoji + particles */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <motion.div
              animate={controls}
              style={{ fontSize: emojiSize, lineHeight: 1, display: 'block' }}
            >
              {emotion.emoji}
            </motion.div>
            <Particles
              key={particleKey.current}
              active={showParticles}
              color={emotion.color}
            />
          </div>

          {/* State label badge */}
          {showLabel && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 10px',
                borderRadius: 99,
                background: emotion.bg,
                color: emotion.color,
                border: `0.5px solid ${emotion.color}40`,
                whiteSpace: 'nowrap',
              }}
            >
              {emotion.label}
            </motion.div>
          )}

          {/* Message bubble */}
          {showMessage && currentState !== 'SystemIdle' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                maxWidth: 180,
                fontSize: 12,
                lineHeight: 1.5,
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                padding: '6px 12px',
                borderRadius: 10,
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              {emotion.message}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
