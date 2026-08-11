import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { monsterApp } from '@/composition/monsterApp'
import type { BattleRecord } from '@/domain/entities/BattleRecord'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'
import { useAppStore } from '@/presentation/store/appStore'

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function HistoryPage() {
  const setError = useAppStore((s) => s.setError)
  const [records, setRecords] = useState<BattleRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await monsterApp.listBattles())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onClear = async () => {
    if (!window.confirm('Clear all battle history on this device?')) return
    try {
      await monsterApp.clearBattles()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear history')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1f4d2e] md:text-4xl">
            Battle history
          </h1>
          <p className="mt-1 max-w-xl font-semibold text-[#3d4f3f]">
            Saved on this browser only (no login). Snapshots keep past fights even if you edit or
            delete monsters later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/battle" className="chunky-btn chunky-btn-gold">
            Arena
          </Link>
          {records.length > 0 ? (
            <button type="button" className="chunky-btn chunky-btn-danger" onClick={() => void onClear()}>
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="font-semibold text-[#3d4f3f]">Loading history…</p>
      ) : records.length === 0 ? (
        <div className="troop-card text-center">
          <p className="font-display text-xl font-bold text-[#1f4d2e]">No battles yet</p>
          <p className="mt-1 text-[#3d4f3f]">Fight in the arena to build your local history.</p>
          <Link to="/battle" className="chunky-btn chunky-btn-gold mt-4 inline-flex">
            Go to arena
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => {
            const winner =
              r.result.winnerId === r.monsterA.id ? r.monsterA : r.monsterB
            return (
              <li key={r.id}>
                <Link
                  to={`/history/${r.id}`}
                  className="troop-card flex flex-col gap-3 transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MonsterMedia
                      src={r.monsterA.image_url}
                      alt={r.monsterA.name}
                      className="h-14 w-14"
                    />
                    <span className="font-display text-lg font-bold text-[#8a5a00]">VS</span>
                    <MonsterMedia
                      src={r.monsterB.image_url}
                      alt={r.monsterB.name}
                      className="h-14 w-14"
                    />
                    <div>
                      <p className="font-display text-lg font-bold text-[#1f4d2e]">
                        {r.monsterA.name} vs {r.monsterB.name}
                      </p>
                      <p className="text-sm font-semibold text-[#3d4f3f]">
                        Winner: {winner.name} · {r.result.rounds.length} rounds ·{' '}
                        {formatWhen(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="chunky-btn chunky-btn-sky self-start sm:self-center">
                    Replay
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
