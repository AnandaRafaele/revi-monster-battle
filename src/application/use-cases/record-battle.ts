import type { BattleRecord } from '@/domain/entities/BattleRecord'
import type { BattleResult, Monster } from '@/domain/entities/Monster'
import type { BattleRepository } from '@/application/repositories/BattleRepository'

export interface RecordBattleInput {
  firstSelected: Monster
  secondSelected: Monster
  result: BattleResult
}

export async function recordBattle(
  repo: BattleRepository,
  input: RecordBattleInput,
): Promise<BattleRecord> {
  const record: BattleRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstSelectedId: input.firstSelected.id,
    monsterA: { ...input.firstSelected },
    monsterB: { ...input.secondSelected },
    result: input.result,
  }
  await repo.save(record)
  return record
}
