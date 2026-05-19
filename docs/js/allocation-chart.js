// Allocation chart — homepage MDF donut
const buckets = [
  { label: 'Food', pct: 50, color: '#f5a623' },
  { label: 'Education', pct: 10, color: '#4ecdc4' },
  { label: 'Housing', pct: 10, color: '#a29bfe' },
  { label: 'Hygiene', pct: 10, color: '#88d8b0' },
  { label: 'Health', pct: 5, color: '#fd79a8' },
  { label: 'Emergency Relief', pct: 5, color: '#e94560' },
  { label: 'Investment', pct: 5, color: '#6c5ce7' },
  { label: 'Business Dev', pct: 3, color: '#fdcb6e' },
  { label: 'Resident Payout', pct: 1, color: '#74b9ff' },
  { label: 'Business Payout', pct: 1, color: '#b2bec3' },
];

const container = document.getElementById('allocation-chart');
if (container) {
  const canvas = document.createElement('canvas');
  canvas.id = 'mdf-donut';
  canvas.style.maxHeight = '320px';
  container.appendChild(canvas);
  new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: buckets.map(b => `${b.label} (${b.pct}%)`),
      datasets: [{ data: buckets.map(b => b.pct), backgroundColor: buckets.map(b => b.color), borderWidth: 2, borderColor: '#1a1a2e' }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right', labels: { color: '#ccc', font: { size: 11 }, boxWidth: 12 } },
        tooltip: { backgroundColor: '#1a1a2e', titleColor: '#f5a623', bodyColor: '#ccc' }
      }
    }
  });
}
