import type { Monster } from '@/domain/entities/Monster'

export interface MonsterRepository {
  list(): Promise<Monster[]>
  getById(id: string): Promise<Monster | null>
  save(monster: Monster): Promise<void>
  remove(id: string): Promise<void>
}
