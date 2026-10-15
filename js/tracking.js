/* ============================================
   EcoLoop — Collection Tracking Controller
   Manages chain-of-custody milestones, progress
   animations, activity logs, and demo controls.
   ============================================ */

let currentTrackedId = null;

const STAGES = [
  'Pending',
  'Scheduled',
  'Collected',
  'Sent to Recycler',
  'Recycled'
];

document.addEventListener('DOMContentLoaded', () => {
  renderQuickTrackList();

  const trackBtn = document.getElementById('btn-track');
  const inputEl = document.getElementById('track-id-input');

  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      const id = inputEl.value.trim().toUpperCase();
      if (id) trackRequest(id);
    });
  }

  if (inputEl) {
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const id = inputEl.value.trim().toUpperCase();
        if (id) trackRequest(id);
      }
    });
  }

  // Check URL Query parameter ?id=ECO-...
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get('id');
  if (queryId) {
    if (inputEl) inputEl.value = queryId;
    trackRequest(queryId);
  } else {
    // If no query, track the first active request by default for immediate visual feedback
    const requests = EcoStorage.getRequests();
    if (requests.length > 0) {
      trackRequest(requests[0].requestId);
    }
  }
});

/** Populate quick clickable tags of recent IDs */
function renderQuickTrackList() {
  const container = document.getElementById('quick-track-list');
  if (!container) return;

  const requests = EcoStorage.getRequests().slice(0, 4);
  if (requests.length === 0) {
    container.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted);">No records yet</span>';
    return;
  }

  container.innerHTML = requests.map(r => `
    <button class="btn btn-outline btn-sm" style="padding:2px 8px; font-size:0.75rem;" onclick="trackRequest('${r.requestId}')">
      ${r.requestId}
    </button>
  `).join('');
}

/** Track an e-waste request by ID */
function trackRequest(requestId) {
  const req = EcoStorage.getRequestById(requestId);
  const trackingCard = document.getElementById('tracking-card');
  const notFoundCard = document.getElementById('tracking-not-found');
  const inputEl = document.getElementById('track-id-input');

  if (inputEl) inputEl.value = requestId;

  if (!req) {
    if (trackingCard) trackingCard.style.display = 'none';
    if (notFoundCard) notFoundCard.style.display = 'block';
    currentTrackedId = null;
    return;
  }

  currentTrackedId = req.requestId;
  if (notFoundCard) notFoundCard.style.display = 'none';
  if (trackingCard) trackingCard.style.display = 'block';

  // Fill Header Info
  document.getElementById('track-result-id').textContent = req.requestId;
  document.getElementById('track-result-meta').textContent = `Registered by ${req.userName || 'Anonymous'} • ${req.city || 'Local Area'}`;
  document.getElementById('track-result-badge').innerHTML = getStatusBadge(req.status);
  document.getElementById('track-result-date').textContent = `Created: ${formatDate(req.createdAt)}`;

  // Fill Device Info
  document.getElementById('track-device-name').textContent = req.deviceName;
  document.getElementById('track-category-qty').textContent = `${getCategoryIcon(req.category)} ${req.category} (${req.quantity} unit${req.quantity > 1 ? 's' : ''})`;
  document.getElementById('track-weight').textContent = `${parseFloat(req.weightKg).toFixed(2)} kg`;
  document.getElementById('track-method').textContent = req.collectionMethod || 'Drop-off';

  // Update Visual Progress Bar
  updateProgressTracker(req.status);

  // Generate Activity Log
  renderActivityLog(req);
}

/** Update the 5-step milestone timeline */
function updateProgressTracker(status) {
  const isCancelled = status === 'Cancelled';
  const currentIndex = isCancelled ? -1 : STAGES.indexOf(status);

  for (let i = 0; i < STAGES.length; i++) {
    const stepEl = document.getElementById(`step-${i + 1}`);
    if (!stepEl) continue;

    stepEl.classList.remove('completed', 'active');

    if (isCancelled) {
      // If cancelled, keep neutral
      continue;
    }

    if (i < currentIndex) {
      stepEl.classList.add('completed');
    } else if (i === currentIndex) {
      stepEl.classList.add('active');
    }
  }
}

/** Render a chronological audit log based on the request's current state */
function renderActivityLog(req) {
  const logContainer = document.getElementById('track-events-container');
  if (!logContainer) return;

  const createdTime = new Date(req.createdAt);
  const updatedTime = new Date(req.updatedAt || req.createdAt);

  const logs = [];

  // Log 1: Registration
  logs.push({
    icon: '📝',
    title: 'Registration Submitted',
    desc: `User registered ${req.quantity}x ${req.deviceName} (${req.weightKg} kg). Unique ID assigned.`,
    time: formatDateTime(createdTime)
  });

  if (req.status === 'Cancelled') {
    logs.push({
      icon: '❌',
      title: 'Request Cancelled',
      desc: 'The collection request was cancelled by the user or administrator.',
      time: formatDateTime(updatedTime)
    });
  } else {
    const stageIndex = STAGES.indexOf(req.status);

    if (stageIndex >= 1) {
      logs.push({
        icon: '📅',
        title: 'Collection Scheduled',
        desc: req.collectionMethod === 'Pickup Request'
          ? 'EcoLoop logistics unit assigned vehicle and pickup time window.'
          : 'Drop-off authorization slip issued for local e-waste hub.',
        time: formatDateTime(new Date(createdTime.getTime() + 1000 * 60 * 60 * 24))
      });
    }

    if (stageIndex >= 2) {
      logs.push({
        icon: '📦',
        title: 'Device Collected & Weighed',
        desc: `Physical custody verified at depot. Weight recorded: ${req.weightKg} kg. Barcode affixed.`,
        time: formatDateTime(new Date(createdTime.getTime() + 1000 * 60 * 60 * 48))
      });
    }

    if (stageIndex >= 3) {
      logs.push({
        icon: '🚛',
        title: 'Dispatched to Authorized Recycler',
        desc: 'Batch consolidated and transferred to ISO 14001 / R2 certified electronic dismantler.',
        time: formatDateTime(new Date(createdTime.getTime() + 1000 * 60 * 60 * 72))
      });
    }

    if (stageIndex >= 4) {
      logs.push({
        icon: '♻️',
        title: 'Recycled & Resource Recovery Completed',
        desc: 'Device dismantled into PCBs, ferrous/non-ferrous metals, and polymers. Circular certificate issued.',
        time: formatDateTime(updatedTime)
      });
    }
  }

  logContainer.innerHTML = logs.reverse().map(l => `
    <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--gray-100);">
      <div style="font-size:1.4rem; line-height:1; flex-shrink:0;">${l.icon}</div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <strong style="font-size:0.92rem; color:var(--text-primary);">${l.title}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${l.time}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">${l.desc}</p>
      </div>
    </div>
  `).join('');
}

/** Demo Stage Advancement for Viva/Assessment */
function advanceStage(targetStatus) {
  if (!currentTrackedId) {
    showToast('Please select or track a request first.', 'warning');
    return;
  }

  const ok = EcoStorage.updateRequestStatus(currentTrackedId, targetStatus);
  if (ok) {
    showToast(`Status updated to: "${targetStatus}"`, 'success');
    trackRequest(currentTrackedId);
  } else {
    showToast('Error updating status.', 'error');
  }
}
