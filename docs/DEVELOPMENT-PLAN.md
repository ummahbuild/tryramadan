# Development and verification plan

Updated September 4, 2026. This is a prioritized backlog, not a claim of release readiness. Preserve existing local data and the web landing page while developing the Expo companion.

## Verified baseline

- Monorepo: web, Expo companion, shared calendar/guidance package.
- Previous screen audit: 212 static-path checks across Muslim/newcomer modes and desktop/mobile; 46 focused edge tests; two local save/reload browser flows.
- Expo companion has three passing production-PWA scenarios from the initial migration; native feature parity and real-device verification remain unfinished.
- Full legacy suite is not green. See `SCREEN-AUDIT.md` and `MONOREPO-AUDIT.md` for exact limits.

## Current increment: dynamic recipe details

### BUG-NAV-002 — malformed recipe routes crash or resolve the wrong record

Environment: migrated Vite web app; component reproduction in Vitest/jsdom.

1. Open `/recipe/breakfast/1` or `/recipe/suhoor/1junk`.
2. Observe the detail lookup.

Expected: recipe-not-found view with a working return link. Previously: unsupported meal types index an undefined collection and crash; partial numeric IDs resolve recipe 1. Fix: validate the meal type and whole safe-integer ID before lookup. Regression file: `recipeDetailRegression.test.tsx`.

### BUG-MEAL-001 — servings carry into a different recipe

1. Open a recipe and change servings to 12.
2. Navigate client-side to a different recipe.

Expected: the new recipe starts with its own default serving count. Previously: React reused the old component state. Fix: key the recipe content by route identity, resetting servings and export-panel state together. Same regression file covers navigation.

## Next increments and acceptance gates

Current increment verification: **18 tests passed across three files**, including nine new recipe-detail regressions plus recipe-filter and culture-data checks. Both workspace type-checks passed. These are component/data checks, not a new browser or full-suite certification. React review guidance informed the route-keyed state reset.

### Expo parity increment

Expo now exposes seven touch-friendly sections: Today, Journal, Meals, Progress, Quran, Learn and Settings. Meal notes share the guarded, versioned day-record store and work offline; Progress summarizes and lists saved records; Quran provides clearly online-dependent trusted-reader links; Settings accurately discloses device-only storage and the remaining gaps. Five production-PWA browser scenarios pass, including malformed new-field protection and meal persistence. Expo web, iOS and Android JS exports pass, and workspace type-checks pass. JS exports are not device tests or signed builds.

This is **expanded parity, not full parity**. Prayer/location configuration, calculation methods, notification scheduling, detailed meals/macros/recipes, Quran reading/tracking, qada, habits, achievements, onboarding, import/export and web-data migration are not yet equivalent. The app must continue to call itself a companion until every row below has behavioral tests.

| Priority | Increment | Done when |
| --- | --- | --- |
| P0 | Prayer request correctness | Late location/date/method responses cannot overwrite current times; missing location clears stale times; requests time out and expose retry; cache isolation tests pass. |
| P0 | Legacy interaction failures | Dashboard/onboarding/break-fast tests reflect real accessible controls and meaningful state transitions; no conditional early returns that silently skip verification; full suite completes with all failures explained or fixed. |
| P0 | Data safety | Quota denial, corrupt JSON, malformed stored shapes, undo/import/export and upgrade paths have regressions; failed saves are never reported as persisted. |
| P1 | Dynamic content routes | Recipe, country, habit, guide, persona and program records have representative render/navigation tests plus invalid-ID handling; generated internal links resolve. |
| P1 | Accessible UX | Keyboard and screen-reader walkthroughs of onboarding, logging, location search and dialogs; focus return, errors, large text, dark mode and touch targets checked. |
| P1 | Religious/health review | Source inventory and school-specific claims reviewed by qualified Sunni reviewers; health claims reviewed appropriately; estimates and individualized advice clearly distinguished. No inferred endorsement. |
| P1 | Expo parity, one feature at a time | Agree parity list, extract shared domain logic, port prayer/location then onboarding/settings and remaining features with cross-platform persistence tests. Do not claim full parity meanwhile. |
| P2 | Release performance and PWA | Measure bundles and slow-device interactions; validate service-worker updates/multiple tabs, first-install limitations and offline behavior on deployment target. |

### Prayer correctness increment — September 7

Today-prayer requests now abort superseded work, ignore late completions, time out after ten seconds, reject non-success service payloads, and clear stale times when coordinates are removed. Cache hits still avoid API calls, including zero-valued coordinates. Focused verification: **29 tests passed across two files**; both workspace type-checks passed. A dedicated synthetic late-response ordering test remains desirable even though request-sequence guards are implemented.

### Shared guidance editorial check — September 7

Rechecked `packages/core/src/guidance.ts` in rendered Expo context against Quran 2:187, Quran 2:184–185, Sahih al-Bukhari 1503 and the linked Egypt Dar al-Ifta pregnancy/nursing answer. The boundary, illness/travel and zakat-al-fitr summaries remain supported and appropriately framed as educational paraphrases. The pregnancy/nursing card is deliberately broader and more cautious than the linked institutional answer because Sunni school details differ; it directs users to medical and scholarly guidance rather than prescribing compensation. No wording change was required. This is a source-based editorial check, not qualified scholar certification.

## Execution policy

For each increment: reproduce → regression test → scoped fix → focused tests/type-check → affected browser flows → update this plan. Keep unrelated user edits. Do not silence assertions, bulk-upgrade dependencies, deploy or push without the relevant request. Record test counts per run rather than combining overlapping suites into a misleading total.

## Release gates

- [ ] Full web regression suite and critical E2E flows pass.
- [ ] All known P0 issues above resolved.
- [ ] Native device testing and explicit feature-parity statement.
- [ ] Qualified content review completed; unresolved differences disclosed.
- [ ] Production HTTPS/PWA update, accessibility, privacy and backup checks complete.
