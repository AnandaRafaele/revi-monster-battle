# Project Constitution — Monster Battle Arena

## Principles

1. **Front-only scope** — No Nest/Express/auth. Persist monsters via Adapter (localStorage today).
2. **Clean Architecture** — Dependencies point inward. Domain and use cases must not import React, Zustand, or localStorage.
3. **Adapter pattern** — `MonsterRepository` is the contract; `LocalStorageMonsterAdapter` is today's implementation. Swap for HTTP later without changing use cases or `BattleEngine`.
4. **Battle math is synchronous** — `BattleEngine.simulate()` computes all rounds at once. Motion only replays the result in the UI.
5. **Simplicity over ceremony** — Prefer thin use-case functions; no empty folders or unused abstractions.
6. **English** — Code, UI copy, and README in English.
7. **Creativity = best solution, not most complex** — Intentional UX (Supercell-bright + Lottie + Motion), not extra libraries for show.
8. **Quality where it pays off** — Vitest on deterministic domain (`BattleEngine`); Lighthouse metrics via `npm run lighthouse` (production preview) are separate from unit tests — not a substitute for e2e.
9. **Accessible media & stats** — Lottie wrappers labeled like images; monster stats use semantic description lists.

## Non-negotiables from the Revi spec

- React + TypeScript
- Monster fields: name, attack, defense, speed, hp, image_url
- Battle between two monsters with automatic result
- Initiative: higher speed → else higher attack → else first selected
- Damage: max(1, attack - defense)
- Alternating rounds until HP ≤ 0
