import type { Monster } from '@/domain/entities/Monster'

/** First-run roster. Editable/deletable like any user monster. */
export const SEED_MONSTERS: Monster[] = [
  {
    id: 'seed-ember-cub',
    name: 'Ember Cub',
    attack: 8,
    defense: 4,
    speed: 7,
    hp: 30,
    image_url: '/monsters/ember-cub.json',
  },
  {
    id: 'seed-big-bad-wolf',
    name: 'Big Bad Wolf',
    attack: 5,
    defense: 9,
    speed: 3,
    hp: 45,
    image_url: '/monsters/big-bad-wolf.json',
  },
  {
    id: 'seed-wind-sprite',
    name: 'Wind Sprite',
    attack: 6,
    defense: 3,
    speed: 10,
    hp: 22,
    image_url: '/monsters/wind-sprite.json',
  },
  {
    id: 'seed-funny-monster',
    name: 'Funny Monster',
    attack: 9,
    defense: 7,
    speed: 4,
    hp: 40,
    image_url: '/monsters/funny-monster.json',
  },
  {
    id: 'seed-moss-slime',
    name: 'Moss Slime',
    attack: 4,
    defense: 5,
    speed: 5,
    hp: 35,
    image_url: '/monsters/moss-slime.json',
  },
  {
    id: 'seed-shadow-imp',
    name: 'Shadow Imp',
    attack: 7,
    defense: 2,
    speed: 9,
    hp: 25,
    image_url: '/monsters/shadow-imp.json',
  },
]
