# Monster Battle Arena

Front-only React + TypeScript challenge for **Revi · Sr. Software Engineer**.

Players manage a monster roster, pick two fighters, and watch an automatic battle. The combat math is computed **all at once** in a pure domain service; the UI **replays** rounds with Motion.

## Run

```bash
npm install
npm run dev
```

```bash
npm test      # Vitest — BattleEngine only (not e2e / not Lighthouse)
npm run build
npm run lighthouse   # metrics: production build + preview + desktop Lighthouse
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Reset roster to seed defaults:** clear site data for this origin, or in DevTools:

```js
localStorage.removeItem('revi-monster-battle:monsters')
location.reload()
```

## Spec coverage

| Requirement | Implementation |
|-------------|----------------|
| React + TypeScript | Vite app |
| No backend | `LocalStorageMonsterAdapter` |
| CRUD (`name`, `attack`, `defense`, `speed`, `hp`, `image_url`) | Form + use cases |
| Battle two monsters + auto result | `/battle` + `startBattle` |
| Initiative / damage / alternating rounds | `BattleEngine.simulate()` |
| All rounds at once | Sync domain result; UI replay only |

### Tie-break (spec gap)

If **speed** and **attack** are equal, the monster the user selected **first** (Fighter 1) attacks first. Documented here and enforced in `resolveInitiative`.

## Architecture (Clean Architecture + Adapter)

```
src/
  domain/           # Entities + BattleEngine (no React)
  application/      # Use cases + MonsterRepository contract
  infrastructure/   # LocalStorageMonsterAdapter + seeds
  presentation/     # React, Zustand, Zod, Motion, Lottie
  composition/      # Composition root wires the Adapter
```

**Patterns:** Clean Architecture, Adapter/Repository, domain service, composition root, Zod validation at the UI border.

**Future backend without rewriting the domain:** implement `HttpMonsterAdapter` for `MonsterRepository`, expose `startBattle` as `POST /battles`. `BattleEngine` stays unchanged.

### Performance & code splitting

- **Route-level lazy loading** — `React.lazy` + `Suspense` in `App.tsx` for Roster, Form, Battle, History, HistoryDetail.
- **Media** — `MonsterMedia` dynamically imports DotLottie; roster cards wait for viewport via `IntersectionObserver` (`eager` on battle / form / replay / winner modal).
- **Build chunks** — Vite `manualChunks` splits `motion` and `lottie` so the initial route payload stays smaller. Production `npm run build` emits separate vendor chunks (visible under `dist/assets/`).

### Accessibility

- Lottie wrappers expose `role="img"` + `aria-label` (same as the `alt` used for static images).
- Roster stats use a proper `<dl>` with `<dt>` / `<dd>` for ATK / DEF / SPD / HP.

## Lighthouse (metrics, not e2e)

`npm run lighthouse` runs `scripts/run-lighthouse.mjs`: builds if `dist/` is missing, starts `vite preview`, then desktop Lighthouse for `/` and `/battle`.

| Output | Path |
|--------|------|
| HTML + JSON | `lighthouse-reports/home.report.{html,json}` |
| | `lighthouse-reports/battle.report.{html,json}` |

Requires **Google Chrome**. Reports are gitignored (`lighthouse-reports/`, Trace gzips, legacy metric JSON names).

This is **separate from Vitest** — unit tests cover battle math; Lighthouse automates Perf / A11y / Best Practices / SEO on a production preview.

Verified desktop scores via `npm run lighthouse` (production preview):

| Route | Perf | A11y | Best Practices | SEO |
|-------|------|------|----------------|-----|
| `/` (home) | 99 | 100 | 100 | 82 |
| `/battle` | 100 | 100 | 100 | 82 |

home: FCP 0.6s · LCP 0.9s · TBT 0ms · CLS 0.005 · battle: FCP 0.5s · LCP 0.8s · TBT 0ms · CLS 0. Home A11y was ~90 before the aria/`dl` fixes above; after fixes it is **100**. Perf ~99–100 is expected run-to-run variance — don’t treat 100 as fixed. SEO 82 is typical for an SPA (meta/crawl). Re-run `npm run lighthouse` for current numbers. Main weight is DotLottie WASM; runtime hot path is Lottie `_draw`, not `BattleEngine`.

## Stack decisions (interview-ready)

| Choice | Why |
|--------|-----|
| Vite | Fast ESM DX vs CRA |
| Zustand | Small global state (roster selection + last battle); Redux would be overkill |
| Zod | One schema → runtime validation + `z.infer` types at the form border |
| Tailwind | Fast, consistent UI in a short deadline |
| Motion | Intentional battle replay / transitions — math stays sync |
| Lottie | Animated seed portraits; `image_url` remains a URL string |
| Vitest | Quality on the deterministic core (not required by the brief) |
| Lighthouse script | Repeatable Perf/A11y metrics on `preview` — not e2e |
| React.lazy + chunks | Smaller initial JS; Motion/Lottie split via `manualChunks` |
| React Router | Clear flows: roster / form / battle / history |
| localStorage | Persistence aligned with “no backend” (monsters + battle history) |

## UX notes

- Bright **Supercell / Clash-inspired** village UI (not dark; not copyrighted CoC art).
- Select up to **2** distinct monsters → Battle → **Fight!** → round replay + **Skip**.
- `prefers-reduced-motion`: show final HP + full log immediately.

## Seed media (LottieFiles)

Seeds use free community animations under the [Lottie Simple License](https://lottiefiles.com/page/license).  
We store the extracted **Lottie JSON** in `public/monsters/*.json` (dotLottie packages were unpacked for reliable playback with DotLottieReact). Credits: `public/monsters/CREDITS.md`.

| File | Animation | Author |
|------|-----------|--------|
| `ember-cub.json` | Monster Red | Yaamin Mohamed |
| `big-bad-wolf.json` | Big Bad Wolfie | Brian Karungani |
| `wind-sprite.json` | Cute Monster | Diego Franzese |
| `funny-monster.json` | Funny monsters | Abdul Latif |
| `moss-slime.json` | Green monster | [hoanhbc](https://lottiefiles.com/free-animation/green-monster-Xm99yZ3RjZ) |
| `shadow-imp.json` | Ah! A Ghost! | Spencer Lalonde |

`image_url` is still a URL string; the UI plays `.json` / `.lottie` with DotLottie and other URLs as `<img>`.

## Battle history (device-local)

Each fight is saved via `LocalStorageBattleAdapter` (max 50 records) with **monster snapshots**, so replays still work after edits/deletes.

- Routes: `/history`, `/history/:id`
- No login → history stays on this browser only
- Clear from the History page, or:

```js
localStorage.removeItem('revi-monster-battle:battles')
```

To refresh seeds after asset changes:

```js
localStorage.removeItem('revi-monster-battle:monsters')
location.reload()
```

## Spec-driven process

Lightweight Spec Kit–style artifacts live in `specs/` (`constitution.md`, feature `spec.md` / `plan.md`). The README remains the human entry point for reviewers.
