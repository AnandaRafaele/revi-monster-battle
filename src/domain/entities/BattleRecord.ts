import type { BattleResult, Monster } from '@/domain/entities/Monster'

/** Persisted fight — monster snapshots so history survives edits/deletes. */
export interface BattleRecord {
  id: string
  createdAt: string
  /** Fighter selected first (initiative tie-break) */
  firstSelectedId: string
  monsterA: Monster
  monsterB: Monster
  result: BattleResult
}
