# Reconstruction Roadmap

## Sanctuarized business core

The current sacred BBQ domain lives in:

- `src/lib/calculator.js`
- `src/pages/Calc.jsx`
- `src/pages/CookSession.jsx`

Until the new app shell fully replaces the old one, those files remain the
behavioral reference.

## Phase 1

- Create a clean `domain/` layer for the calculator.
- Add regression scenarios that lock current outputs.
- Introduce `modules/` repositories for Supabase, CMS, and auth.
- Keep legacy entrypoints as compatibility facades.

## Phase 2

- Rebuild public pages against the new repositories.
- Rebuild calculator UI against the new calculator domain.
- Rebuild cook session around explicit checkpoints derived from domain outputs.
- Rebuild admin against clean repositories.

## Phase 3

- Remove legacy facades once no route depends on them.
- Remove orphan modules (`BBQEngine`, legacy admin flows, duplicate hooks).
- Simplify routes and providers.
- Finalize design and UX polish on top of a stable architecture.

## Non regression focus

Before any visual or CMS migration, keep these outputs stable:

- `cookMin`
- `totalMin`
- service window start/end
- wrap/stall/probe cues
- timeline step composition
- lamb leg medium vs pulled
- ribs fixed-duration behavior
