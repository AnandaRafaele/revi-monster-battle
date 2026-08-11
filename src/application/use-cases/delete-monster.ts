import type { MonsterRepository } from '@/application/repositories/MonsterRepository'

export async function deleteMonster(
  repo: MonsterRepository,
  id: string,
): Promise<void> {
  const existing = await repo.getById(id)
  if (!existing) {
    throw new Error('Monster not found')
  }
  await repo.remove(id)
}
