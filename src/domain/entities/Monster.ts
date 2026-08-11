export interface Monster {
  id: string
  name: string
  attack: number
  defense: number
  speed: number
  hp: number
  image_url: string
}

export interface BattleRound {
  round: number
  attackerId: string
  defenderId: string
  damage: number
  attackerHpAfter: number
  defenderHpAfter: number
}

export interface BattleResult {
  monsterAId: string
  monsterBId: string
  winnerId: string
  rounds: BattleRound[]
  /** Snapshot of starting HP for UI bars */
  startingHp: Record<string, number>
}
