import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { monsterFormSchema, type MonsterFormValues } from '@/presentation/validation/monsterFormSchema'
import { monsterApp } from '@/composition/monsterApp'
import { useAppStore } from '@/presentation/store/appStore'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'

const empty: MonsterFormValues = {
  name: '',
  attack: 5,
  defense: 5,
  speed: 5,
  hp: 30,
  image_url: '/monsters/ember-cub.json',
}

export function MonsterFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const setError = useAppStore((s) => s.setError)
  const loadMonsters = useAppStore((s) => s.loadMonsters)

  const [values, setValues] = useState<MonsterFormValues>(empty)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MonsterFormValues, string>>>(
    {},
  )
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      try {
        const list = await monsterApp.list()
        const found = list.find((m) => m.id === id)
        if (!found) {
          setError('Monster not found')
          navigate('/')
          return
        }
        setValues({
          name: found.name,
          attack: found.attack,
          defense: found.defense,
          speed: found.speed,
          hp: found.hp,
          image_url: found.image_url,
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate, setError])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = monsterFormSchema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof MonsterFormValues, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string' && !next[key as keyof MonsterFormValues]) {
          next[key as keyof MonsterFormValues] = issue.message
        }
      }
      setFieldErrors(next)
      return
    }
    setFieldErrors({})
    try {
      if (isEdit && id) {
        await monsterApp.update({ id, ...parsed.data })
      } else {
        await monsterApp.create(parsed.data)
      }
      await loadMonsters()
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  if (loading) {
    return <p className="font-semibold text-[#3d4f3f]">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link to="/" className="text-sm font-bold text-[#1f6b8a] underline">
          ← Back to roster
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#1f4d2e]">
          {isEdit ? 'Edit monster' : 'Create monster'}
        </h1>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="troop-card space-y-4">
        <MonsterMedia src={values.image_url} alt="Preview" className="mx-auto h-40 w-40" eager />

        {(
          [
            ['name', 'Name', 'text'],
            ['image_url', 'Image / Lottie URL', 'text'],
            ['attack', 'Attack', 'number'],
            ['defense', 'Defense', 'number'],
            ['speed', 'Speed', 'number'],
            ['hp', 'HP', 'number'],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm font-bold text-[#3d4f3f]">{label}</span>
            <input
              className="field-input"
              type={type}
              value={values[key]}
              onChange={(ev) =>
                setValues((v) => ({
                  ...v,
                  [key]: type === 'number' ? ev.target.value : ev.target.value,
                }))
              }
            />
            {fieldErrors[key] ? (
              <span className="mt-1 block text-sm font-semibold text-red-600">
                {fieldErrors[key]}
              </span>
            ) : null}
          </label>
        ))}

        <p className="text-xs font-semibold text-[#5a6b5c]">
          Tip: use a path like <code>/monsters/moss-slime.json</code> for Lottie,
          or any image URL. Stats must be integers from 1 to 999.
        </p>

        <button type="submit" className="chunky-btn chunky-btn-gold w-full">
          {isEdit ? 'Save changes' : 'Create monster'}
        </button>
      </form>
    </div>
  )
}
