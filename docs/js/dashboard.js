// Community Data Dashboard — Million Dollar Fist
import { supabase } from './supabase-client.js';

const fmt = (n) => n >= 1_000_000 ? '$' + (n/1_000_000).toFixed(1) + 'M' : n >= 1_000 ? '$' + (n/1_000).toFixed(1) + 'K' : '$' + Math.round(n);
const CHART_COLORS = ['#f5a623','#e94560','#4ecdc4','#a29bfe','#88d8b0','#6c5ce7','#fd79a8','#fdcb6e','#74b9ff','#a8e6cf'];
const MDF_BUCKETS = [
  { label: 'Food', pct: 50 }, { label: 'Education', pct: 10 }, { label: 'Housing', pct: 10 },
  { label: 'Hygiene', pct: 10 }, { label: 'Health', pct: 5 }, { label: 'Emergency', pct: 5 },
  { label: 'Investment', pct: 5 }, { label: 'Business Dev', pct: 3 }, { label: 'Resident Payout', pct: 1 }, { label: 'Business Payout', pct: 1 },
];

let allCommunities = [];
let currentFilter = 'all';
const activeCharts = {};

function makeChart(id, type, labels, datasets, options = {}) {
  if (activeCharts[id]) activeCharts[id].destroy();
  const ctx = document.getElementById(id)?.getContext('2d');
  if (!ctx) return;
  activeCharts[id] = new Chart(ctx, {
    type, data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#ccc', font: { size: 11 } } }, tooltip: { backgroundColor: '#1a1a2e', titleColor: '#f5a623', bodyColor: '#ccc' } },
      scales: (type !== 'pie' && type !== 'doughnut') ? { x: { ticks: { color: '#aaa' }, grid: { color: '#2a2a4a' } }, y: { ticks: { color: '#aaa' }, grid: { color: '#2a2a4a' } } } : undefined,
      ...options
    }
  });
}

async function loadDashboard(communityId) {
  const ids = communityId === 'all' ? allCommunities.map(c => c.id) : [communityId];

  const [budgetRes, allocRes, outcomeRes, roadRes, evidenceRes] = await Promise.all([
    supabase.from('civic_budget_sources').select('source_type, amount_collected, community_id').in('community_id', ids),
    supabase.from('civic_allocations').select('category, amount_allocated, amount_spent, community_id').in('community_id', ids),
    supabase.from('civic_outcomes').select('outcome_status, civic_allocations!inner(community_id)').in('civic_allocations.community_id', ids),
    supabase.from('road_segments').select('condition_score, community_id').in('community_id', ids).not('condition_score','is',null),
    supabase.from('civic_evidence').select('title, evidence_type, location, status, submitted_at, community_id').in('community_id', ids).order('submitted_at', { ascending: false }).limit(12),
  ]);

  const budget = budgetRes.data || [];
  const allocs = allocRes.data || [];
  const outcomes = outcomeRes.data || [];
  const roads = roadRes.data || [];
  const evidence = evidenceRes.data || [];

  // KPIs
  const totalRev = budget.reduce((s, b) => s + Number(b.amount_collected || 0), 0);
  const totalAlloc = allocs.reduce((s, a) => s + Number(a.amount_allocated || 0), 0);
  document.querySelector('#kpi-communities .kpi-value').textContent = communityId === 'all' ? allCommunities.length : 1;
  document.querySelector('#kpi-total-collected .kpi-value').textContent = fmt(totalRev);
  document.querySelector('#kpi-total-allocated .kpi-value').textContent = fmt(totalAlloc);
  document.querySelector('#kpi-outcomes .kpi-value').textContent = outcomes.length;
  document.querySelector('#kpi-roads .kpi-value').textContent = roads.length.toLocaleString();

  // Budget Sources
  const srcGrouped = {};
  budget.forEach(b => { const k = b.source_type.replace(/_/g,' '); srcGrouped[k] = (srcGrouped[k]||0) + Number(b.amount_collected||0); });
  makeChart('budgetSourcesChart','doughnut',Object.keys(srcGrouped),[{ data: Object.values(srcGrouped), backgroundColor: CHART_COLORS, borderWidth:1, borderColor:'#1a1a2e' }]);

  // Spending by Category
  const catGrouped = {};
  allocs.forEach(a => { const k = a.category.replace(/_/g,' '); catGrouped[k] = (catGrouped[k]||0) + Number(a.amount_allocated||0); });
  makeChart('spendingCategoryChart','pie',Object.keys(catGrouped),[{ data: Object.values(catGrouped), backgroundColor: CHART_COLORS, borderWidth:1, borderColor:'#1a1a2e' }]);

  // Alloc vs Spent
  const avCats = [...new Set(allocs.map(a => a.category.replace(/_/g,' ')))];
  const avAlloc = avCats.map(cat => allocs.filter(a => a.category.replace(/_/g,' ')===cat).reduce((s,a) => s+Number(a.amount_allocated||0),0));
  const avSpent = avCats.map(cat => allocs.filter(a => a.category.replace(/_/g,' ')===cat).reduce((s,a) => s+Number(a.amount_spent||0),0));
  makeChart('allocationVsSpentChart','bar',avCats,[
    { label:'Allocated', data: avAlloc, backgroundColor:'#f5a623', borderRadius:3, borderWidth:0 },
    { label:'Spent', data: avSpent, backgroundColor:'#4ecdc4', borderRadius:3, borderWidth:0 }
  ],{ plugins:{ legend:{ labels:{ color:'#ccc' } } } });

  // Outcome Status
  const statusCounts = { achieved:0, partial:0, pending:0, unverified:0, failed:0 };
  outcomes.forEach(o => { if (statusCounts[o.outcome_status] !== undefined) statusCounts[o.outcome_status]++; });
  makeChart('outcomeStatusChart','doughnut',Object.keys(statusCounts).map(k=>k.charAt(0).toUpperCase()+k.slice(1)),[{ data: Object.values(statusCounts), backgroundColor:['#4ecdc4','#fdcb6e','#888','#6c5ce7','#e94560'], borderWidth:1, borderColor:'#1a1a2e' }]);

  // Road Condition Histogram
  const buckets10 = Array(10).fill(0);
  roads.forEach(r => { const b = Math.min(9, Math.floor(Number(r.condition_score)/10)); buckets10[b]++; });
  makeChart('roadConditionChart','bar',['0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-89','90-100'],[{ label:'Segments', data: buckets10, backgroundColor:'#a29bfe', borderRadius:3, borderWidth:0 }],{ plugins:{ legend:{ display:false } } });

  // MDF vs Gov Mix
  const govCats = Object.keys(catGrouped);
  const govVals = Object.values(catGrouped);
  makeChart('govMixChart','doughnut',govCats,[{ data: govVals, backgroundColor: CHART_COLORS, borderWidth:1, borderColor:'#1a1a2e' }]);
  makeChart('mdfMixChart','doughnut',MDF_BUCKETS.map(b=>b.label),[{ data: MDF_BUCKETS.map(b=>totalRev*b.pct/100), backgroundColor: CHART_COLORS, borderWidth:1, borderColor:'#1a1a2e' }]);

  // Evidence Feed
  const feed = document.getElementById('evidence-feed');
  feed.innerHTML = evidence.length ? evidence.map(e => `
    <div class="evidence-card">
      <div class="ev-type-badge">${e.evidence_type||'general'}</div>
      <div class="ev-title">${e.title||'Untitled'}</div>
      <div class="ev-meta">${e.location||''} &mdash; <span class="ev-status ${e.status}">${e.status||'unverified'}</span></div>
    </div>`).join('') : '<p class="loading-msg">No evidence records found.</p>';
}

async function init() {
  const { data } = await supabase.from('civic_communities').select('id, name, city, state').order('name');
  allCommunities = data || [];
  const sel = document.getElementById('community-select');
  allCommunities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}, ${c.state}`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => { currentFilter = e.target.value; loadDashboard(currentFilter); });
  await loadDashboard('all');
}

init();
