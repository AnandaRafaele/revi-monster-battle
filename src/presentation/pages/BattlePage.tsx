import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/presentation/store/appStore'
import { monsterApp } from '@/composition/monsterApp'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'
import { BattleReplay } from '@/presentation/components/BattleReplay'
import type { BattleResult } from '@/domain/entities/Monster'
import type { Monster } from '@/domain/entities/Monster'

export function BattlePage() {
  const navigate = useNavigate()
  const monsters = useAppStore((s) => s.monsters)
  const selectedIds = useAppStore((s) => s.selectedIds)
  const lastBattle = useAppStore((s) => s.lastBattle)
  const loadMonsters = useAppStore((s) => s.loadMonsters)
  const setLastBattle = useAppStore((s) => s.setLastBattle)
  const clearSelection = useAppStore((s) => s.clearSelection)
  const setError = useAppStore((s) => s.setError)

  const [fighting, setFighting] = useState(false)
  const [result, setResult] = useState<BattleResult | null>(lastBattle)
  const [fightersSnapshot, setFightersSnapshot] = useState<{
    a: Monster
    b: Monster
  } | null>(null)
  const [replayKey, setReplayKey] = useState(0)
  const [lastRecordId, setLastRecordId] = useState<string | null>(null)

  useEffect(() => {
    void loadMonsters()
  }, [loadMonsters])

  const fighters = useMemo(() => {
    const [aId, bId] = selectedIds
    return {
      a: monsters.find((m) => m.id === aId) ?? null,
      b: monsters.find((m) => m.id === bId) ?? null,
    }
  }, [monsters, selectedIds])

  const start = async () => {
    if (!fighters.a || !fighters.b) {
      setError('Select two monsters from the roster first.')
      navigate('/')
      return
    }
    setFighting(true)
    try {
      const record = await monsterApp.battle(fighters.a.id, fighters.b.id)
      setResult(record.result)
      setLastBattle(record.result)
      setFightersSnapshot({ a: record.monsterA, b: record.monsterB })
      setLastRecordId(record.id)
      setReplayKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Battle failed')
    } finally {
      setFighting(false)
    }
  }

  const replayA = fightersSnapshot?.a ?? fighters.a
  const replayB = fightersSnapshot?.b ?? fighters.b

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#1f4d2e] md:text-4xl">Arena</h1>
        <p className="mt-1 font-semibold text-[#3d4f3f]">
          Fighter 1 is the first selected on the roster (wins speed+attack ties). Each fight is
          saved to local history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: 'Fighter 1', monster: fighters.a },
          { label: 'Fighter 2', monster: fighters.b },
        ].map((slot) => (
          <div key={slot.label} className="troop-card min-h-48">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-[#8a5a00]">
              {slot.label}
            </p>
            {slot.monster ? (
              <div className="mt-3 flex items-center gap-4">
                <MonsterMedia
                  src={slot.monster.image_url}
                  alt={slot.monster.name}
                  className="h-24 w-24"
                  eager
                />
                <div>
                  <p className="font-display text-xl font-bold text-[#1f4d2e]">
                    {slot.monster.name}
                  </p>
                  <p className="text-sm font-semibold text-[#3d4f3f]">
                    ATK {slot.monster.attack} · DEF {slot.monster.defense} · SPD{' '}
                    {slot.monster.speed} · HP {slot.monster.hp}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-6 font-semibold text-[#5a6b5c]">
                Empty slot — pick from the{' '}
                <Link to="/" className="text-[#1f6b8a] underline">
                  roster
                </Link>
                .
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="chunky-btn chunky-btn-gold"
          disabled={!fighters.a || !fighters.b || fighting}
          onClick={() => void start()}
        >
          {fighting ? 'Battling…' : result ? 'Fight again' : 'Fight!'}
        </button>
        <button type="button" className="chunky-btn chunky-btn-ghost" onClick={clearSelection}>
          Clear selection
        </button>
        <Link to="/history" className="chunky-btn chunky-btn-sky">
          History
        </Link>
        {lastRecordId ? (
          <Link to={`/history/${lastRecordId}`} className="chunky-btn chunky-btn-ghost">
            Open saved fight
          </Link>
        ) : null}
        <Link to="/" className="chunky-btn chunky-btn-ghost">
          Back to roster
        </Link>
      </div>

      {result && replayA && replayB ? (
        <BattleReplay key={replayKey} result={result} monsterA={replayA} monsterB={replayB} />
      ) : null}
    </div>
  )
}
