import { create } from 'zustand'
import type { BattleResult, Monster } from '@/domain/entities/Monster'
import { monsterApp } from '@/composition/monsterApp'

interface AppState {
  monsters: Monster[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  lastBattle: BattleResult | null
  loadMonsters: () => Promise<void>
  toggleSelect: (id: string) => void
  clearSelection: () => void
  setLastBattle: (result: BattleResult | null) => void
  setError: (message: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  monsters: [],
  loading: false,
  error: null,
  selectedIds: [],
  lastBattle: null,

  loadMonsters: async () => {
    set({ loading: true, error: null })
    try {
      const monsters = await monsterApp.list()
      set({ monsters, loading: false })
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load monsters',
      })
    }
  },

  toggleSelect: (id: string) => {
    const { selectedIds } = get()
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((x) => x !== id) })
      return
    }
    if (selectedIds.length >= 2) return
    set({ selectedIds: [...selectedIds, id] })
  },

  clearSelection: () => set({ selectedIds: [] }),

  setLastBattle: (result) => set({ lastBattle: result }),

  setError: (message) => set({ error: message }),
}))
