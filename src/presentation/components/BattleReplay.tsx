import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { BattleResult, Monster } from '@/domain/entities/Monster'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'
import { WinnerModal } from '@/presentation/components/WinnerModal'

interface BattleReplayProps {
  result: BattleResult
  monsterA: Monster
  monsterB: Monster
  onDone?: () => void
}

const ROUND_MS = 900

export function BattleReplay({ result, monsterA, monsterB, onDone }: BattleReplayProps) {
  const [roundIndex, setRoundIndex] = useState(-1)
  const [done, setDone] = useState(false)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const logRef = useRef<HTMLUListElement>(null)
  const ignoreScrollRef = useRef(false)

  const names = useMemo(
    () => ({
      [monsterA.id]: monsterA.name,
      [monsterB.id]: monsterB.name,
    }),
    [monsterA, monsterB],
  )

  const finishBattle = () => {
    setRoundIndex(result.rounds.length - 1)
    setDone(true)
    setShowWinnerModal(true)
    onDone?.()
  }

  const skip = () => {
    finishBattle()
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
  }, [])

  useEffect(() => {
    setRoundIndex(-1)
    setDone(false)
    setShowWinnerModal(false)
    setAutoScroll(true)
  }, [result])

  useEffect(() => {
    if (done) return

    if (reduceMotion) {
      finishBattle()
      return
    }

    if (roundIndex >= result.rounds.length - 1) {
      const t = window.setTimeout(() => {
        finishBattle()
      }, ROUND_MS)
      return () => window.clearTimeout(t)
    }

    const t = window.setTimeout(() => {
      setRoundIndex((i) => i + 1)
    }, roundIndex < 0 ? 400 : ROUND_MS)

    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finishBattle closes over latest result
  }, [roundIndex, result, done, reduceMotion])

  const visibleRounds = result.rounds.slice(0, Math.max(0, roundIndex + 1))

  const isNearBottom = (el: HTMLElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < 48

  useEffect(() => {
    const el = logRef.current
    if (!el || !autoScroll) return
    ignoreScrollRef.current = true
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
    const t = window.setTimeout(() => {
      ignoreScrollRef.current = false
    }, 120)
    return () => window.clearTimeout(t)
  }, [visibleRounds.length, reduceMotion, autoScroll])

  const onLogScroll = () => {
    const el = logRef.current
    if (!el || ignoreScrollRef.current) return
    if (!isNearBottom(el)) {
      setAutoScroll(false)
    }
  }

  const resumeAutoScroll = () => {
    setAutoScroll(true)
    const el = logRef.current
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  const hpNow = (id: string) => {
    if (roundIndex < 0) return result.startingHp[id] ?? 0
    const last = visibleRounds[visibleRounds.length - 1]
    if (!last) return result.startingHp[id] ?? 0
    if (last.attackerId === id) return last.attackerHpAfter
    if (last.defenderId === id) return last.defenderHpAfter
    for (let i = visibleRounds.length - 1; i >= 0; i--) {
      const r = visibleRounds[i]!
      if (r.attackerId === id) return r.attackerHpAfter
      if (r.defenderId === id) return r.defenderHpAfter
    }
    return result.startingHp[id] ?? 0
  }

  const winner = result.winnerId === monsterA.id ? monsterA : monsterB
  const loser = result.winnerId === monsterA.id ? monsterB : monsterA

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[monsterA, monsterB].map((m) => {
          const max = result.startingHp[m.id] ?? m.hp
          const current = hpNow(m.id)
          const pct = max > 0 ? Math.max(0, (current / max) * 100) : 0
          const isWinner = done && m.id === winner.id
          return (
            <div
              key={m.id}
              className={`troop-card ${isWinner ? 'troop-card-selected' : ''}`}
            >
              <MonsterMedia src={m.image_url} alt={m.name} className="mx-auto h-36 w-36" eager />
              <h3 className="mt-2 text-center font-display text-xl font-bold text-[#1f4d2e]">
                {m.name}
                {isWinner ? ' · Winner' : ''}
              </h3>
              <div className="mt-3 h-5 overflow-hidden rounded-full border-2 border-[#5b3a1a]/40 bg-[#e8f5c8]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#7CB342] to-[#F0A202]"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.45 }}
                />
              </div>
              <p className="mt-1 text-center text-sm font-bold text-[#3d4f3f]">
                {current} / {max} HP
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-[#1f4d2e]">Battle log</h3>
        <div className="flex flex-wrap gap-2">
          {!autoScroll && !done ? (
            <button type="button" className="chunky-btn chunky-btn-sky" onClick={resumeAutoScroll}>
              Follow live
            </button>
          ) : null}
          {autoScroll && !done ? (
            <button
              type="button"
              className="chunky-btn chunky-btn-ghost"
              onClick={() => setAutoScroll(false)}
            >
              Pause scroll
            </button>
          ) : null}
          {!done ? (
            <button type="button" className="chunky-btn chunky-btn-ghost" onClick={skip}>
              Skip
            </button>
          ) : (
            <button
              type="button"
              className="chunky-btn chunky-btn-gold"
              onClick={() => setShowWinnerModal(true)}
            >
              Show podium
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <ul
          ref={logRef}
          onScroll={onLogScroll}
          className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border-2 border-[#5b3a1a]/20 bg-white/70 p-3"
        >
          <AnimatePresence initial={false}>
            {visibleRounds.map((r) => (
              <motion.li
                key={r.round}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-[#fff6e0] px-3 py-2 text-sm font-semibold text-[#3d4f3f]"
              >
                Round {r.round}: {names[r.attackerId]} hits {names[r.defenderId]} for{' '}
                <span className="text-[#c45c26]">{r.damage}</span> damage
                {r.defenderHpAfter <= 0 ? ' — KO!' : ''}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {!autoScroll && !done ? (
          <p className="mt-2 text-center text-xs font-semibold text-[#5a6b5c]">
            Auto-scroll paused — scroll freely or tap Follow live
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {showWinnerModal ? (
          <WinnerModal
            winner={winner}
            loser={loser}
            rounds={result.rounds.length}
            onClose={() => setShowWinnerModal(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
