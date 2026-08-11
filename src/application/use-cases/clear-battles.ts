import type { BattleRepository } from '@/application/repositories/BattleRepository'

export async function clearBattles(repo: BattleRepository): Promise<void> {
  await repo.clear()
}
