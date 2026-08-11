import type { BattleRecord } from '@/domain/entities/BattleRecord'
import type { BattleRepository } from '@/application/repositories/BattleRepository'

export async function getBattle(
  repo: BattleRepository,
  id: string,
): Promise<BattleRecord | null> {
  return repo.getById(id)
}
