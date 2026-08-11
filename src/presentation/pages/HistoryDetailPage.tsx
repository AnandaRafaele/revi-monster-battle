import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { monsterApp } from '@/composition/monsterApp'
import type { BattleRecord } from '@/domain/entities/BattleRecord'
import { BattleReplay } from '@/presentation/components/BattleReplay'
import { useAppStore } from '@/presentation/store/appStore'

export function HistoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const setError = useAppStore((s) => s.setError)
  const [record, setRecord] = useState<BattleRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      try {
        const found = await monsterApp.getBattle(id)
        if (!found) {
          setError('Battle not found in local history')
          navigate('/history')
          return
        }
        setRecord(found)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load battle')
        navigate('/history')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate, setError])

  if (loading) {
    return <p className="font-semibold text-[#3d4f3f]">Loading battle…</p>
  }

  if (!record) return null

  return (
    <div className="space-y-6">
      <div>
        <Link to="/history" className="text-sm font-bold text-[#1f6b8a] underline">
          ← Back to history
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#1f4d2e]">
          {record.monsterA.name} vs {record.monsterB.name}
        </h1>
        <p className="mt-1 font-semibold text-[#3d4f3f]">
          Replay uses snapshots from the original fight.
        </p>
      </div>

      <BattleReplay
        key={record.id}
        result={record.result}
        monsterA={record.monsterA}
        monsterB={record.monsterB}
      />
    </div>
  )
}
