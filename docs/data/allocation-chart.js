// Allocation Chart — Million Dollar Fist
// Renders a visual breakdown of fund allocation using vanilla JS + SVG

const allocations = [
  { label: 'Food', percent: 50, color: '#e94560' },
  { label: 'Education', percent: 10, color: '#f5a623' },
  { label: 'Housing', percent: 10, color: '#4ecdc4' },
  { label: 'Hygiene', percent: 10, color: '#a8e6cf' },
  { label: 'Health', percent: 5, color: '#88d8b0' },
  { label: 'Business Dev', percent: 3, color: '#6c5ce7' },
  { label: 'Emergency', percent: 5, color: '#fd79a8' },
  { label: 'Investment', percent: 5, color: '#fdcb6e' },
  { label: 'Resident Payout', percent: 1, color: '#74b9ff' },
  { label: 'Business Payout', percent: 1, color: '#a29bfe' },
];

const container = document.getElementById('allocation-chart');

if (container) {
  let html = '<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1rem;">';
  allocations.forEach(a => {
    html += `
      <div style="display:flex;align-items:center;gap:0.5rem;min-width:180px;">
        <div style="width:16px;height:16px;border-radius:50%;background:${a.color};flex-shrink:0;"></div>
        <span>${a.label}: <strong>${a.percent}%</strong></span>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}
