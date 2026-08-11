import type { BattleRecord } from '@/domain/entities/BattleRecord'
import type { BattleRepository } from '@/application/repositories/BattleRepository'

const STORAGE_KEY = 'revi-monster-battle:battles'
const MAX_RECORDS = 50

/**
 * Infrastructure Adapter for BattleRepository.
 * Device-local only (no login) — swap for HTTP later without touching use cases.
 */
export class LocalStorageBattleAdapter implements BattleRepository {
  private read(): BattleRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as BattleRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private write(records: BattleRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  async list(): Promise<BattleRecord[]> {
    return this.read()
  }

  async getById(id: string): Promise<BattleRecord | null> {
    return this.read().find((r) => r.id === id) ?? null
  }

  async save(record: BattleRecord): Promise<void> {
    const next = [record, ...this.read().filter((r) => r.id !== record.id)].slice(
      0,
      MAX_RECORDS,
    )
    this.write(next)
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }
}
