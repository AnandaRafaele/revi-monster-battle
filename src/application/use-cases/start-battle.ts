import type { BattleResult } from '@/domain/entities/Monster'
import { BattleEngine } from '@/domain/services/BattleEngine'
import type { MonsterRepository } from '@/application/repositories/MonsterRepository'

export async function startBattle(
  repo: MonsterRepository,
  firstSelectedId: string,
  secondSelectedId: string,
): Promise<BattleResult> {
  if (firstSelectedId === secondSelectedId) {
    throw new Error('Select two different monsters')
  }

  const first = await repo.getById(firstSelectedId)
  const second = await repo.getById(secondSelectedId)

  if (!first || !second) {
    throw new Error('One or both monsters were not found')
  }

  // All rounds computed synchronously here — UI only replays the result.
  return BattleEngine.simulate({
    firstSelected: first,
    secondSelected: second,
  })
}
