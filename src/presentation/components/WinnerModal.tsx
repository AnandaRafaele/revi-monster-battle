import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { Monster } from '@/domain/entities/Monster'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'

interface WinnerModalProps {
  winner: Monster
  loser: Monster
  rounds: number
  onClose: () => void
}

export function WinnerModal({ winner, loser, rounds, onClose }: WinnerModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#1f4d2e]/55 backdrop-blur-[2px]"
        aria-label="Close winner dialog"
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-[#c47f00] bg-gradient-to-b from-[#fff8d6] to-[#ffe08a] px-5 pb-6 pt-8 text-center shadow-[0_12px_0_#8a5a00]"
        initial={{ scale: 0.7, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#8a5a00]">
          Victory!
        </p>
        <h2 id="winner-title" className="mt-1 font-display text-3xl font-bold text-[#1f4d2e]">
          {winner.name} wins
        </h2>
        <p className="mt-1 text-sm font-semibold text-[#5a6b5c]">
          Defeated {loser.name} in {rounds} round{rounds === 1 ? '' : 's'}
        </p>

        {/* Mini podium */}
        <div className="relative mx-auto mt-6 flex items-end justify-center gap-3">
          <div className="flex w-20 flex-col items-center opacity-70">
            <MonsterMedia
              src={loser.image_url}
              alt={loser.name}
              className="h-16 w-16 grayscale"
              eager
            />
            <div className="mt-2 flex h-10 w-full items-start justify-center rounded-t-lg border-2 border-[#5b3a1a]/30 bg-[#cfd8c0] pt-1 font-display text-xs font-bold text-[#3d4f3f]">
              2
            </div>
          </div>

          <div className="relative z-10 flex w-28 flex-col items-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <MonsterMedia src={winner.image_url} alt={winner.name} className="h-28 w-28" eager />
            </motion.div>
            <div className="mt-2 flex h-16 w-full items-start justify-center rounded-t-xl border-2 border-[#c47f00] bg-gradient-to-b from-[#ffd56a] to-[#f0a202] pt-2 font-display text-lg font-bold text-[#3b2208] shadow-[0_4px_0_#8a5a00]">
              1
            </div>
          </div>
        </div>

        <button type="button" className="chunky-btn chunky-btn-gold mt-6 w-full" onClick={onClose}>
          Continue
        </button>
      </motion.div>
    </motion.div>
  )
}
