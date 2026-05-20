# Data Integrity Policy — Million Dollar Fist

**Adopted:** 2026-05-20  
**Applies to:** All model assumptions, projected outputs, data visualizations, and training materials

---

## The Principle

> **The goal of this project is to display the truth and develop solutions that respect those truths.**

Million Dollar Fist presents a community-first model as an alternative to traditional government structures. We believe this model works. But our belief in the model is not a license to make the data support it. The data must speak for itself.

If the analysis reveals that a program produces smaller savings than assumed, we update the assumption — not the story. If a lever has no empirical backing, we say so explicitly and flag it as a modeled estimate. If the model, honestly applied, shows a smaller benefit than we expected, we report that benefit honestly.

Advocacy built on inflated numbers is fragile. It collapses when scrutinized. Advocacy built on conservative, well-sourced analysis is durable — and more respectful of the communities we're trying to serve.

---

## Rules

### 1. Every default must have a source
No model lever default may be set without a cited, verifiable source. If a source cannot be found:
- The value must be explicitly marked as a **modeled estimate**
- It must be set **conservatively** (i.e., in the direction that produces a smaller projected benefit, not a larger one)
- It must be flagged for future empirical review

### 2. Sources drive the numbers — not the other way around
When updating a default, start with the source and let it determine the value. Do not start with a desired outcome and search for sources that justify it. If the best available research supports a smaller effect than a prior assumption, the prior assumption must be corrected.

*This is what happened in May 2026 when we corrected the budget split assumptions from 25/20/15/10 to 15/10/10/4, based on Urban Institute data. The corrected splits produce lower projected savings. That is the right outcome.*

### 3. Conservative bias over optimistic bias
When evidence supports a range, use the conservative end unless there is specific reason to do otherwise. Document why if you deviate.

### 4. Distinguish model outputs from scenario inputs
Some values (like `participation_rate`, `community_jobs_created`) are **scenario inputs** — the user sets them based on their community context. These are not model-derived projections and should not be presented as such. They must be clearly labeled as user-defined in all public-facing materials.

### 5. Uncertainty must be visible
Projections are not guarantees. Every public-facing page that displays projected numbers must include a visible note that:
- These are scenario projections based on modeled assumptions
- Links to the Methodology section where assumptions and sources are listed

---

## What to Do When You Find a Problem

If you discover that a current assumption is unsourced, overstated, or inconsistent with available research:

1. Document the issue in a GitHub issue with label `data-integrity`
2. Propose a corrected value with a cited source
3. Update `src/data/model-assumptions.js` with the new value and source before changing any display code
4. Note the change and the reason in the commit message

Do not leave known problems unfixed because fixing them makes the model look less favorable.

---

## Why This Matters

The communities this project serves deserve accuracy more than optimism. A family in Lewiston, Maine or Youngstown, Ohio making decisions based on this model is counting on us to have been honest. A researcher or funder evaluating this work will scrutinize our assumptions. A critic will look for the weakest number and use it to dismiss everything else.

The strongest version of this project is the most honest version.

---

## References
- Model assumptions and sources: `src/data/model-assumptions.js`
- Budget split source: [Urban Institute — State and Local Expenditures](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures)
- Local multiplier source: [AMIBA](https://amiba.net/local-multiplier/) / [Reclaim Democracy](https://reclaimdemocracy.org/local-business-multiplier-effect/)
- Safety spend source: [Vera Institute — CVI Programs](https://www.vera.org/community-violence-intervention-programs-explained)
- Revenue uplift source: [People Powered — PB Research 2025](https://www.peoplepowered.org/news-content/the-latest-research-on-the-impacts-of-participatory-budgeting-2025)
- Health/human services source: [APHA — Community Health Workers](https://www.apha.org/policy-and-advocacy/public-health-policy-briefs/policy-database/2014/07/09/14/19/support-for-community-health-workers-to-increase-health-access)
