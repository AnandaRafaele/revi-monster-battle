import { motion } from 'motion/react'
import type { Monster } from '@/domain/entities/Monster'
import { MonsterMedia } from '@/presentation/components/MonsterMedia'
import { Link } from 'react-router-dom'

interface MonsterCardProps {
  monster: Monster
  selectedIndex: number | null
  onToggleSelect: () => void
  onDelete: () => void
}

export function MonsterCard({
  monster,
  selectedIndex,
  onToggleSelect,
  onDelete,
}: MonsterCardProps) {
  const selected = selectedIndex !== null

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`troop-card relative flex flex-col gap-3 ${selected ? 'troop-card-selected' : ''}`}
    >
      {selected ? (
        <span className="absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#5b3a1a] bg-[#f0a202] font-display text-sm font-bold text-[#3b2208]">
          {selectedIndex! + 1}
        </span>
      ) : null}

      <MonsterMedia src={monster.image_url} alt={monster.name} className="aspect-square w-full" />

      <div>
        <h2 className="font-display text-xl font-bold text-[#1f4d2e]">{monster.name}</h2>
        <dl className="mt-2 grid grid-cols-2 gap-1 text-sm font-semibold text-[#3d4f3f]">
          <div className="stat-chip flex items-center justify-center gap-1">
            <dt>ATK</dt>
            <dd className="m-0">{monster.attack}</dd>
          </div>
          <div className="stat-chip flex items-center justify-center gap-1">
            <dt>DEF</dt>
            <dd className="m-0">{monster.defense}</dd>
          </div>
          <div className="stat-chip flex items-center justify-center gap-1">
            <dt>SPD</dt>
            <dd className="m-0">{monster.speed}</dd>
          </div>
          <div className="stat-chip flex items-center justify-center gap-1">
            <dt>HP</dt>
            <dd className="m-0">{monster.hp}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <button type="button" className="chunky-btn chunky-btn-sky flex-1" onClick={onToggleSelect}>
          {selected ? 'Deselect' : 'Select'}
        </button>
        <Link to={`/monsters/${monster.id}/edit`} className="chunky-btn chunky-btn-ghost">
          Edit
        </Link>
        <button
          type="button"
          className="chunky-btn chunky-btn-danger"
          onClick={() => {
            if (window.confirm(`Delete ${monster.name}?`)) onDelete()
          }}
        >
          Delete
        </button>
      </div>
    </motion.article>
  )
}
