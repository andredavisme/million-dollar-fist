// MDF Model Calculator — Million Dollar Fist
// Pure client-side, no Supabase needed
//
// All default values and budget splits are sourced in:
//   src/data/model-assumptions.js
//
// Data Integrity Policy: docs/data-integrity.md

const fmt = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + '$' + (abs / 1_000_000).toFixed(1) + 'M';
  if (abs >= 1_000) return sign + '$' + (abs / 1_000).toFixed(0) + 'K';
  return sign + '$' + abs.toFixed(0);
};

const fmtPct = (n) => n.toFixed(1) + '%';
const fmtNum = (n) => n.toLocaleString();
const fmtMult = (n) => parseFloat(n).toFixed(2) + '×';
const fmtDollar = (n) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
};

let chartInstance = null;

function getInputs() {
  return {
    totalRevenue:       +document.getElementById('totalRevenue').value,
    totalSpend:         +document.getElementById('totalSpend').value,
    population:         +document.getElementById('population').value,
    localMultiplier:    +document.getElementById('localMultiplier').value,
    revenueUplift:      +document.getElementById('revenueUplift').value,
    safetyReduction:    +document.getElementById('safetyReduction').value,
    hsReduction:        +document.getElementById('hsReduction').value,
    capitalDeferral:    +document.getElementById('capitalDeferral').value,
    debtReduction:      +document.getElementById('debtReduction').value,
    participationRate:  +document.getElementById('participationRate').value,
    communityJobs:      +document.getElementById('communityJobs').value,
    dollarsCirculated:  +document.getElementById('dollarsCirculated').value,
    vacantProperties:   +document.getElementById('vacantProperties').value,
  };
}

function calculate(inp) {
  // Revenue side
  const upliftAmount = inp.totalRevenue * (inp.revenueUplift / 100);
  const mdfRevenue = (inp.totalRevenue + upliftAmount) * inp.localMultiplier;

  // Budget splits sourced from Urban Institute State & Local Expenditure averages.
  // Source: https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures
  // Previously used 25/20/15/10 — those were arbitrary and overstated savings. Corrected below.
  const SAFETY_SPLIT  = 0.15;  // public safety ~14% avg, rounded to 15%
  const HS_SPLIT      = 0.10;  // health & human services ~10% avg
  const CAPITAL_SPLIT = 0.10;  // capital outlay ~10% avg
  const DEBT_SPLIT    = 0.04;  // interest on debt ~3% avg, rounded to 4%

  const safetySave   = inp.totalSpend * SAFETY_SPLIT  * (inp.safetyReduction  / 100);
  const hsSave       = inp.totalSpend * HS_SPLIT       * (inp.hsReduction      / 100);
  const capitalSave  = inp.totalSpend * CAPITAL_SPLIT  * (inp.capitalDeferral  / 100);
  const debtSave     = inp.totalSpend * DEBT_SPLIT     * (inp.debtReduction    / 100);
  const totalSavings = safetySave + hsSave + capitalSave + debtSave;

  const mdfSpend = inp.totalSpend - totalSavings;

  // Surplus
  const baselineSurplus = inp.totalRevenue - inp.totalSpend;
  const mdfSurplus      = mdfRevenue - mdfSpend;
  const netGain         = mdfSurplus - baselineSurplus;
  const perCapita       = inp.population > 0 ? netGain / inp.population : 0;

  return {
    upliftAmount,
    mdfRevenue,
    mdfSpend,
    totalSavings,
    baselineSurplus,
    mdfSurplus,
    netGain,
    perCapita,
    safetySave,
    hsSave,
    capitalSave,
    debtSave,
  };
}

function updateDisplay(inp, res) {
  // KPIs
  const surplusEl = document.getElementById('r-surplus');
  surplusEl.textContent = fmt(res.mdfSurplus);
  surplusEl.className = 'rkpi-val' + (res.mdfSurplus < 0 ? ' negative' : '');

  document.getElementById('r-savings').textContent    = fmt(res.totalSavings);
  document.getElementById('r-uplift').textContent     = fmt(res.upliftAmount);

  const pcEl = document.getElementById('r-perCapita');
  pcEl.textContent = fmt(res.perCapita);
  pcEl.className = 'rkpi-val' + (res.perCapita < 0 ? ' negative' : '');

  document.getElementById('r-jobs').textContent       = fmtNum(inp.communityJobs);
  document.getElementById('r-circulated').textContent = fmtDollar(inp.dollarsCirculated);

  // Chart
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  const ctx = document.getElementById('calcChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Spending', 'Surplus / Deficit'],
      datasets: [
        {
          label: 'Baseline',
          data: [inp.totalRevenue, inp.totalSpend, res.baselineSurplus],
          backgroundColor: '#6c5ce799',
          borderColor: '#6c5ce7',
          borderWidth: 1
        },
        {
          label: 'MDF Model',
          data: [res.mdfRevenue, res.mdfSpend, res.mdfSurplus],
          backgroundColor: '#f5a62399',
          borderColor: '#f5a623',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#ccc', font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleColor: '#f5a623',
          bodyColor: '#ccc',
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#aaa', font: { size: 10 } }, grid: { color: '#2a2a4a' } },
        y: { ticks: { color: '#aaa', font: { size: 10 }, callback: (v) => fmt(v) }, grid: { color: '#2a2a4a' } }
      }
    }
  });

  // Assumptions table
  const rows = [
    ['Local Multiplier',        fmtMult(inp.localMultiplier),   fmt(inp.totalRevenue * (inp.localMultiplier - 1)) + ' additional circulation'],
    ['Revenue Uplift',          fmtPct(inp.revenueUplift),      '+' + fmt(res.upliftAmount)],
    ['Safety Spend Reduction',  fmtPct(inp.safetyReduction),    '-' + fmt(res.safetySave)],
    ['H&S Spend Reduction',     fmtPct(inp.hsReduction),        '-' + fmt(res.hsSave)],
    ['Capital Deferral',        fmtPct(inp.capitalDeferral),    '-' + fmt(res.capitalSave)],
    ['Debt Reduction',          fmtPct(inp.debtReduction),      '-' + fmt(res.debtSave)],
    ['Participation Rate',       fmtPct(inp.participationRate),  fmtNum(Math.round(inp.population * inp.participationRate / 100)) + ' residents engaged'],
    ['Community Jobs',          fmtNum(inp.communityJobs),      fmtNum(inp.communityJobs) + ' net new jobs'],
    ['Dollars Circulated',      fmtDollar(inp.dollarsCirculated), 'retained locally'],
    ['Vacant Properties',       fmtNum(inp.vacantProperties),   fmtNum(inp.vacantProperties) + ' properties activated'],
  ];

  document.getElementById('assumptionsBody').innerHTML = rows.map(([lever, setting, impact]) =>
    `<tr><td>${lever}</td><td>${setting}</td><td>${impact}</td></tr>`
  ).join('');
}

function syncLeverLabels(inp) {
  document.getElementById('localMultiplierVal').textContent  = fmtMult(inp.localMultiplier);
  document.getElementById('revenueUpliftVal').textContent    = fmtPct(inp.revenueUplift);
  document.getElementById('safetyReductionVal').textContent  = fmtPct(inp.safetyReduction);
  document.getElementById('hsReductionVal').textContent      = fmtPct(inp.hsReduction);
  document.getElementById('capitalDeferralVal').textContent  = fmtPct(inp.capitalDeferral);
  document.getElementById('debtReductionVal').textContent    = fmtPct(inp.debtReduction);
  document.getElementById('participationRateVal').textContent = fmtPct(inp.participationRate);
  document.getElementById('communityJobsVal').textContent    = fmtNum(inp.communityJobs);
  document.getElementById('dollarsCirculatedVal').textContent = fmtDollar(inp.dollarsCirculated);
  document.getElementById('vacantPropertiesVal').textContent = fmtNum(inp.vacantProperties);
}

function run() {
  const inp = getInputs();
  syncLeverLabels(inp);
  const res = calculate(inp);
  updateDisplay(inp, res);
}

// Wire up all inputs and sliders
document.querySelectorAll('input[type="range"], input[type="number"]').forEach(el => {
  el.addEventListener('input', run);
});

// Reset button
// Defaults sourced from model-assumptions.js — see that file for citations.
// Do not change these values without updating the source citations in model-assumptions.js first.
const DEFAULTS = {
  totalRevenue: 50000000, totalSpend: 48000000, population: 50000,
  localMultiplier: 1.35,  // AMIBA / Reclaim Democracy local multiplier research
  revenueUplift: 3,       // People Powered PB research (conservative)
  safetyReduction: 8,     // Vera Institute CVI program outcomes (conservative translation)
  hsReduction: 5,         // APHA community health worker research (conservative estimate)
  capitalDeferral: 3,     // Modeled estimate — no direct citation yet
  debtReduction: 2,       // Modeled estimate — no direct citation yet
  participationRate: 15,  // Scenario input — user-defined
  communityJobs: 200,     // Scenario input — user-defined
  dollarsCirculated: 1000000, // Scenario input — user-defined
  vacantProperties: 25    // Scenario input — user-defined
};

document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('totalRevenue').value      = DEFAULTS.totalRevenue;
  document.getElementById('totalSpend').value        = DEFAULTS.totalSpend;
  document.getElementById('population').value        = DEFAULTS.population;
  document.getElementById('localMultiplier').value   = DEFAULTS.localMultiplier;
  document.getElementById('revenueUplift').value     = DEFAULTS.revenueUplift;
  document.getElementById('safetyReduction').value   = DEFAULTS.safetyReduction;
  document.getElementById('hsReduction').value       = DEFAULTS.hsReduction;
  document.getElementById('capitalDeferral').value   = DEFAULTS.capitalDeferral;
  document.getElementById('debtReduction').value     = DEFAULTS.debtReduction;
  document.getElementById('participationRate').value = DEFAULTS.participationRate;
  document.getElementById('communityJobs').value     = DEFAULTS.communityJobs;
  document.getElementById('dollarsCirculated').value = DEFAULTS.dollarsCirculated;
  document.getElementById('vacantProperties').value  = DEFAULTS.vacantProperties;
  run();
});

// Initial render
run();
