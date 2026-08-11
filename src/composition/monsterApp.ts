import type { MonsterRepository } from '@/application/repositories/MonsterRepository'
import type { BattleRepository } from '@/application/repositories/BattleRepository'
import { LocalStorageMonsterAdapter } from '@/infrastructure/adapters/LocalStorageMonsterAdapter'
import { LocalStorageBattleAdapter } from '@/infrastructure/adapters/LocalStorageBattleAdapter'
import { listMonsters } from '@/application/use-cases/list-monsters'
import { createMonster, type CreateMonsterInput } from '@/application/use-cases/create-monster'
import { updateMonster } from '@/application/use-cases/update-monster'
import { deleteMonster } from '@/application/use-cases/delete-monster'
import { startBattle } from '@/application/use-cases/start-battle'
import { recordBattle } from '@/application/use-cases/record-battle'
import { listBattles } from '@/application/use-cases/list-battles'
import { getBattle } from '@/application/use-cases/get-battle'
import { clearBattles } from '@/application/use-cases/clear-battles'
import type { Monster } from '@/domain/entities/Monster'
import type { BattleResult } from '@/domain/entities/Monster'
import type { BattleRecord } from '@/domain/entities/BattleRecord'

/** Composition root — the only place that knows concrete Adapters. */
const monsterRepository: MonsterRepository = new LocalStorageMonsterAdapter()
const battleRepository: BattleRepository = new LocalStorageBattleAdapter()

export const monsterApp = {
  list: () => listMonsters(monsterRepository),
  create: (input: CreateMonsterInput) => createMonster(monsterRepository, input),
  update: (monster: Monster) => updateMonster(monsterRepository, monster),
  remove: (id: string) => deleteMonster(monsterRepository, id),

  /**
   * Runs the Notion battle algorithm and persists a history record (device-local).
   */
  battle: async (firstId: string, secondId: string): Promise<BattleRecord> => {
    const result: BattleResult = await startBattle(monsterRepository, firstId, secondId)
    const first = await monsterRepository.getById(firstId)
    const second = await monsterRepository.getById(secondId)
    if (!first || !second) {
      throw new Error('One or both monsters were not found')
    }
    return recordBattle(battleRepository, {
      firstSelected: first,
      secondSelected: second,
      result,
    })
  },

  listBattles: () => listBattles(battleRepository),
  getBattle: (id: string) => getBattle(battleRepository, id),
  clearBattles: () => clearBattles(battleRepository),
}
