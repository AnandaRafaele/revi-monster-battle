import type { Monster } from '@/domain/entities/Monster'
import type { MonsterRepository } from '@/application/repositories/MonsterRepository'

export type CreateMonsterInput = Omit<Monster, 'id'>

export async function createMonster(
  repo: MonsterRepository,
  input: CreateMonsterInput,
): Promise<Monster> {
  const monster: Monster = {
    ...input,
    id: crypto.randomUUID(),
  }
  await repo.save(monster)
  return monster
}
