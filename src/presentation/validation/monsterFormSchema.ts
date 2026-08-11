import { z } from 'zod'

const stat = z.coerce
  .number()
  .int('Must be a whole number')
  .min(1, 'Minimum is 1')
  .max(999, 'Maximum is 999')

export const monsterFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Max 40 characters'),
  attack: stat,
  defense: stat,
  speed: stat,
  hp: stat,
  image_url: z
    .string()
    .trim()
    .min(1, 'Image URL is required')
    .max(500, 'URL is too long'),
})

export type MonsterFormValues = z.infer<typeof monsterFormSchema>
