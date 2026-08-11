import type { Monster } from '@/domain/entities/Monster'
import type { MonsterRepository } from '@/application/repositories/MonsterRepository'

export async function updateMonster(
  repo: MonsterRepository,
  monster: Monster,
): Promise<Monster> {
  const existing = await repo.getById(monster.id)
  if (!existing) {
    throw new Error('Monster not found')
  }
  await repo.save(monster)
  return monster
}
