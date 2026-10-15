/* ============================================
   EcoLoop — Analytics & Data Visualization
   Powers Chart.js charts with real data from
   EcoStorage, category filtering, and live KPIs.
   ============================================ */

let chartInstances = {};

document.addEventListener('DOMContentLoaded', () => {
  initAnalytics();

  const filterEl = document.getElementById('ana-category-filter');
  if (filterEl) {
    filterEl.addEventListener('change', () => {
      initAnalytics();
    });
  }
});

function reloadAnalytics() {
  initAnalytics();
  showToast('Analytics refreshed from storage.', 'info');
}

function initAnalytics() {
  const selectedCat = document.getElementById('ana-category-filter')?.value || 'ALL';
  const allRequests = EcoStorage.getRequests();
  const activeRequests = allRequests.filter(r => r.status !== 'Cancelled');

  const filteredRequests = selectedCat === 'ALL'
    ? activeRequests
    : activeRequests.filter(r => r.category === selectedCat);

  const emptyState = document.getElementById('ana-empty-state');
  const chartsGrid = document.getElementById('ana-charts-grid');

  if (activeRequests.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (chartsGrid) chartsGrid.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (chartsGrid) chartsGrid.style.display = 'grid';

  // Update KPI Cards
  updateAnalyticsKPIs(filteredRequests, activeRequests);

  // Render Charts
  renderCategoryChart(filteredRequests);
  renderMonthlyChart(filteredRequests);
  renderStatusChart(selectedCat === 'ALL' ? allRequests : allRequests.filter(r => r.category === selectedCat));
  renderGrowthChart(filteredRequests);
  renderEconomicsChart(filteredRequests);
}

/** Update top 4 Analytics KPI cards */
function updateAnalyticsKPIs(requests, allActive) {
  const totalWeight = requests.reduce((sum, r) => sum + (parseFloat(r.weightKg) || 0), 0);
  const totalReqs = requests.length;

  // Find Top Category
  const catCounts = {};
  allActive.forEach(r => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  let topCat = '-';
  let maxCount = 0;
  for (const [c, cnt] of Object.entries(catCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      topCat = c;
    }
  }

  // Estimated economic value of the filtered set
  // Avg ~₹2,200 per 10kg mixed electronics
  const estVal = Math.round(totalWeight * 220);

  document.getElementById('ana-total-weight').textContent = `${totalWeight.toFixed(1)} kg`;
  document.getElementById('ana-total-requests').textContent = totalReqs;
  document.getElementById('ana-top-category').textContent = topCat.split('&')[0].trim();
  document.getElementById('ana-economic-value').textContent = `₹${estVal.toLocaleString('en-IN')}`;
}

/** Destroy previous chart instance before re-creating */
function destroyChart(key) {
  if (chartInstances[key]) {
    chartInstances[key].destroy();
    chartInstances[key] = null;
  }
}

/** Chart 1: Category Breakdown (Doughnut) */
function renderCategoryChart(requests) {
  const ctx = document.getElementById('chart-categories')?.getContext('2d');
  if (!ctx) return;
  destroyChart('categories');

  const catWeights = {};
  requests.forEach(r => {
    catWeights[r.category] = (catWeights[r.category] || 0) + (parseFloat(r.weightKg) || 0);
  });

  const labels = Object.keys(catWeights);
  const data = Object.values(catWeights).map(w => parseFloat(w.toFixed(1)));

  chartInstances.categories = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['No Data'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: [
          '#16A34A', '#22C55E', '#3B82F6', '#8B5CF6',
          '#F59E0B', '#EF4444', '#14B8A6'
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw} kg`
          }
        }
      }
    }
  });
}

/** Chart 2: Monthly Registered Waste (Bar) */
function renderMonthlyChart(requests) {
  const ctx = document.getElementById('chart-monthly')?.getContext('2d');
  if (!ctx) return;
  destroyChart('monthly');

  const monthly = {};
  requests.forEach(r => {
    const d = new Date(r.createdAt);
    const key = `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
    monthly[key] = (monthly[key] || 0) + (parseFloat(r.weightKg) || 0);
  });

  const labels = Object.keys(monthly);
  const data = Object.values(monthly).map(w => parseFloat(w.toFixed(1)));

  chartInstances.monthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Current Month'],
      datasets: [{
        label: 'Weight (kg)',
        data: data.length ? data : [0],
        backgroundColor: 'rgba(22, 163, 74, 0.75)',
        borderColor: '#16A34A',
        borderRadius: 6,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Kilograms (kg)' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/** Chart 3: Collection Lifecycle Status Distribution (Pie) */
function renderStatusChart(requests) {
  const ctx = document.getElementById('chart-status')?.getContext('2d');
  if (!ctx) return;
  destroyChart('status');

  const statuses = {
    'Pending': 0,
    'Scheduled': 0,
    'Collected': 0,
    'Sent to Recycler': 0,
    'Recycled': 0,
    'Cancelled': 0
  };

  requests.forEach(r => {
    if (statuses[r.status] !== undefined) {
      statuses[r.status]++;
    }
  });

  const labels = Object.keys(statuses).filter(s => statuses[s] > 0);
  const data = labels.map(s => statuses[s]);

  chartInstances.status = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels.length ? labels : ['No Requests'],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: [
          '#F59E0B', '#3B82F6', '#16A34A', '#8B5CF6',
          '#059669', '#EF4444'
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}

/** Chart 4: Cumulative Diversion Growth Curve (Line / Area) */
function renderGrowthChart(requests) {
  const ctx = document.getElementById('chart-growth')?.getContext('2d');
  if (!ctx) return;
  destroyChart('growth');

  // Sort chronologically
  const sorted = [...requests].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const points = [];
  let cumWeight = 0;

  sorted.forEach(r => {
    cumWeight += (parseFloat(r.weightKg) || 0);
    const dateStr = formatDate(r.createdAt);
    points.push({ date: dateStr, total: parseFloat(cumWeight.toFixed(1)) });
  });

  // Consolidate duplicate dates
  const consolidated = {};
  points.forEach(p => {
    consolidated[p.date] = p.total;
  });

  const labels = Object.keys(consolidated);
  const data = Object.values(consolidated);

  chartInstances.growth = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['Start'],
      datasets: [{
        label: 'Cumulative Waste Diverted (kg)',
        data: data.length ? data : [0],
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#16A34A'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Cumulative kg' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/** Chart 5: Potential Economic Recovery Value by Material (Horizontal Bar) */
function renderEconomicsChart(requests) {
  const ctx = document.getElementById('chart-economics')?.getContext('2d');
  if (!ctx) return;
  destroyChart('economics');

  const totalWeight = requests.reduce((sum, r) => sum + (parseFloat(r.weightKg) || 0), 0);

  // Estimated material fractions across general mixed e-waste
  const goldVal = Math.round((totalWeight * 0.00007) * 1000 * 6500);       // ₹6500/g gold
  const silverVal = Math.round((totalWeight * 0.00035) * 1000 * 80);        // ₹80/g silver
  const copperVal = Math.round((totalWeight * 0.15) * 680);                 // ₹680/kg copper
  const alumSteelVal = Math.round((totalWeight * 0.38) * 65);              // ₹65/kg structural alloys
  const plasticsVal = Math.round((totalWeight * 0.30) * 45);               // ₹45/kg clean polymers

  const materials = ['Gold (Au)', 'Copper (Cu)', 'Structural Alloys (Al/Fe)', 'Plastics (Polymers)', 'Silver (Ag)'];
  const values = [goldVal, copperVal, alumSteelVal, plasticsVal, silverVal];

  chartInstances.economics = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: materials,
      datasets: [{
        label: 'Estimated Secondary Value (INR ₹)',
        data: values,
        backgroundColor: [
          '#F59E0B', '#EA580C', '#3B82F6', '#16A34A', '#94A3B8'
        ],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Valuation in Indian Rupees (₹)' },
          ticks: {
            callback: (val) => `₹${val.toLocaleString('en-IN')}`
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₹${ctx.raw.toLocaleString('en-IN')}`
          }
        }
      }
    }
  });
}
