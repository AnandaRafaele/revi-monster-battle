import type { Monster } from '@/domain/entities/Monster'
import type { MonsterRepository } from '@/application/repositories/MonsterRepository'

export async function listMonsters(repo: MonsterRepository): Promise<Monster[]> {
  return repo.list()
}
