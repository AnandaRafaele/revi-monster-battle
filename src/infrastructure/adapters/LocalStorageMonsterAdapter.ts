import type { Monster } from '@/domain/entities/Monster'
import type { MonsterRepository } from '@/application/repositories/MonsterRepository'
import { SEED_MONSTERS } from '@/infrastructure/seeds/monsters'

const STORAGE_KEY = 'revi-monster-battle:monsters'

/**
 * Infrastructure Adapter for MonsterRepository.
 * Tomorrow: HttpMonsterAdapter implementing the same contract.
 */
export class LocalStorageMonsterAdapter implements MonsterRepository {
  private read(): Monster[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      this.write(SEED_MONSTERS)
      return [...SEED_MONSTERS]
    }
    try {
      const parsed = JSON.parse(raw) as Monster[]
      if (!Array.isArray(parsed)) {
        this.write(SEED_MONSTERS)
        return [...SEED_MONSTERS]
      }
      return parsed
    } catch {
      this.write(SEED_MONSTERS)
      return [...SEED_MONSTERS]
    }
  }

  private write(monsters: Monster[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monsters))
  }

  async list(): Promise<Monster[]> {
    return this.read()
  }

  async getById(id: string): Promise<Monster | null> {
    return this.read().find((m) => m.id === id) ?? null
  }

  async save(monster: Monster): Promise<void> {
    const all = this.read()
    const index = all.findIndex((m) => m.id === monster.id)
    if (index >= 0) {
      all[index] = monster
    } else {
      all.push(monster)
    }
    this.write(all)
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((m) => m.id !== id))
  }
}
