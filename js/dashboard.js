/* ============================================
   EcoLoop — Dashboard Controller
   Renders user KPIs, search/filter logic,
   request detail modals, and request cancellation.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Attach search and filter listeners
  const searchInput = document.getElementById('dash-search');
  const catFilter = document.getElementById('dash-category-filter');
  const statusFilter = document.getElementById('dash-status-filter');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (catFilter) catFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
});

function renderDashboard() {
  updateKPIs();
  applyFilters();
}

/** Update Top 5 KPI Cards */
function updateKPIs() {
  const stats = EcoStorage.getStats();
  const requests = EcoStorage.getRequests();

  const totalReqEl = document.getElementById('dash-total-requests');
  const totalWeightEl = document.getElementById('dash-total-weight');
  const pendingCountEl = document.getElementById('dash-pending-count');
  const collectedCountEl = document.getElementById('dash-collected-count');
  const recoverableWeightEl = document.getElementById('dash-recoverable-weight');

  const active = requests.filter(r => r.status !== 'Cancelled');
  const collectedOrRecycled = active.filter(r => r.status === 'Collected' || r.status === 'Sent to Recycler' || r.status === 'Recycled').length;
  const recoverableEst = (stats.totalWeight * 0.82).toFixed(1);

  if (totalReqEl) totalReqEl.textContent = stats.totalRequests;
  if (totalWeightEl) totalWeightEl.textContent = `${stats.totalWeight.toFixed(1)} kg`;
  if (pendingCountEl) pendingCountEl.textContent = stats.pendingCount;
  if (collectedCountEl) collectedCountEl.textContent = collectedOrRecycled;
  if (recoverableWeightEl) recoverableWeightEl.textContent = `${recoverableEst} kg`;
}

/** Filter and populate the requests table */
function applyFilters() {
  const query = (document.getElementById('dash-search')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('dash-category-filter')?.value || 'ALL';
  const status = document.getElementById('dash-status-filter')?.value || 'ALL';

  const allRequests = EcoStorage.getRequests();

  const filtered = allRequests.filter(r => {
    const matchesQuery = !query ||
      r.requestId.toLowerCase().includes(query) ||
      r.deviceName.toLowerCase().includes(query) ||
      (r.userName && r.userName.toLowerCase().includes(query)) ||
      (r.city && r.city.toLowerCase().includes(query));

    const matchesCat = cat === 'ALL' || r.category === cat;
    const matchesStatus = status === 'ALL' || r.status === status;

    return matchesQuery && matchesCat && matchesStatus;
  });

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderTableRows(filtered);
}

function renderTableRows(requests) {
  const tbody = document.getElementById('dash-table-body');
  const emptyState = document.getElementById('dash-empty-state');
  const countEl = document.getElementById('dash-table-count');

  if (!tbody) return;

  if (countEl) {
    countEl.textContent = `Showing ${requests.length} of ${EcoStorage.getRequests().length} requests`;
  }

  if (requests.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = requests.map(r => {
    const canCancel = r.status === 'Pending';
    return `
      <tr>
        <td>
          <strong style="color:var(--green-700); font-size:0.88rem;">${r.requestId}</strong>
        </td>
        <td>
          <span style="font-size:0.85rem; color:var(--text-secondary);">${formatDate(r.createdAt)}</span>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">${getCategoryIcon(r.category)}</span>
            <div>
              <div style="font-weight:600; font-size:0.9rem;">${escapeHtml(r.deviceName)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(r.category)}</div>
            </div>
          </div>
        </td>
        <td>${r.quantity}</td>
        <td><strong>${parseFloat(r.weightKg).toFixed(1)} kg</strong></td>
        <td>
          <span style="font-size:0.85rem;">${r.collectionMethod === 'Drop-off' ? '📍 Drop-off' : '🚚 Pickup'}</span>
        </td>
        <td>${getStatusBadge(r.status)}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="viewRequestDetails('${r.requestId}')" title="View Details">
            👁️ View
          </button>
          ${canCancel ? `
            <button class="btn btn-danger btn-sm" onclick="confirmCancelRequest('${r.requestId}')" style="margin-left:4px;" title="Cancel Request">
              ✕ Cancel
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/** Reset all search and filter dropdowns */
function resetFilters() {
  const searchInput = document.getElementById('dash-search');
  const catFilter = document.getElementById('dash-category-filter');
  const statusFilter = document.getElementById('dash-status-filter');

  if (searchInput) searchInput.value = '';
  if (catFilter) catFilter.value = 'ALL';
  if (statusFilter) statusFilter.value = 'ALL';

  applyFilters();
}

/** Open Request Detail Modal */
function viewRequestDetails(requestId) {
  const req = EcoStorage.getRequestById(requestId);
  if (!req) return;

  const content = document.getElementById('modal-req-content');
  const trackLink = document.getElementById('modal-track-link');

  if (trackLink) {
    trackLink.href = `tracking.html?id=${encodeURIComponent(req.requestId)}`;
  }

  content.innerHTML = `
    <div style="background:var(--green-50); padding:12px; border-radius:var(--radius-md); margin-bottom:var(--space-md); text-align:center;">
      <span style="font-size:0.8rem; color:var(--text-muted);">Request ID</span>
      <h3 style="color:var(--green-800); margin:2px 0;">${req.requestId}</h3>
      <div>${getStatusBadge(req.status)}</div>
    </div>

    <div class="detail-row">
      <span class="detail-label">Registered By:</span>
      <span class="detail-value">${escapeHtml(req.userName || 'N/A')}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Contact:</span>
      <span class="detail-value">${escapeHtml(req.phone || 'N/A')} | ${escapeHtml(req.email || 'N/A')}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Location / City:</span>
      <span class="detail-value">${escapeHtml(req.city || 'N/A')}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Device Name:</span>
      <span class="detail-value"><strong>${escapeHtml(req.deviceName)}</strong></span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Category:</span>
      <span class="detail-value">${getCategoryIcon(req.category)} ${escapeHtml(req.category)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Quantity & Weight:</span>
      <span class="detail-value">${req.quantity} unit(s) • ${parseFloat(req.weightKg).toFixed(2)} kg</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Device Condition:</span>
      <span class="detail-value">${escapeHtml(req.deviceCondition || 'N/A')}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Collection Method:</span>
      <span class="detail-value">${escapeHtml(req.collectionMethod || 'Drop-off')}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Registered Date:</span>
      <span class="detail-value">${formatDateTime(req.createdAt)}</span>
    </div>
    ${req.notes ? `
      <div style="margin-top:12px; padding:10px; background:var(--gray-50); border-radius:var(--radius-md); font-size:0.85rem;">
        <strong>Notes:</strong> ${escapeHtml(req.notes)}
      </div>
    ` : ''}
  `;

  showModal('request-detail-modal');
}

/** Cancel Request with Confirmation */
function confirmCancelRequest(requestId) {
  showConfirmDialog(
    'Cancel Collection Request?',
    `Are you sure you want to cancel request ${requestId}? This action will mark it as Cancelled.`,
    () => {
      const ok = EcoStorage.cancelRequest(requestId);
      if (ok) {
        showToast(`Request ${requestId} has been cancelled.`, 'warning');
        renderDashboard();
      } else {
        showToast('Unable to cancel request.', 'error');
      }
    }
  );
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
