# Million Dollar Fist

**A community-first philosophy platform.**

Million Dollar Fist is a mission sponsored by Data Solutions for Me LLC. It challenges the assumption that governments are the most effective or efficient stewards of community vision, resource distribution, and emergency response.

The platform educates users on:
- The philosophy of community-first governance
- How community-led models compare to traditional government models
- Interactive data tools showing the benefit of change over current practices

## The Problem

The repeating pattern across communities:
1. A community forms
2. A government is established
3. Community needs emerge
4. The government responds within bureaucratic constraints — independent of the community itself
5. The community becomes the last voice in solving its own problems

The result: housing is unaffordable, youth development is abandoned, and civic engagement is hollowed out.

## The Philosophy

> **"A community-first approach gives full control of the community need to the community. The government's role is strictly infrastructure that is in alignment with the community."**

Where communities lack the people willing to hold accountability for their own well-being, that is the *only* condition under which chaining a community to a government becomes necessary.

## The Model

Funds are raised through global community effort and directed to specific projects addressing basic human survival needs, with the assumption that when those needs are met, individuals can focus on developing their strengths and contributing to community growth.

### Fund Allocation (per $1M raised)

| Project | % of Fund |
|---|---|
| Food Project | 50% |
| Education Project | 10% |
| Housing Project | 10% |
| Hygiene Project | 10% |
| Health Project | 5% |
| Business Development | 3% |
| Emergency Relief Fund | 5% |
| Investment Project | 5% |
| Residential Payout | 1% |
| Business Payout | 1% |

## Data Integrity

This project is built on the principle that **the goal is to display the truth, not to make the data support a conclusion.**

All model defaults are sourced from verified research. When a source cannot be found, assumptions are marked as modeled estimates and set conservatively. Projected outputs are scenario simulations — not guarantees.

See the full policy: [src/data-integrity.md](src/data-integrity.md)  
See all model sources: [src/data/model-assumptions.js](src/data/model-assumptions.js)

## Platform Goals

- [ ] Philosophy education module
- [ ] Government vs. community model comparison
- [ ] Interactive distribution calculator
- [ ] Community data visualizations
- [ ] User accounts and community registration
- [ ] Disbursement tracking dashboard

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (GitHub Pages)
- **Backend:** [Supabase](https://supabase.com) (Auth, Database, Edge Functions)
- **Data:** PostgreSQL via Supabase
- **Hosting:** GitHub Pages / Netlify

## Repository Structure

```
million-dollar-fist/
├── src/
│   ├── data-integrity.md         # Data integrity policy
│   ├── pages/                    # Site pages
│   ├── components/               # Reusable UI components
│   ├── data/
│   │   ├── model-assumptions.js  # All lever defaults + cited sources
│   │   └── calculator.js         # MDF model calculator
│   └── styles/                   # CSS
├── docs/                         # Auto-synced from src/ by CI (do not edit directly)
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge Functions
├── assets/                       # Images, logos, media
└── README.md
```

> **Note:** The `docs/` directory is automatically synced from `src/` by the deploy workflow. Do not edit files in `docs/` directly — changes will be overwritten. All source edits belong in `src/`.

## Supabase Project

- **Project:** andredavisme's Project
- **Region:** us-west-2
- **Project ID:** `hhyhulqngdkwsxhymmcd`

---

*datasolutionsforme.com — Million Dollar Fist*
