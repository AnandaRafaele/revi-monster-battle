import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/presentation/components/AppShell'

const RosterPage = lazy(() =>
  import('@/presentation/pages/RosterPage').then((m) => ({ default: m.RosterPage })),
)
const MonsterFormPage = lazy(() =>
  import('@/presentation/pages/MonsterFormPage').then((m) => ({ default: m.MonsterFormPage })),
)
const BattlePage = lazy(() =>
  import('@/presentation/pages/BattlePage').then((m) => ({ default: m.BattlePage })),
)
const HistoryPage = lazy(() =>
  import('@/presentation/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
)
const HistoryDetailPage = lazy(() =>
  import('@/presentation/pages/HistoryDetailPage').then((m) => ({
    default: m.HistoryDetailPage,
  })),
)

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center font-display text-lg font-bold text-[#1f4d2e]">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<RosterPage />} />
            <Route path="monsters/new" element={<MonsterFormPage />} />
            <Route path="monsters/:id/edit" element={<MonsterFormPage />} />
            <Route path="battle" element={<BattlePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="history/:id" element={<HistoryDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
