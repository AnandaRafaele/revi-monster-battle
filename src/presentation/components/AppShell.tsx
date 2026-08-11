import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '@/presentation/store/appStore'

export function AppShell() {
  const selectedIds = useAppStore((s) => s.selectedIds)
  const error = useAppStore((s) => s.error)
  const setError = useAppStore((s) => s.setError)

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-20 border-b-4 border-[#5b3a1a]/25 bg-[#fff6e0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-[#1f4d2e] md:text-3xl">
            Monster Battle <span className="text-[#f0a202]">Arena</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `chunky-btn ${isActive ? 'chunky-btn-sky' : 'chunky-btn-ghost'}`
              }
              end
            >
              Roster
            </NavLink>
            <NavLink
              to="/monsters/new"
              className={({ isActive }) =>
                `chunky-btn ${isActive ? 'chunky-btn-sky' : 'chunky-btn-ghost'}`
              }
            >
              Create
            </NavLink>
            <NavLink
              to="/battle"
              className={({ isActive }) =>
                `chunky-btn ${isActive ? 'chunky-btn-gold' : 'chunky-btn-ghost'}`
              }
            >
              Battle{selectedIds.length ? ` (${selectedIds.length}/2)` : ''}
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `chunky-btn ${isActive ? 'chunky-btn-sky' : 'chunky-btn-ghost'}`
              }
            >
              History
            </NavLink>
          </nav>
        </div>
      </header>

      {error ? (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-red-800">
            <p>{error}</p>
            <button type="button" className="font-bold" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
