// Community Data Dashboard — Million Dollar Fist
// Pulls live data from Supabase civic tables and MDF tables

import { supabase } from './supabase-client.js';

// ---- Helpers ----
const fmt = (n) => n >= 1_000_000
  ? '$' + (n / 1_000_000).toFixed(1) + 'M'
  : n >= 1_000
  ? '$' + (n / 1_000).toFixed(0) + 'K'
  : '$' + n.toFixed(0);

const CHART_COLORS = [
  '#e94560','#f5a623','#4ecdc4','#a8e6cf',
  '#88d8b0','#6c5ce7','#fd79a8','#fdcb6e',
  '#74b9ff','#a29bfe','#55efc4','#fab1a0'
];

function makeChart(id, type, labels, datasets, options = {}) {
  const ctx = document.getElementById(id)?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#ccc', font: { size: 11 } } },
        tooltip: { backgroundColor: '#1a1a2e', titleColor: '#f5a623', bodyColor: '#ccc' }
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        x: { ticks: { color: '#aaa', font: { size: 10 } }, grid: { color: '#2a2a4a' } },
        y: { ticks: { color: '#aaa', font: { size: 10 } }, grid: { color: '#2a2a4a' } }
      } : undefined,
      ...options
    }
  });
}

// ---- Load Communities into Selector ----
async function loadCommunitySelector() {
  const { data } = await supabase.from('civic_communities').select('id, name, city, state').order('name');
  const select = document.getElementById('community-select');
  if (!data) return;
  data.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}${c.city ? ' — ' + c.city : ''}, ${c.state || ''}`;
    select.appendChild(opt);
  });
  select.addEventListener('change', () => loadDashboard(select.value));
}

// ---- KPIs ----
async function loadKPIs(communityId) {
  const filter = communityId !== 'all';

  const [communities, budget, allocations, outcomes, roads] = await Promise.all([
    supabase.from('civic_communities').select('id', { count: 'exact', head: true }),
    supabase.from('civic_budget_sources').select('amount_collected').then(r => r.data),
    supabase.from('civic_allocations').select('amount_allocated').then(r => r.data),
    supabase.from('civic_outcomes').select('id', { count: 'exact', head: true }),
    supabase.from('road_segments').select('id', { count: 'exact', head: true }),
  ]);

  const totalCollected = (budget || []).reduce((s, r) => s + Number(r.amount_collected || 0), 0);
  const totalAllocated = (allocations || []).reduce((s, r) => s + Number(r.amount_allocated || 0), 0);

  document.querySelector('#kpi-communities .kpi-value').textContent = communities.count ?? '--';
  document.querySelector('#kpi-total-collected .kpi-value').textContent = fmt(totalCollected);
  document.querySelector('#kpi-total-allocated .kpi-value').textContent = fmt(totalAllocated);
  document.querySelector('#kpi-outcomes .kpi-value').textContent = outcomes.count ?? '--';
  document.querySelector('#kpi-roads .kpi-value').textContent = (roads.count ?? '--').toLocaleString();
}

// ---- Budget Sources Chart ----
async function loadBudgetSourcesChart() {
  const { data } = await supabase.from('civic_budget_sources').select('source_type, amount_collected');
  if (!data?.length) return;
  const grouped = {};
  data.forEach(r => {
    const label = r.source_type.replace(/_/g, ' ');
    grouped[label] = (grouped[label] || 0) + Number(r.amount_collected || 0);
  });
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);
  makeChart('budgetSourcesChart', 'doughnut', labels, [{
    data: values,
    backgroundColor: CHART_COLORS.slice(0, labels.length),
    borderWidth: 1,
    borderColor: '#1a1a2e'
  }]);
}

// ---- Spending by Category ----
async function loadSpendingCategoryChart() {
  const { data } = await supabase.from('civic_allocations').select('category, amount_allocated');
  if (!data?.length) return;
  const grouped = {};
  data.forEach(r => {
    const label = r.category.replace(/_/g, ' ');
    grouped[label] = (grouped[label] || 0) + Number(r.amount_allocated || 0);
  });
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);
  makeChart('spendingCategoryChart', 'pie', labels, [{
    data: values,
    backgroundColor: CHART_COLORS.slice(0, labels.length),
    borderWidth: 1,
    borderColor: '#1a1a2e'
  }]);
}

// ---- Allocation vs Spent Bar Chart ----
async function loadAllocationVsSpentChart() {
  const { data } = await supabase.from('civic_allocations').select('category, amount_allocated, amount_spent');
  if (!data?.length) return;
  const grouped = {};
  data.forEach(r => {
    const label = r.category.replace(/_/g, ' ');
    if (!grouped[label]) grouped[label] = { allocated: 0, spent: 0 };
    grouped[label].allocated += Number(r.amount_allocated || 0);
    grouped[label].spent += Number(r.amount_spent || 0);
  });
  const labels = Object.keys(grouped);
  makeChart('allocationVsSpentChart', 'bar', labels, [
    {
      label: 'Allocated',
      data: labels.map(l => grouped[l].allocated),
      backgroundColor: '#f5a623aa',
      borderColor: '#f5a623',
      borderWidth: 1
    },
    {
      label: 'Spent',
      data: labels.map(l => grouped[l].spent),
      backgroundColor: '#e9456099',
      borderColor: '#e94560',
      borderWidth: 1
    }
  ]);
}

// ---- Outcome Status Doughnut ----
async function loadOutcomeStatusChart() {
  const { data } = await supabase.from('civic_outcomes').select('outcome_status');
  if (!data?.length) return;
  const counts = {};
  data.forEach(r => {
    counts[r.outcome_status] = (counts[r.outcome_status] || 0) + 1;
  });
  const statusColors = { achieved: '#4ecdc4', partial: '#fdcb6e', failed: '#e94560', pending: '#888', unverified: '#6c5ce7' };
  const labels = Object.keys(counts);
  makeChart('outcomeStatusChart', 'doughnut', labels, [{
    data: Object.values(counts),
    backgroundColor: labels.map(l => statusColors[l] || '#aaa'),
    borderWidth: 1,
    borderColor: '#1a1a2e'
  }]);
}

// ---- Road Condition Histogram ----
async function loadRoadConditionChart() {
  const { data } = await supabase.from('road_segments').select('condition_score').not('condition_score', 'is', null);
  if (!data?.length) return;
  const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  data.forEach(r => {
    const s = Number(r.condition_score);
    if (s <= 20) buckets['0-20']++;
    else if (s <= 40) buckets['21-40']++;
    else if (s <= 60) buckets['41-60']++;
    else if (s <= 80) buckets['61-80']++;
    else buckets['81-100']++;
  });
  makeChart('roadConditionChart', 'bar', Object.keys(buckets), [{
    label: 'Road Segments',
    data: Object.values(buckets),
    backgroundColor: ['#e94560','#fd79a8','#fdcb6e','#88d8b0','#4ecdc4'],
    borderWidth: 0
  }], { plugins: { legend: { display: false } } });
}

// ---- MDF vs Gov Comparison Charts ----
async function loadModelComparisonCharts() {
  const { data } = await supabase.from('civic_allocations').select('category, amount_allocated');
  if (!data?.length) return;

  const govGrouped = {};
  data.forEach(r => {
    const label = r.category.replace(/_/g, ' ');
    govGrouped[label] = (govGrouped[label] || 0) + Number(r.amount_allocated || 0);
  });

  const govLabels = Object.keys(govGrouped);
  const govValues = Object.values(govGrouped);

  makeChart('govMixChart', 'doughnut', govLabels, [{
    data: govValues,
    backgroundColor: CHART_COLORS.slice(0, govLabels.length),
    borderWidth: 1,
    borderColor: '#1a1a2e'
  }]);

  const mdfAllocations = [
    { label: 'Food (50%)', pct: 50 },
    { label: 'Education (10%)', pct: 10 },
    { label: 'Housing (10%)', pct: 10 },
    { label: 'Hygiene (10%)', pct: 10 },
    { label: 'Health (5%)', pct: 5 },
    { label: 'Business Dev (3%)', pct: 3 },
    { label: 'Emergency (5%)', pct: 5 },
    { label: 'Investment (5%)', pct: 5 },
    { label: 'Resident Payout (1%)', pct: 1 },
    { label: 'Business Payout (1%)', pct: 1 },
  ];

  makeChart('mdfMixChart', 'doughnut',
    mdfAllocations.map(a => a.label),
    [{
      data: mdfAllocations.map(a => a.pct),
      backgroundColor: CHART_COLORS,
      borderWidth: 1,
      borderColor: '#1a1a2e'
    }]
  );
}

// ---- Evidence Feed ----
async function loadEvidenceFeed() {
  const { data } = await supabase
    .from('civic_evidence')
    .select('title, description, evidence_type, status, location_label')
    .order('created_at', { ascending: false })
    .limit(12);

  const feed = document.getElementById('evidence-feed');
  if (!data?.length) {
    feed.innerHTML = '<p class="loading-msg">No evidence records found yet. Be the first to submit.</p>';
    return;
  }

  feed.innerHTML = data.map(e => `
    <div class="evidence-card">
      <span class="ev-type">${e.evidence_type?.replace(/_/g, ' ') || 'observation'}</span>
      <div class="ev-title">${e.title}</div>
      ${e.location_label ? `<div class="ev-desc" style="color:#74b9ff;font-size:0.75rem;">📍 ${e.location_label}</div>` : ''}
      <div class="ev-desc">${e.description || ''}</div>
      <div class="ev-status ${e.status}">${e.status}</div>
    </div>
  `).join('');
}

// ---- Master Load ----
async function loadDashboard(communityId = 'all') {
  await Promise.all([
    loadKPIs(communityId),
    loadBudgetSourcesChart(),
    loadSpendingCategoryChart(),
    loadAllocationVsSpentChart(),
    loadOutcomeStatusChart(),
    loadRoadConditionChart(),
    loadModelComparisonCharts(),
    loadEvidenceFeed(),
  ]);
}

// ---- Init ----
await loadCommunitySelector();
await loadDashboard();
