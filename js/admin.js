/* ============================================
   EcoLoop — Admin Console Controller
   Manages lifecycle status dispatching, filtering,
   record deletion with confirmation, demo reset,
   and CSV downloads.
   ============================================ */

let selectedAdminReqId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAdminPanel();

  const searchInput = document.getElementById('adm-search');
  const catFilter = document.getElementById('adm-category-filter');
  const statusFilter = document.getElementById('adm-status-filter');
  const saveStatusBtn = document.getElementById('btn-save-status');

  if (searchInput) searchInput.addEventListener('input', renderAdminTable);
  if (catFilter) catFilter.addEventListener('change', renderAdminTable);
  if (statusFilter) statusFilter.addEventListener('change', renderAdminTable);

  if (saveStatusBtn) {
    saveStatusBtn.addEventListener('click', saveNewStatus);
  }
});

function renderAdminPanel() {
  updateAdminStats();
  renderAdminTable();
}

function updateAdminStats() {
  const requests = EcoStorage.getRequests();
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const inTransit = requests.filter(r => r.status === 'Scheduled' || r.status === 'Collected').length;
  const atRecycler = requests.filter(r => r.status === 'Sent to Recycler' || r.status === 'Recycled').length;

  document.getElementById('adm-total-records').textContent = total;
  document.getElementById('adm-pending-count').textContent = pending;
  document.getElementById('adm-in-transit-count').textContent = inTransit;
  document.getElementById('adm-recycled-count').textContent = atRecycler;
}

function renderAdminTable() {
  const query = (document.getElementById('adm-search')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('adm-category-filter')?.value || 'ALL';
  const status = document.getElementById('adm-status-filter')?.value || 'ALL';

  const allRequests = EcoStorage.getRequests();

  const filtered = allRequests.filter(r => {
    const matchesQuery = !query ||
      r.requestId.toLowerCase().includes(query) ||
      (r.userName && r.userName.toLowerCase().includes(query)) ||
      (r.city && r.city.toLowerCase().includes(query)) ||
      r.deviceName.toLowerCase().includes(query);

    const matchesCat = cat === 'ALL' || r.category === cat;
    const matchesStatus = status === 'ALL' || r.status === status;

    return matchesQuery && matchesCat && matchesStatus;
  });

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tbody = document.getElementById('adm-table-body');
  const emptyState = document.getElementById('adm-empty-state');
  const countEl = document.getElementById('adm-table-count');

  if (!tbody) return;

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allRequests.length} records`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td>
        <strong style="color:var(--green-800); font-size:0.88rem;">${r.requestId}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${formatDate(r.createdAt)}</div>
      </td>
      <td>
        <div style="font-weight:600; font-size:0.88rem;">${escapeHtml(r.userName || 'N/A')}</div>
        <div style="font-size:0.78rem; color:var(--text-secondary);">${escapeHtml(r.phone || '')} • ${escapeHtml(r.city || '')}</div>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <span>${getCategoryIcon(r.category)}</span>
          <div>
            <div style="font-weight:600; font-size:0.88rem;">${escapeHtml(r.deviceName)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(r.category)}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-weight:700;">${r.quantity} unit${r.quantity > 1 ? 's' : ''}</div>
        <div style="font-size:0.8rem; color:var(--green-700);">${parseFloat(r.weightKg).toFixed(1)} kg</div>
      </td>
      <td>
        <span style="font-size:0.82rem;">${r.collectionMethod === 'Drop-off' ? '📍 Drop-off' : '🚚 Pickup'}</span>
      </td>
      <td>${getStatusBadge(r.status)}</td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-primary btn-sm" onclick="openStatusModal('${r.requestId}')" style="padding:4px 10px; font-size:0.8rem;" title="Update Status">
          ✏️ Status
        </button>
        <button class="btn btn-outline btn-sm" onclick="window.location.href='tracking.html?id=${encodeURIComponent(r.requestId)}'" style="padding:4px 10px; font-size:0.8rem;" title="Track">
          📍 Track
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDeleteRecord('${r.requestId}')" style="padding:4px 8px; font-size:0.8rem;" title="Delete Record">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');
}

function resetAdminFilters() {
  document.getElementById('adm-search').value = '';
  document.getElementById('adm-category-filter').value = 'ALL';
  document.getElementById('adm-status-filter').value = 'ALL';
  renderAdminTable();
}

/** Open Status Dispatch Modal */
function openStatusModal(requestId) {
  selectedAdminReqId = requestId;
  const req = EcoStorage.getRequestById(requestId);
  if (!req) return;

  document.getElementById('modal-status-req-id').textContent = req.requestId;
  document.getElementById('new-status-select').value = req.status;

  showModal('status-update-modal');
}

function saveNewStatus() {
  if (!selectedAdminReqId) return;
  const newStatus = document.getElementById('new-status-select').value;

  const ok = EcoStorage.updateRequestStatus(selectedAdminReqId, newStatus);
  if (ok) {
    showToast(`Request ${selectedAdminReqId} status updated to: ${newStatus}`, 'success');
    closeModal('status-update-modal');
    renderAdminPanel();
  } else {
    showToast('Failed to update status.', 'error');
  }
}

/** Delete test record with confirmation */
function confirmDeleteRecord(requestId) {
  showConfirmDialog(
    'Delete Record Permanently?',
    `Are you sure you want to delete ${requestId}? This action is irreversible and should only be used for cleaning demo/test records.`,
    () => {
      const ok = EcoStorage.deleteRequest(requestId);
      if (ok) {
        showToast(`Record ${requestId} removed.`, 'warning');
        renderAdminPanel();
      } else {
        showToast('Unable to delete record.', 'error');
      }
    }
  );
}

/** Reset all data confirmation */
function confirmResetData() {
  showConfirmDialog(
    'Reset All EcoLoop Storage Data?',
    'This will clear all registered collection requests and settings from your browser LocalStorage. Are you sure?',
    () => {
      EcoStorage.resetAllData();
      showToast('All storage data has been cleared.', 'info');
      renderAdminPanel();
    }
  );
}

/** Reload fresh demo dataset */
function reloadDemoDataset() {
  // Clear demo lock and load fresh records
  localStorage.removeItem(EcoStorage.KEYS.DEMO_LOADED);
  EcoStorage.loadDemoData();
  showToast('Standard academic demo dataset loaded!', 'success');
  renderAdminPanel();
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
