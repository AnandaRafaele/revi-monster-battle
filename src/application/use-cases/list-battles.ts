import type { BattleRecord } from '@/domain/entities/BattleRecord'
import type { BattleRepository } from '@/application/repositories/BattleRepository'

export async function listBattles(repo: BattleRepository): Promise<BattleRecord[]> {
  const all = await repo.list()
  return [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
