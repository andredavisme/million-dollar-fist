# Backlog — Million Dollar Fist

Maintained after each working session. Items move from **Up Next** → **In Progress** → **Done** as work proceeds. Completed sprints are logged in [README.md Changelog](README.md#changelog).

---

## Up Next

### Research
- [ ] Find citation for **Capital Outlay Deferral** lever (currently 3% modeled estimate — community maintenance offset on municipal capital spend)
- [ ] Find citation for **Debt Service Reduction** lever (currently 2% modeled estimate — participatory budgeting impact on debt reliance)

### Features
- [ ] Audit `compare-cities.js` — confirm MDF Model toggle pulls from `model-assumptions.js` and not hardcoded values
- [ ] Review `dashboard.html` for any projected numbers missing disclosure notes
- [ ] User accounts and community registration
- [ ] Disbursement tracking dashboard

### Infrastructure
- [ ] Add `[skip ci]` guard or path filter to workflow so pushes to non-`src/` files don't trigger a sync

---

## In Progress

*Nothing active.*

---

## Done

### 2026-05-20 — Data Integrity Sprint
- [x] Added `src/data/model-assumptions.js` — single source of truth for all lever defaults + cited sources
- [x] Corrected budget split assumptions (25/20/15/10 → 15/10/10/4) based on Urban Institute data
- [x] Updated `calculator.js` defaults to match sourced research values
- [x] Added `src/data-integrity.md` — formal data integrity policy
- [x] Added Methodology section to `how-it-works.html` with per-lever source attribution and research vs. estimate badges
- [x] Upgraded Millbrook disclaimer on `how-it-works.html`
- [x] Added inline projection disclosures to `calculator.html` and `compare-cities.html`
- [x] Added persistent methodology link to `compare-cities.html` (always visible, not just on modeled cities)
- [x] Fixed CI workflow race condition (`git pull --rebase` before push)
- [x] Moved `data-integrity.md` to `src/` so `rsync --delete` no longer wipes it
- [x] Updated README: checked off completed platform goals, added Open Research Items, added Changelog
- [x] Added Get Started page and organizer toolkit
- [x] Standardized header/nav/footer across all pages
