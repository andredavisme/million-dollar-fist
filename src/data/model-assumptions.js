// MDF Model Assumptions — Single Source of Truth
// Every default value here must have a cited source.
// If a source cannot be found, the assumption must be flagged as
// "modeled estimate — pending empirical citation" and treated conservatively.
//
// This file is the canonical reference for:
//   1. calculator.js defaults
//   2. compare-cities.js MDF model projections
//   3. The public-facing Methodology section
//
// Data Integrity Policy: docs/data-integrity.md

export const MODEL_ASSUMPTIONS = [
  {
    key: 'localMultiplier',
    label: 'Local Multiplier',
    default: 1.35,
    unit: 'multiplier',
    description:
      'How many times a dollar recirculates in the local economy before leaking out. ' +
      'A value of 1.35 means $1 of local spending generates $1.35 in local economic activity. ' +
      'Based on AMIBA research showing local businesses recirculate ~48% of revenue locally ' +
      'vs. ~14% for chain businesses.',
    source: 'American Independent Business Alliance (AMIBA)',
    sourceUrl: 'https://amiba.net/local-multiplier/',
    secondarySource: 'Reclaim Democracy — The Multiplier Effect of Local Independent Business',
    secondarySourceUrl: 'https://reclaimdemocracy.org/local-business-multiplier-effect/',
    notes:
      'A blended municipal-economy multiplier of 1.35 is conservative relative to sector-specific ' +
      'studies (which range 1.4–2.6×). Used here to avoid overclaiming.'
  },
  {
    key: 'revenueUplift',
    label: 'Revenue Uplift',
    default: 3,
    unit: 'percent',
    description:
      'Projected % increase in a city\'s self-generated revenue attributable to participatory ' +
      'budgeting and community trust-building. Based on case study evidence from PB pilots ' +
      'showing increased civic engagement and accountability.',
    source: 'People Powered — Latest Research on Impacts of Participatory Budgeting (2025)',
    sourceUrl: 'https://www.peoplepowered.org/news-content/the-latest-research-on-the-impacts-of-participatory-budgeting-2025',
    secondarySource: 'Wampler & Touchton — Effects of PB on Municipal Expenditures (World Development, 2014)',
    secondarySourceUrl: 'https://www.sciencedirect.com/science/article/abs/pii/S0305750X13000156',
    notes:
      'Direct municipal revenue uplift evidence is limited. 3% is intentionally conservative. ' +
      'Do not increase this default without new empirical backing.'
  },
  {
    key: 'safetyReduction',
    label: 'Safety Spend Reduction',
    default: 8,
    unit: 'percent',
    description:
      'Projected % reduction in the public safety budget portion as community violence ' +
      'intervention (CVI) programs reduce incident rates. Vera Institute documents 30–50% ' +
      'reductions in violence incidents from CVI programs, which translates to reduced ' +
      'emergency response costs.',
    source: 'Vera Institute of Justice — Community Violence Intervention Programs Explained',
    sourceUrl: 'https://www.vera.org/community-violence-intervention-programs-explained',
    notes:
      'Applied to 15% of total budget (corrected from prior 25% — see budgetSplits). ' +
      'Violence incident reduction ≠ linear budget reduction; 8% is a conservative translation.'
  },
  {
    key: 'hsReduction',
    label: 'Health & Human Services Reduction',
    default: 5,
    unit: 'percent',
    description:
      'Projected % reduction in health and human services budget through community health ' +
      'workers and mutual aid networks diverting demand from emergency and institutional services.',
    source: 'APHA — Support for Community Health Workers to Increase Health Access (2014)',
    sourceUrl: 'https://www.apha.org/policy-and-advocacy/public-health-policy-briefs/policy-database/2014/07/09/14/19/support-for-community-health-workers-to-increase-health-access',
    notes:
      'Quantified municipal-level budget offsets from mutual aid are not well-documented in ' +
      'current literature. 5% is a conservative modeled estimate. Flag this in public methodology.'
  },
  {
    key: 'capitalDeferral',
    label: 'Capital Deferral',
    default: 3,
    unit: 'percent',
    description:
      'Projected % reduction in capital outlay through community-led maintenance programs ' +
      'and community land trust models extending asset lifespan.',
    source: 'Modeled estimate — no direct empirical citation available at this time',
    sourceUrl: null,
    notes:
      'Applied to ~10% of total budget (Urban Institute avg). Conservative at 3%. ' +
      'Must be updated if comparable program data becomes available.'
  },
  {
    key: 'debtReduction',
    label: 'Debt Service Reduction',
    default: 2,
    unit: 'percent',
    description:
      'Projected % reduction in debt service obligations through participatory budgeting ' +
      'reducing reliance on debt financing for community projects.',
    source: 'Modeled estimate — no direct empirical citation available at this time',
    sourceUrl: null,
    notes:
      'Applied to ~4% of total budget (Urban Institute avg for interest on debt). ' +
      'Conservative at 2%. Absolute dollar impact is small at corrected budget split.'
  },
  {
    key: 'participationRate',
    label: 'Participation Rate',
    default: 15,
    unit: 'percent',
    description:
      'Percentage of the community actively engaged in MDF programs. This is a scenario ' +
      'input set by the user, not a model-derived output. Default of 15% represents a ' +
      'mid-range estimate for a mid-sized city (~50k population).',
    source: 'Scenario input — user-defined',
    sourceUrl: null,
    notes: 'Not research-derived. Adjust based on community context.'
  },
  {
    key: 'communityJobs',
    label: 'Community Jobs Created',
    default: 200,
    unit: 'count',
    description:
      'Estimated net new local jobs created through MDF programs. Scenario input. ' +
      'Default of 200 is illustrative for a city of ~50k.',
    source: 'Scenario input — user-defined',
    sourceUrl: null,
    notes: 'Not research-derived. Adjust based on community context.'
  },
  {
    key: 'dollarsCirculated',
    label: 'Dollars Circulated Locally',
    default: 1000000,
    unit: 'dollars',
    description:
      'Estimated additional dollars retained and recirculated in the local economy through ' +
      'MDF programs. Scenario input. Default of $1M is illustrative.',
    source: 'Scenario input — user-defined',
    sourceUrl: null,
    notes: 'Not research-derived. Adjust based on community context.'
  },
  {
    key: 'vacantProperties',
    label: 'Vacant Properties Reduced',
    default: 25,
    unit: 'count',
    description:
      'Number of vacant or blighted properties activated through community programs. ' +
      'Scenario input. Default of 25 is illustrative for a mid-sized city.',
    source: 'Scenario input — user-defined',
    sourceUrl: null,
    notes: 'Not research-derived. Adjust based on community context.'
  }
];

// Budget split assumptions — what % of total municipal spending falls in each category.
// Source: Urban Institute — State and Local Expenditures
// URL: https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures
// Note: Prior version used 25/20/15/10 — those were arbitrary and overstated savings.
// These corrected splits reduce projected savings and more accurately reflect reality.
export const BUDGET_SPLITS = {
  safety:  0.15,   // public safety (police, fire, corrections) — Urban Institute avg ~14%, rounded to 15%
  hs:      0.10,   // health & human services — Urban Institute avg ~10%
  capital: 0.10,   // capital outlay / infrastructure — Urban Institute avg ~10%
  debt:    0.04,   // interest on debt — Urban Institute avg ~3%, rounded to 4%
  source: 'Urban Institute — State and Local Expenditures',
  sourceUrl: 'https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures'
};
