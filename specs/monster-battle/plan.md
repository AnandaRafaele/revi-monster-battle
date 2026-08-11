# Technical plan

- Vite + React + TS + Tailwind v4
- Zustand (selection + last battle), Zod (forms), Motion (replay), DotLottie (seeds)
- Layers: domain → application → infrastructure → presentation
- Path alias `@/`
- Vitest for BattleEngine only (not e2e; Lighthouse is a separate metrics script)
- Route-level `React.lazy` + `Suspense`; `MonsterMedia` viewport-lazy Lottie + dynamic DotLottie import; Vite `manualChunks` for `motion` / `lottie`
- A11y: Lottie `role="img"` + `aria-label`; MonsterCard stats as `<dl>` / `<dt>` / `<dd>`
- `npm run lighthouse` → `scripts/run-lighthouse.mjs` (build if needed, `vite preview`, desktop `/` + `/battle` → `lighthouse-reports/`)
