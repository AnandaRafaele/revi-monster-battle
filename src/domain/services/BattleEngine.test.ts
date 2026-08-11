import { BattleEngine } from '@/domain/services/BattleEngine'
import type { Monster } from '@/domain/entities/Monster'

function monster(
  partial: Omit<Monster, 'image_url'> & { image_url?: string },
): Monster {
  return {
    image_url: `/monsters/${partial.id}.json`,
    ...partial,
  }
}

describe('BattleEngine', () => {
  const fast = monster({
    id: 'fast',
    name: 'Fast',
    attack: 5,
    defense: 2,
    speed: 10,
    hp: 20,
  })
  const tank = monster({
    id: 'tank',
    name: 'Tank',
    attack: 4,
    defense: 8,
    speed: 3,
    hp: 30,
  })

  it('gives initiative to higher speed', () => {
    const first = BattleEngine.resolveInitiative(fast, tank, tank.id)
    expect(first.id).toBe('fast')
  })

  it('breaks speed ties with higher attack', () => {
    const a = monster({ ...fast, id: 'a', speed: 5, attack: 9 })
    const b = monster({ ...tank, id: 'b', speed: 5, attack: 3 })
    expect(BattleEngine.resolveInitiative(a, b, b.id).id).toBe('a')
  })

  it('breaks speed+attack ties with first selected', () => {
    const a = monster({ ...fast, id: 'a', speed: 5, attack: 5 })
    const b = monster({ ...tank, id: 'b', speed: 5, attack: 5 })
    expect(BattleEngine.resolveInitiative(a, b, 'b').id).toBe('b')
    expect(BattleEngine.resolveInitiative(a, b, 'a').id).toBe('a')
  })

  it('uses minimum damage of 1 when defense >= attack', () => {
    expect(BattleEngine.calcDamage(5, 10)).toBe(1)
    expect(BattleEngine.calcDamage(5, 5)).toBe(1)
    expect(BattleEngine.calcDamage(8, 3)).toBe(5)
  })

  it('computes all rounds at once and finds a winner', () => {
    const result = BattleEngine.simulate({
      firstSelected: fast,
      secondSelected: tank,
    })
    expect(result.rounds.length).toBeGreaterThan(0)
    expect(result.winnerId).toBeDefined()
    expect([fast.id, tank.id]).toContain(result.winnerId)
    const last = result.rounds[result.rounds.length - 1]!
    expect(last.defenderHpAfter).toBe(0)
  })

  it('alternates attackers after each round until KO', () => {
    const a = monster({
      id: 'a',
      name: 'A',
      attack: 3,
      defense: 1,
      speed: 10,
      hp: 10,
    })
    const b = monster({
      id: 'b',
      name: 'B',
      attack: 3,
      defense: 1,
      speed: 1,
      hp: 10,
    })
    const result = BattleEngine.simulate({ firstSelected: a, secondSelected: b })
    expect(result.rounds[0]!.attackerId).toBe('a')
    if (result.rounds.length > 1) {
      expect(result.rounds[1]!.attackerId).toBe('b')
    }
  })
})
