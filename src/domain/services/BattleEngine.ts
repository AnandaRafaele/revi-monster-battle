import type { BattleResult, BattleRound, Monster } from '@/domain/entities/Monster'

export interface SimulateBattleInput {
  /** Fighter selected first — wins initiative ties when speed and attack are equal */
  firstSelected: Monster
  secondSelected: Monster
}

function calcDamage(attack: number, defense: number): number {
  const raw = attack - defense
  return raw <= 0 ? 1 : raw
}

/**
 * Picks who attacks first.
 * Spec: higher speed → else higher attack.
 * Gap (equal speed + attack): first selected wins initiative.
 */
export function resolveInitiative(a: Monster, b: Monster, firstSelectedId: string): Monster {
  if (a.speed !== b.speed) {
    return a.speed > b.speed ? a : b
  }
  if (a.attack !== b.attack) {
    return a.attack > b.attack ? a : b
  }
  return a.id === firstSelectedId ? a : b
}

/**
 * Domain service: computes the entire battle synchronously (no polling).
 * Presentation may replay `rounds` with Motion; math is already done.
 */
export function simulateBattle(input: SimulateBattleInput): BattleResult {
  const { firstSelected, secondSelected } = input
  const a: Monster = { ...firstSelected }
  const b: Monster = { ...secondSelected }

  const hp: Record<string, number> = {
    [a.id]: a.hp,
    [b.id]: b.hp,
  }
  const startingHp = { ...hp }

  const first = resolveInitiative(a, b, firstSelected.id)
  const second = first.id === a.id ? b : a

  let attacker = first
  let defender = second
  const rounds: BattleRound[] = []
  let round = 0

  while (hp[a.id]! > 0 && hp[b.id]! > 0) {
    round += 1
    const damage = calcDamage(attacker.attack, defender.defense)
    hp[defender.id] = Math.max(0, hp[defender.id]! - damage)

    rounds.push({
      round,
      attackerId: attacker.id,
      defenderId: defender.id,
      damage,
      attackerHpAfter: hp[attacker.id]!,
      defenderHpAfter: hp[defender.id]!,
    })

    if (hp[defender.id]! <= 0) break

    const nextAttacker = defender
    defender = attacker
    attacker = nextAttacker
  }

  const winnerId = hp[a.id]! > 0 ? a.id : b.id

  return {
    monsterAId: a.id,
    monsterBId: b.id,
    winnerId,
    rounds,
    startingHp,
  }
}

export const BattleEngine = {
  simulate: simulateBattle,
  resolveInitiative,
  calcDamage,
}
