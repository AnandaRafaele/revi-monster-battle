# Spec — Monster Battle Arena

## Overview

A front-only React + TypeScript app where users manage a monster roster and battle two monsters. Built with Clean Architecture for a future HTTP Adapter without rewriting domain logic.

## User stories

1. As a player, I can see seed monsters and create/edit/delete my own.
2. As a player, I can select exactly two distinct monsters and start a battle.
3. As a player, I see the battle result automatically, with a Motion replay of precomputed rounds (and Skip).
4. As a player, I can review recent battles on this device (`/history`) with snapshots that survive roster edits.

## Acceptance criteria

- [x] CRUD persists across refresh (localStorage)
- [x] BattleEngine unit tests pass
- [x] Tie-break (equal speed + attack) uses first selected fighter
- [x] README documents run steps, decisions, Lottie credits, architecture evolution
- [x] Battle history persists locally with monster snapshots
- [x] Lazy load routes / Lottie; split motion & lottie chunks in production build
- [x] Lottie and roster stats are accessible (img role + labeled stats list)
- [x] `npm run lighthouse` documents how to measure Perf/A11y on production preview
