import type { BattleRecord } from '@/domain/entities/BattleRecord'

export interface BattleRepository {
  list(): Promise<BattleRecord[]>
  getById(id: string): Promise<BattleRecord | null>
  save(record: BattleRecord): Promise<void>
  clear(): Promise<void>
}
