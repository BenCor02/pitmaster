# Phase 1 Foundation

## Sacred calculator core

The following files are treated as the behavioral source of truth and must not
be altered casually:

- `src/lib/calculator.js`
- `src/domain/calculator/engine.js`
- `src/domain/calculator/referenceScenarios.js`
- `src/domain/calculator/referenceSnapshots.json`
- `scripts/verify-calculator-regression.mjs`

Phase 1 rule:

- architecture may move
- data access may move
- UI may move
- auth/cms/admin may move
- calculator outputs must remain identical on locked scenarios

## Temporary legacy modules kept on purpose

These remain temporarily because they still carry validated behavior or
production data glue:

- `src/lib/calculator.js`
- `src/lib/meats.js`
- `src/lib/images.js`
- `src/features/calculator/pages/CookSessionPage.jsx`

They are kept intentionally, not by accident.

## Immediate rebuild perimeter

These modules define the clean rebuilt foundation:

- `src/context/AuthContext.jsx`
- `src/modules/supabase/client.js`
- `src/modules/auth/repository.js`
- `src/modules/cms/repository.js`
- `src/modules/cooks/repository.js`
- `src/app/routing/AppRouter.jsx`
- `src/app/routing/guards.jsx`

## Architecture target

- `src/domain/`
  - pure BBQ business behavior
- `src/modules/`
  - Supabase repositories and adapters
- `src/features/`
  - route-level product modules
- `src/app/`
  - routing and app boundaries
- `src/components/`
  - shared UI shell only

## Delete order

Delete first:

- dead wrappers
- duplicate route facades
- debug-only screens
- legacy redirects once replaced

Delete last:

- `src/lib/calculator.js`
- any session/timeline code still required to match validated outputs

## Locked scenarios

The following scenarios are explicitly locked for rebuild work:

- `brisket_4kg_120_wrap_kamado`
- `brisket_6kg_120_wrap_kamado`
- `brisket_7kg_120_wrap_kamado`
- `ribs_120_wrap`
- `short_ribs_3_5kg_120_wrap`
- `paleron_3kg_120_wrap`

Plus the broader historical regression set already present in the repo.
