// MDF Model Calculator — Million Dollar Fist
// Pure client-side, no Supabase needed

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

  // Spend savings
  // Assume rough budget split: safety 25%, H&S 20%, capital 15%, debt 10%, other 30%
  const safetySave   = inp.totalSpend * 0.25 * (inp.safetyReduction / 100);
  const hsSave       = inp.totalSpend * 0.20 * (inp.hsReduction / 100);
  const capitalSave  = inp.totalSpend * 0.15 * (inp.capitalDeferral / 100);
  const debtSave     = inp.totalSpend * 0.10 * (inp.debtReduction / 100);
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
const DEFAULTS = {
  totalRevenue: 50000000, totalSpend: 48000000, population: 50000,
  localMultiplier: 1.2, revenueUplift: 5, safetyReduction: 10,
  hsReduction: 8, capitalDeferral: 5, debtReduction: 3,
  participationRate: 15, communityJobs: 200, dollarsCirculated: 1000000,
  vacantProperties: 25
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
