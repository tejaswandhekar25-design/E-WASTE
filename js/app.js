/* ============================================
   EcoLoop — Shared Application Logic
   Navigation, toasts, modals, and utilities
   shared across all pages.
   ============================================ */

// ---- Initialize on DOM Load ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLiveCommodityTicker();
  loadDemoDataIfFresh();
  setActiveNavLink();
  animateOnScroll();
});

// ---- Live Commodity Spot Ticker ----
function initLiveCommodityTicker() {
  const bar = document.getElementById('globalTickerBar');
  if (!bar) return;

  // Fetch live server rates asynchronously
  fetch('/api/commodity-rates')
    .then(r => r.json())
    .then(data => {
      if (data.success && data.rates) {
        const rates = data.rates;
        bar.innerHTML = `
          <span class="ticker-item">🔴 <strong>LIVE LME COMMODITY INDEX:</strong></span>
          <span class="ticker-item">🥇 Gold (Au 99.9%): <span class="ticker-rate">₹${rates.gold.rate.toLocaleString()}/g</span> <span class="${rates.gold.trend === 'up' ? 'ticker-up' : 'ticker-down'}">${rates.gold.change}</span></span>
          <span class="ticker-item">🥈 Silver (Ag): <span class="ticker-rate">₹${rates.silver.rate.toLocaleString()}/g</span> <span class="${rates.silver.trend === 'up' ? 'ticker-up' : 'ticker-down'}">${rates.silver.change}</span></span>
          <span class="ticker-item">🥉 Copper (Cathode): <span class="ticker-rate">₹${rates.copper.rate.toLocaleString()}/kg</span> <span class="${rates.copper.trend === 'up' ? 'ticker-up' : 'ticker-down'}">${rates.copper.change}</span></span>
          <span class="ticker-item">🔋 Lithium (Battery Grade): <span class="ticker-rate">₹${rates.lithium.rate.toLocaleString()}/kg</span> <span class="${rates.lithium.trend === 'up' ? 'ticker-up' : 'ticker-down'}">${rates.lithium.change}</span></span>
          <span class="ticker-item">⚡ Palladium: <span class="ticker-rate">₹${rates.palladium.rate.toLocaleString()}/g</span> <span class="${rates.palladium.trend === 'up' ? 'ticker-up' : 'ticker-down'}">${rates.palladium.change}</span></span>
          <span class="ticker-item">🏛️ CPCB EPR Target Compliance Index: <span class="ticker-rate">94.2%</span> <span class="ticker-up">Audit Verified</span></span>
        `;
      }
    })
    .catch(() => {});
}


// ---- Navbar ----
function initNavbar() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.navbar-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });

    // Close menu when clicking a link
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      });
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });
}

// ---- Set Active Nav Link ----
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop();
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ---- Load Demo Data on First Visit ----
function loadDemoDataIfFresh() {
  EcoStorage.loadDemoData();
}

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span>${icons[type] || '✅'}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ---- Modal Helpers ----
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// ---- Confirmation Dialog ----
function showConfirmDialog(title, message, onConfirm) {
  // Create or reuse a confirm modal
  let overlay = document.getElementById('confirm-dialog');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-dialog';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 id="confirm-title"></h3>
          <button class="modal-close" onclick="closeModal('confirm-dialog')">✕</button>
        </div>
        <p id="confirm-message" style="margin-bottom: 8px;"></p>
        <div class="confirm-actions">
          <button class="btn btn-secondary btn-sm" onclick="closeModal('confirm-dialog')">Cancel</button>
          <button class="btn btn-danger btn-sm" id="confirm-action-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  
  const actionBtn = document.getElementById('confirm-action-btn');
  // Remove old event listeners by cloning
  const newBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newBtn, actionBtn);
  
  newBtn.addEventListener('click', () => {
    onConfirm();
    closeModal('confirm-dialog');
  });

  showModal('confirm-dialog');
}

// ---- Form Validation ----
function validateField(input, rules = {}) {
  const value = input.value.trim();
  const errorEl = input.parentElement.querySelector('.form-error');

  let errorMsg = '';

  if (rules.required && !value) {
    errorMsg = rules.requiredMsg || 'This field is required';
  } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errorMsg = 'Please enter a valid email address';
  } else if (rules.phone && value && !/^[0-9]{10}$/.test(value.replace(/[\s\-+()]/g, ''))) {
    errorMsg = 'Please enter a valid 10-digit phone number';
  } else if (rules.min && parseFloat(value) < rules.min) {
    errorMsg = `Value must be at least ${rules.min}`;
  } else if (rules.max && parseFloat(value) > rules.max) {
    errorMsg = `Value must not exceed ${rules.max}`;
  } else if (rules.minLength && value.length < rules.minLength) {
    errorMsg = `Must be at least ${rules.minLength} characters`;
  }

  if (errorMsg) {
    input.classList.add('error');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add('visible');
    }
    return false;
  } else {
    input.classList.remove('error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
    return true;
  }
}

function clearValidationErrors(form) {
  form.querySelectorAll('.form-control').forEach(input => {
    input.classList.remove('error');
  });
  form.querySelectorAll('.form-error').forEach(el => {
    el.classList.remove('visible');
  });
}

// ---- Utility Functions ----

/** Format a date string for display */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/** Format a date with time */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Get status badge HTML */
function getStatusBadge(status) {
  const classes = {
    'Pending': 'badge-pending',
    'Scheduled': 'badge-scheduled',
    'Collected': 'badge-collected',
    'Sent to Recycler': 'badge-sent',
    'Recycled': 'badge-recycled',
    'Cancelled': 'badge-cancelled'
  };
  return `<span class="badge ${classes[status] || 'badge-pending'}">${status}</span>`;
}

/** Get category icon */
function getCategoryIcon(category) {
  const icons = {
    'Computers & Laptops': '💻',
    'Mobile Phones & Tablets': '📱',
    'Chargers & Cables': '🔌',
    'Printers & Scanners': '🖨️',
    'Keyboards, Mice & Peripherals': '⌨️',
    'Circuit Boards & Components': '🔧',
    'Batteries & Others': '🔋'
  };
  return icons[category] || '♻️';
}

// ---- Scroll Animations ----
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ---- Navigation helper for SPA-like feel ----
function navigateTo(page) {
  window.location.href = page;
}

// ---- Generate shared navbar HTML ----
function getNavbarHTML(currentPage) {
  const isSubPage = currentPage !== 'index';
  const prefix = isSubPage ? '../' : '';
  const pagePrefix = isSubPage ? '' : 'pages/';

  return `
    <nav class="navbar" role="navigation" aria-label="Main Navigation">
      <div class="navbar-inner">
        <a href="${prefix}index.html" class="navbar-brand">
          <div class="logo-icon">♻️</div>
          EcoLoop
        </a>
        <div class="navbar-menu" id="navMenu">
          <a href="${prefix}index.html">Home</a>
          <a href="${pagePrefix}collection.html">Collect</a>
          <a href="${pagePrefix}segregation.html">Segregate</a>
          <a href="${pagePrefix}dashboard.html">Dashboard</a>
          <a href="${pagePrefix}tracking.html">Tracking</a>
          <a href="${pagePrefix}recycling.html">Recycling</a>
          <a href="${pagePrefix}analytics.html">Analytics</a>
          <a href="${pagePrefix}awareness.html">Awareness</a>
          <a href="${pagePrefix}admin.html">Admin</a>
          <a href="${pagePrefix}about.html">About</a>
          <a href="${pagePrefix}collection.html" class="navbar-cta">♻️ Recycle Now</a>
        </div>
        <button class="menu-toggle" aria-label="Toggle menu" onclick="document.querySelector('.navbar-menu').classList.toggle('open'); this.classList.toggle('active');">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `;
}

// ---- Generate shared footer HTML ----
function getFooterHTML(isSubPage) {
  const prefix = isSubPage ? '../' : '';
  const pagePrefix = isSubPage ? '' : 'pages/';

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>♻️ EcoLoop</h3>
            <p>Smart E-Waste Management Platform — Encouraging responsible electronic waste collection, segregation, recycling, and resource recovery to support a circular economy.</p>
          </div>
          <div class="footer-links">
            <h4>Platform</h4>
            <a href="${pagePrefix}collection.html">Register E-Waste</a>
            <a href="${pagePrefix}dashboard.html">Dashboard</a>
            <a href="${pagePrefix}tracking.html">Track Collection</a>
            <a href="${pagePrefix}analytics.html">Impact Analytics</a>
          </div>
          <div class="footer-links">
            <h4>Resources</h4>
            <a href="${pagePrefix}recycling.html">Recycling Guide</a>
            <a href="${pagePrefix}segregation.html">Segregation Guide</a>
            <a href="${pagePrefix}awareness.html">Safety Information</a>
            <a href="${pagePrefix}about.html">About Project</a>
          </div>
          <div class="footer-links">
            <h4>Contact</h4>
            <a href="${pagePrefix}about.html#contact">Contact Us</a>
            <a href="${pagePrefix}about.html#team">Team</a>
            <a href="#">GitHub Repository</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 EcoLoop — FA-2 College Project on E-Waste Management</p>
          <p>Built with ❤️ for a Sustainable Future</p>
        </div>
      </div>
    </footer>
  `;
}

/** Update hero stats on the home page from real data */
function updateHeroStats() {
  const stats = EcoStorage.getStats();
  const deviceEl = document.getElementById('stat-devices');
  const weightEl = document.getElementById('stat-weight');
  const requestsEl = document.getElementById('stat-requests');

  if (deviceEl) deviceEl.textContent = stats.totalRequests + '+';
  if (weightEl) weightEl.textContent = stats.totalWeight.toFixed(1) + ' kg';
  if (requestsEl) requestsEl.textContent = stats.totalRequests;
}
