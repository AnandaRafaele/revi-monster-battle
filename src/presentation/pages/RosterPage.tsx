import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { MonsterCard } from '@/presentation/components/MonsterCard'
import { useAppStore } from '@/presentation/store/appStore'
import { monsterApp } from '@/composition/monsterApp'

export function RosterPage() {
  const monsters = useAppStore((s) => s.monsters)
  const loading = useAppStore((s) => s.loading)
  const selectedIds = useAppStore((s) => s.selectedIds)
  const loadMonsters = useAppStore((s) => s.loadMonsters)
  const toggleSelect = useAppStore((s) => s.toggleSelect)
  const clearSelection = useAppStore((s) => s.clearSelection)
  const setError = useAppStore((s) => s.setError)

  useEffect(() => {
    void loadMonsters()
  }, [loadMonsters])

  const onDelete = async (id: string) => {
    try {
      await monsterApp.remove(id)
      if (selectedIds.includes(id)) toggleSelect(id)
      await loadMonsters()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <section className="hero-banner">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-[#8a5a00]">
            Village roster
          </p>
          <h1 className="font-display text-3xl font-bold text-[#1f4d2e] md:text-4xl">
            Train troops. Pick two. Clash!
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold text-[#3d4f3f]">
            Build your monster roster, select Fighter 1 and Fighter 2, then watch a lightning-fast
            arena battle — math computed instantly, replayed for the show.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/monsters/new" className="chunky-btn chunky-btn-gold">
            New monster
          </Link>
          <Link
            to="/battle"
            className={`chunky-btn chunky-btn-sky ${selectedIds.length < 2 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Go to battle ({selectedIds.length}/2)
          </Link>
          {selectedIds.length > 0 ? (
            <button type="button" className="chunky-btn chunky-btn-ghost" onClick={clearSelection}>
              Clear picks
            </button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <p className="font-semibold text-[#3d4f3f]">Loading roster…</p>
      ) : monsters.length === 0 ? (
        <div className="troop-card text-center">
          <p className="font-display text-xl font-bold text-[#1f4d2e]">No monsters yet</p>
          <p className="mt-1 text-[#3d4f3f]">Create your first troop to start battling.</p>
          <Link to="/monsters/new" className="chunky-btn chunky-btn-gold mt-4 inline-flex">
            Create monster
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {monsters.map((m) => {
              const idx = selectedIds.indexOf(m.id)
              return (
                <MonsterCard
                  key={m.id}
                  monster={m}
                  selectedIndex={idx >= 0 ? idx : null}
                  onToggleSelect={() => toggleSelect(m.id)}
                  onDelete={() => void onDelete(m.id)}
                />
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
