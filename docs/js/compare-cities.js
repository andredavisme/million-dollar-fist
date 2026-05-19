// Compare Cities — Million Dollar Fist
import { supabase } from './supabase-client.js';

const MAX_SELECT = 5;
const MIN_ROAD_COVERAGE = 3;
const CITY_COLORS = ['#f5a623','#e94560','#4ecdc4','#a29bfe','#88d8b0'];
const CHART_COLORS = ['#e94560','#f5a623','#4ecdc4','#a8e6cf','#88d8b0','#6c5ce7','#fd79a8','#fdcb6e','#74b9ff','#a29bfe'];

const MDF_BUCKETS = [
  { label: 'Food', pct: 50 }, { label: 'Education', pct: 10 }, { label: 'Housing', pct: 10 },
  { label: 'Hygiene', pct: 10 }, { label: 'Health', pct: 5 }, { label: 'Emergency', pct: 5 },
  { label: 'Investment', pct: 5 }, { label: 'Business Dev', pct: 3 },
  { label: 'Resident Payout', pct: 1 }, { label: 'Business Payout', pct: 1 },
];

const fmt = (n) => n >= 1_000_000 ? '$' + (n/1_000_000).toFixed(1) + 'M' : n >= 1_000 ? '$' + (n/1_000).toFixed(1) + 'K' : '$' + Math.round(n);

let allCommunities = [], selectedIds = [], activeCharts = [];

function destroyCharts() { activeCharts.forEach(c => c.destroy()); activeCharts = []; }

function makeChart(id, type, labels, datasets, options = {}) {
  const ctx = document.getElementById(id)?.getContext('2d');
  if (!ctx) return null;
  const chart = new Chart(ctx, {
    type, data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#ccc', font: { size: 11 } } }, tooltip: { backgroundColor: '#1a1a2e', titleColor: '#f5a623', bodyColor: '#ccc' } },
      scales: (type !== 'pie' && type !== 'doughnut') ? { x: { ticks: { color: '#aaa', font: { size: 11 } }, grid: { color: '#2a2a4a' } }, y: { ticks: { color: '#aaa', font: { size: 11 } }, grid: { color: '#2a2a4a' } } } : undefined,
      ...options
    }
  });
  activeCharts.push(chart);
  return chart;
}

function getCoverage(data) {
  return {
    budget: data.communities.filter(c => data.budget.some(b => b.community_id === c.id)).length,
    allocations: data.communities.filter(c => data.allocations.some(a => a.community_id === c.id)).length,
    outcomes: data.communities.filter(c => data.outcomes.some(o => o.civic_allocations?.community_id === c.id)).length,
    roads: data.communities.filter(c => data.roads.some(r => r.community_id === c.id)).length,
  };
}

function pillClass(count, total) {
  if (count === total) return 'available';
  if (count >= Math.max(2, total - 2)) return 'partial';
  return 'missing';
}

function buildAvailabilityStrip(data) {
  const total = data.communities.length;
  const cov = getCoverage(data);
  document.getElementById('availability-strip').innerHTML = `
    <div class="availability-pill ${pillClass(cov.budget,total)}">Revenue data: ${cov.budget}/${total}</div>
    <div class="availability-pill ${pillClass(cov.allocations,total)}">Allocation data: ${cov.allocations}/${total}</div>
    <div class="availability-pill ${pillClass(cov.outcomes,total)}">Outcome data: ${cov.outcomes}/${total}</div>
    <div class="availability-pill ${pillClass(cov.roads,total)}">Road data: ${cov.roads}/${total}</div>
  `;
}

async function loadCommunityChips() {
  const { data } = await supabase.from('civic_communities').select('id, name, city, state, population').order('name');
  allCommunities = data || [];
  const container = document.getElementById('city-chips');
  allCommunities.forEach((c, i) => {
    const chip = document.createElement('div');
    chip.className = 'city-chip';
    chip.dataset.id = c.id;
    chip.textContent = `${c.name}${c.city && c.city !== c.name ? ', ' + c.city : ''}, ${c.state}`;
    chip.addEventListener('click', () => toggleChip(chip, c.id));
    container.appendChild(chip);
  });
}

function toggleChip(chip, id) {
  if (chip.classList.contains('selected')) {
    chip.classList.remove('selected');
    selectedIds = selectedIds.filter(s => s !== id);
  } else {
    if (selectedIds.length >= MAX_SELECT) return;
    chip.classList.add('selected');
    selectedIds.push(id);
  }
  const count = selectedIds.length;
  document.getElementById('picker-count').textContent = `${count} / ${MAX_SELECT} selected`;
  document.getElementById('btn-compare').disabled = count < 2;
  document.querySelectorAll('.city-chip').forEach(chip => {
    if (!chip.classList.contains('selected')) chip.classList.toggle('disabled', count >= MAX_SELECT);
  });
}

async function fetchCommunityData(ids) {
  const communities = allCommunities.filter(c => ids.includes(c.id));
  const [budgetRes, allocRes, outcomeRes, roadRes] = await Promise.all([
    supabase.from('civic_budget_sources').select('community_id, amount_collected').in('community_id', ids),
    supabase.from('civic_allocations').select('community_id, category, amount_allocated, amount_spent').in('community_id', ids),
    supabase.from('civic_outcomes').select('outcome_status, civic_allocations!inner(community_id)').in('civic_allocations.community_id', ids),
    supabase.from('road_segments').select('community_id, condition_score').in('community_id', ids).not('condition_score','is',null),
  ]);
  return { communities, budget: budgetRes.data||[], allocations: allocRes.data||[], outcomes: outcomeRes.data||[], roads: roadRes.data||[] };
}

function buildSummaryCards(data) {
  const { communities, budget, allocations, outcomes, roads } = data;
  const container = document.getElementById('summary-cards');
  container.innerHTML = '';
  communities.forEach((c, i) => {
    const color = CITY_COLORS[i];
    const totalRevenue = budget.filter(b => b.community_id === c.id).reduce((s,b)=>s+Number(b.amount_collected||0),0);
    const totalAlloc = allocations.filter(a => a.community_id === c.id).reduce((s,a)=>s+Number(a.amount_allocated||0),0);
    const hasBudget = budget.some(b=>b.community_id===c.id);
    const hasAlloc = allocations.some(a=>a.community_id===c.id);
    const hasOutcome = outcomes.some(o=>o.civic_allocations?.community_id===c.id);
    const hasRoads = roads.some(r=>r.community_id===c.id);
    const card = document.createElement('div');
    card.className = 'summary-card';
    card.style.borderColor = color;
    card.innerHTML = `
      <div class="city-name" style="color:${color}">${c.name}, ${c.state}</div>
      <div class="stat"><div class="stat-value" style="color:${color}">${c.population?.toLocaleString()??'--'}</div><div class="stat-label">Population</div></div>
      <div class="stat"><div class="stat-value">${hasBudget?fmt(totalRevenue):'--'}</div><div class="stat-label">Total Revenue</div></div>
      <div class="stat"><div class="stat-value">${hasAlloc?fmt(totalAlloc):'--'}</div><div class="stat-label">Total Allocated</div></div>
      <div class="stat"><div class="stat-value">${hasBudget?fmt(totalRevenue/c.population):'--'}</div><div class="stat-label">Revenue / Capita</div></div>
      <div class="stat"><div class="stat-value">${hasAlloc?fmt(totalAlloc/c.population):'--'}</div><div class="stat-label">Alloc / Capita</div></div>
      <div class="data-flags">
        <span class="flag ${hasBudget?'good':'warn'}">Revenue ${hasBudget?'✓':'missing'}</span>
        <span class="flag ${hasAlloc?'good':'warn'}">Allocations ${hasAlloc?'✓':'missing'}</span>
        <span class="flag ${hasOutcome?'good':'warn'}">Outcomes ${hasOutcome?'✓':'missing'}</span>
        <span class="flag ${hasRoads?'good':'warn'}">Roads ${hasRoads?'✓':'missing'}</span>
      </div>`;
    container.appendChild(card);
  });
}

function buildPerCapitaCharts(data) {
  const { communities, budget, allocations } = data;
  const labels = communities.map(c=>`${c.name}, ${c.state}`);
  const colors = communities.map((_,i)=>CITY_COLORS[i]);
  makeChart('revenuePerCapitaChart','bar',labels,[{ label:'Revenue per Capita ($)', data: communities.map(c=>{ const t=budget.filter(b=>b.community_id===c.id).reduce((s,b)=>s+Number(b.amount_collected||0),0); return c.population&&t?+(t/c.population).toFixed(0):null; }), backgroundColor:colors, borderWidth:0, borderRadius:4 }],{ plugins:{ legend:{ display:false } } });
  makeChart('allocPerCapitaChart','bar',labels,[{ label:'Allocation per Capita ($)', data: communities.map(c=>{ const t=allocations.filter(a=>a.community_id===c.id).reduce((s,a)=>s+Number(a.amount_allocated||0),0); return c.population&&t?+(t/c.population).toFixed(0):null; }), backgroundColor:colors, borderWidth:0, borderRadius:4 }],{ plugins:{ legend:{ display:false } } });
}

function buildCategoryDonuts(data) {
  const { communities, allocations } = data;
  const container = document.getElementById('category-donuts');
  container.innerHTML = '';
  communities.forEach((c, i) => {
    const color = CITY_COLORS[i];
    const cityAllocs = allocations.filter(a=>a.community_id===c.id);
    const grouped = {};
    cityAllocs.forEach(a=>{ const k=a.category.replace(/_/g,' '); grouped[k]=(grouped[k]||0)+Number(a.amount_allocated||0); });
    const wrap = document.createElement('div');
    wrap.className = 'donut-item';
    if (!cityAllocs.length) {
      wrap.innerHTML = `<div class="donut-label" style="color:${color}">${c.name}, ${c.state}</div><div class="chart-desc">No comparable category data available.</div>`;
      container.appendChild(wrap); return;
    }
    const canvasId = `donut-${c.id}`;
    wrap.innerHTML = `<div class="donut-label" style="color:${color}">${c.name}, ${c.state}</div><canvas id="${canvasId}" height="180"></canvas>`;
    container.appendChild(wrap);
    setTimeout(() => {
      const ctx = document.getElementById(canvasId)?.getContext('2d');
      if (!ctx) return;
      const labels = Object.keys(grouped);
      activeCharts.push(new Chart(ctx, { type:'doughnut', data:{ labels, datasets:[{ data:Object.values(grouped), backgroundColor:CHART_COLORS.slice(0,labels.length), borderWidth:1, borderColor:'#1a1a2e' }] }, options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#aaa', font:{ size:10 }, boxWidth:10 } }, tooltip:{ backgroundColor:'#1a1a2e', titleColor:'#f5a623', bodyColor:'#ccc' } } } }));
    }, 50);
  });
}

function buildOutcomeChart(data) {
  const { communities, outcomes } = data;
  const statuses = ['achieved','partial','pending','unverified','failed'];
  const statusColors = { achieved:'#4ecdc4', partial:'#fdcb6e', pending:'#888', unverified:'#6c5ce7', failed:'#e94560' };
  makeChart('outcomeCompareChart','bar',communities.map(c=>`${c.name}, ${c.state}`),
    statuses.map(status => ({ label: status.charAt(0).toUpperCase()+status.slice(1), data: communities.map(c=>outcomes.filter(o=>o.outcome_status===status&&o.civic_allocations?.community_id===c.id).length||0), backgroundColor:statusColors[status], borderWidth:0, borderRadius:3 })),
    { scales:{ x:{ stacked:true, ticks:{ color:'#aaa' }, grid:{ color:'#2a2a4a' } }, y:{ stacked:true, ticks:{ color:'#aaa' }, grid:{ color:'#2a2a4a' } } } });
}

function buildRoadConditionChart(data) {
  const { communities, roads } = data;
  const section = document.getElementById('road-section');
  const available = communities.filter(c=>roads.some(r=>r.community_id===c.id));
  if (available.length < MIN_ROAD_COVERAGE) { section.style.display='none'; return; }
  section.style.display = 'block';
  const tag = document.getElementById('road-availability-tag');
  tag.className = `availability-tag ${available.length===communities.length?'available':'partial'}`;
  tag.textContent = available.length===communities.length ? 'Comparable across selected communities' : `${available.length}/${communities.length} communities have road data`;
  document.getElementById('road-chart-desc').textContent = 'State-maintained road datasets only — local street-level inventory varies by municipality.';
  makeChart('roadConditionCompareChart','bar',communities.map(c=>`${c.name}, ${c.state}`),[{ label:'Avg Road Condition (0-100)', data: communities.map(c=>{ const s=roads.filter(r=>r.community_id===c.id); return s.length?+(s.reduce((t,r)=>t+Number(r.condition_score||0),0)/s.length).toFixed(1):null; }), backgroundColor:communities.map((_,i)=>CITY_COLORS[i]), borderWidth:0, borderRadius:4 }],{ plugins:{ legend:{ display:false } }, scales:{ y:{ min:0, max:100, ticks:{ color:'#aaa' }, grid:{ color:'#2a2a4a' } }, x:{ ticks:{ color:'#aaa' }, grid:{ color:'#2a2a4a' } } } });
}

function buildMDFTable(data) {
  const { communities, budget } = data;
  const totals = communities.map(c=>({ ...c, revenue: budget.filter(b=>b.community_id===c.id).reduce((s,b)=>s+Number(b.amount_collected||0),0) }));
  const headers = ['MDF Bucket','%',...totals.map((c,i)=>`<span style="color:${CITY_COLORS[i]}">${c.name}</span>`)].join('</th><th>');
  const rows = MDF_BUCKETS.map(b=>{ const cells=totals.map(c=>`<td>${c.revenue?fmt(c.revenue*b.pct/100):'--'}</td>`).join(''); return `<tr><td class="bucket">${b.label}</td><td class="pct">${b.pct}%</td>${cells}</tr>`; }).join('');
  const totalCells = totals.map(c=>`<td style="color:var(--color-gold);font-weight:800">${c.revenue?fmt(c.revenue):'--'}</td>`).join('');
  document.getElementById('mdf-projection-table').innerHTML = `<table class="mdf-table"><thead><tr><th>${headers}</th></tr></thead><tbody>${rows}<tr style="border-top:2px solid #2a2a4a"><td class="bucket" style="color:var(--color-gold)">Total Revenue</td><td class="pct">100%</td>${totalCells}</tr></tbody></table>`;
}

async function runComparison() {
  destroyCharts();
  const data = await fetchCommunityData(selectedIds);
  buildAvailabilityStrip(data);
  buildSummaryCards(data);
  buildPerCapitaCharts(data);
  buildCategoryDonuts(data);
  buildOutcomeChart(data);
  buildRoadConditionChart(data);
  buildMDFTable(data);
  const results = document.getElementById('comparison-results');
  results.classList.remove('hidden');
  results.scrollIntoView({ behavior:'smooth', block:'start' });
}

await loadCommunityChips();
document.getElementById('btn-compare').addEventListener('click', runComparison);
