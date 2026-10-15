/* ============================================
   EcoLoop — LocalStorage Data Manager
   Handles all data persistence operations.
   
   NOTE: LocalStorage is browser-local storage
   and is NOT a secure cloud database. Data is
   stored only in this browser and should not
   contain sensitive personal information in
   a production environment.
   ============================================ */

const EcoStorage = {
  // Storage keys
  KEYS: {
    REQUESTS: 'ecoloop_requests',
    SETTINGS: 'ecoloop_settings',
    DEMO_LOADED: 'ecoloop_demo_loaded'
  },

  // ---- Request Operations ----

  /** Get all collection requests from storage */
  getRequests() {
    try {
      const data = localStorage.getItem(this.KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading requests from storage:', e);
      return [];
    }
  },

  /** Save the full requests array to storage */
  saveRequests(requests) {
    try {
      localStorage.setItem(this.KEYS.REQUESTS, JSON.stringify(requests));
      return true;
    } catch (e) {
      console.error('Error saving requests to storage:', e);
      return false;
    }
  },

  /** Add a new collection request */
  addRequest(requestData) {
    const requests = this.getRequests();
    const newRequest = {
      requestId: this.generateRequestId(),
      ...requestData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.push(newRequest);
    this.saveRequests(requests);
    return newRequest;
  },

  /** Get a single request by ID */
  getRequestById(requestId) {
    const requests = this.getRequests();
    return requests.find(r => r.requestId === requestId) || null;
  },

  /** Update a request's status */
  updateRequestStatus(requestId, newStatus) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index === -1) return false;
    
    requests[index].status = newStatus;
    requests[index].updatedAt = new Date().toISOString();
    this.saveRequests(requests);
    return true;
  },

  /** Cancel a pending request */
  cancelRequest(requestId) {
    const requests = this.getRequests();
    const request = requests.find(r => r.requestId === requestId);
    if (!request || request.status !== 'Pending') return false;
    
    request.status = 'Cancelled';
    request.updatedAt = new Date().toISOString();
    this.saveRequests(requests);
    return true;
  },

  /** Delete a request (admin only, for test records) */
  deleteRequest(requestId) {
    let requests = this.getRequests();
    const initialLength = requests.length;
    requests = requests.filter(r => r.requestId !== requestId);
    if (requests.length === initialLength) return false;
    
    this.saveRequests(requests);
    return true;
  },

  // ---- Statistics ----

  /** Get summary statistics from all requests */
  getStats() {
    const requests = this.getRequests();
    const activeRequests = requests.filter(r => r.status !== 'Cancelled');
    
    return {
      totalRequests: activeRequests.length,
      totalWeight: activeRequests.reduce((sum, r) => sum + (parseFloat(r.weightKg) || 0), 0),
      pendingCount: activeRequests.filter(r => r.status === 'Pending').length,
      scheduledCount: activeRequests.filter(r => r.status === 'Scheduled').length,
      collectedCount: activeRequests.filter(r => r.status === 'Collected').length,
      sentCount: activeRequests.filter(r => r.status === 'Sent to Recycler').length,
      recycledCount: activeRequests.filter(r => r.status === 'Recycled').length,
      cancelledCount: requests.filter(r => r.status === 'Cancelled').length,
      categories: this.getCategoryBreakdown(activeRequests),
      monthlyData: this.getMonthlyData(activeRequests),
      statusDistribution: this.getStatusDistribution(activeRequests)
    };
  },

  /** Get waste breakdown by category */
  getCategoryBreakdown(requests) {
    const categories = {};
    (requests || this.getRequests()).forEach(r => {
      if (r.status === 'Cancelled') return;
      if (!categories[r.category]) {
        categories[r.category] = { count: 0, weight: 0 };
      }
      categories[r.category].count += parseInt(r.quantity) || 1;
      categories[r.category].weight += parseFloat(r.weightKg) || 0;
    });
    return categories;
  },

  /** Get monthly registration data */
  getMonthlyData(requests) {
    const monthly = {};
    (requests || this.getRequests()).forEach(r => {
      if (r.status === 'Cancelled') return;
      const date = new Date(r.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { count: 0, weight: 0 };
      monthly[key].count++;
      monthly[key].weight += parseFloat(r.weightKg) || 0;
    });
    return monthly;
  },

  /** Get status distribution */
  getStatusDistribution(requests) {
    const dist = {};
    (requests || this.getRequests()).forEach(r => {
      if (r.status === 'Cancelled') return;
      dist[r.status] = (dist[r.status] || 0) + 1;
    });
    return dist;
  },

  // ---- Utility Functions ----

  /** Generate a unique request ID like ECO-20261015-XXXX */
  generateRequestId() {
    const now = new Date();
    const datePart = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ECO-${datePart}-${randomPart}`;
  },

  /** Export requests as CSV */
  exportCSV() {
    const requests = this.getRequests();
    if (requests.length === 0) return null;

    const headers = [
      'Request ID', 'User Name', 'Email', 'Phone', 'City',
      'Category', 'Device Name', 'Quantity', 'Weight (kg)',
      'Condition', 'Collection Method', 'Notes', 'Status',
      'Created At', 'Updated At'
    ];

    const rows = requests.map(r => [
      r.requestId, r.userName, r.email, r.phone, r.city,
      r.category, r.deviceName, r.quantity, r.weightKg,
      r.deviceCondition, r.collectionMethod, r.notes || '',
      r.status, r.createdAt, r.updatedAt
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    return csv;
  },

  /** Download CSV file */
  downloadCSV() {
    const csv = this.exportCSV();
    if (!csv) return false;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ecoloop_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    return true;
  },

  /** Reset all data (with confirmation handled by caller) */
  resetAllData() {
    localStorage.removeItem(this.KEYS.REQUESTS);
    localStorage.removeItem(this.KEYS.DEMO_LOADED);
    return true;
  },

  /** Load demo/sample data for fresh installations */
  loadDemoData() {
    if (localStorage.getItem(this.KEYS.DEMO_LOADED)) return false;

    const demoRequests = [
      {
        requestId: 'ECO-20261001-DM01',
        userName: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9876543210',
        city: 'Mumbai',
        category: 'Computers & Laptops',
        deviceName: 'Dell Inspiron Laptop',
        quantity: '1',
        weightKg: '2.5',
        deviceCondition: 'Non-functional',
        collectionMethod: 'Pickup Request',
        notes: 'Battery not working, screen cracked',
        status: 'Recycled',
        createdAt: '2026-09-05T10:30:00.000Z',
        updatedAt: '2026-09-20T14:00:00.000Z'
      },
      {
        requestId: 'ECO-20261002-DM02',
        userName: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9123456789',
        city: 'Pune',
        category: 'Mobile Phones & Tablets',
        deviceName: 'Samsung Galaxy S21',
        quantity: '2',
        weightKg: '0.4',
        deviceCondition: 'Repairable',
        collectionMethod: 'Drop-off',
        notes: 'Old phones, still have some value',
        status: 'Collected',
        createdAt: '2026-09-12T09:15:00.000Z',
        updatedAt: '2026-09-25T11:30:00.000Z'
      },
      {
        requestId: 'ECO-20261003-DM03',
        userName: 'Rohan Kumar',
        email: 'rohan@example.com',
        phone: '9988776655',
        city: 'Delhi',
        category: 'Chargers & Cables',
        deviceName: 'Assorted Chargers and USB Cables',
        quantity: '15',
        weightKg: '1.2',
        deviceCondition: 'Non-functional',
        collectionMethod: 'Pickup Request',
        notes: 'Old chargers from different phones',
        status: 'Sent to Recycler',
        createdAt: '2026-09-18T16:00:00.000Z',
        updatedAt: '2026-10-01T09:00:00.000Z'
      },
      {
        requestId: 'ECO-20261004-DM04',
        userName: 'Sneha Deshmukh',
        email: 'sneha@example.com',
        phone: '9876501234',
        city: 'Bangalore',
        category: 'Keyboards, Mice & Peripherals',
        deviceName: 'Logitech Keyboard + Mouse',
        quantity: '3',
        weightKg: '1.8',
        deviceCondition: 'Working',
        collectionMethod: 'Drop-off',
        notes: 'Upgraded to wireless, these still work',
        status: 'Scheduled',
        createdAt: '2026-10-02T11:45:00.000Z',
        updatedAt: '2026-10-05T10:00:00.000Z'
      },
      {
        requestId: 'ECO-20261005-DM05',
        userName: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '9765432100',
        city: 'Chennai',
        category: 'Printers & Scanners',
        deviceName: 'HP LaserJet Printer',
        quantity: '1',
        weightKg: '8.5',
        deviceCondition: 'Non-functional',
        collectionMethod: 'Pickup Request',
        notes: 'Printer no longer prints, very old model',
        status: 'Pending',
        createdAt: '2026-10-10T08:20:00.000Z',
        updatedAt: '2026-10-10T08:20:00.000Z'
      },
      {
        requestId: 'ECO-20261006-DM06',
        userName: 'Ananya Iyer',
        email: 'ananya@example.com',
        phone: '9654321098',
        city: 'Hyderabad',
        category: 'Circuit Boards & Components',
        deviceName: 'Old Motherboards and RAM Sticks',
        quantity: '5',
        weightKg: '3.0',
        deviceCondition: 'Non-functional',
        collectionMethod: 'Drop-off',
        notes: 'From old desktop computers',
        status: 'Pending',
        createdAt: '2026-10-12T13:00:00.000Z',
        updatedAt: '2026-10-12T13:00:00.000Z'
      },
      {
        requestId: 'ECO-20261007-DM07',
        userName: 'Rahul Joshi',
        email: 'rahul@example.com',
        phone: '9543210987',
        city: 'Kolkata',
        category: 'Batteries & Others',
        deviceName: 'Laptop Batteries',
        quantity: '4',
        weightKg: '2.0',
        deviceCondition: 'Non-functional',
        collectionMethod: 'Pickup Request',
        notes: 'Old swollen laptop batteries - need safe disposal',
        status: 'Collected',
        createdAt: '2026-10-08T07:00:00.000Z',
        updatedAt: '2026-10-14T15:00:00.000Z'
      }
    ];

    this.saveRequests(demoRequests);
    localStorage.setItem(this.KEYS.DEMO_LOADED, 'true');
    return true;
  }
};

// Material recovery rate assumptions (illustrative only)
// These are configurable estimates and NOT guaranteed recovery rates.
const MATERIAL_RATES = {
  'Computers & Laptops': {
    copper: 0.07, aluminium: 0.14, gold_grams_per_kg: 0.03,
    plastic: 0.23, steel: 0.20, glass: 0.05, other: 0.31,
    value_per_kg: 45 // Estimated INR per kg, illustrative only
  },
  'Mobile Phones & Tablets': {
    copper: 0.15, aluminium: 0.09, gold_grams_per_kg: 0.30,
    plastic: 0.30, steel: 0.05, glass: 0.10, other: 0.31,
    value_per_kg: 120
  },
  'Chargers & Cables': {
    copper: 0.40, aluminium: 0.05, gold_grams_per_kg: 0,
    plastic: 0.45, steel: 0.02, glass: 0, other: 0.08,
    value_per_kg: 35
  },
  'Printers & Scanners': {
    copper: 0.05, aluminium: 0.08, gold_grams_per_kg: 0.01,
    plastic: 0.40, steel: 0.30, glass: 0.02, other: 0.15,
    value_per_kg: 20
  },
  'Keyboards, Mice & Peripherals': {
    copper: 0.03, aluminium: 0.05, gold_grams_per_kg: 0,
    plastic: 0.60, steel: 0.10, glass: 0, other: 0.22,
    value_per_kg: 10
  },
  'Circuit Boards & Components': {
    copper: 0.20, aluminium: 0.05, gold_grams_per_kg: 0.20,
    plastic: 0.25, steel: 0.08, glass: 0.05, other: 0.37,
    value_per_kg: 150
  },
  'Batteries & Others': {
    copper: 0.05, aluminium: 0.10, gold_grams_per_kg: 0,
    plastic: 0.15, steel: 0.25, glass: 0, other: 0.45,
    value_per_kg: 15
  }
};

/** Calculate estimated material recovery from waste weight and category */
function calculateRecovery(weightKg, category) {
  const rates = MATERIAL_RATES[category];
  if (!rates) return null;

  const w = parseFloat(weightKg) || 0;
  return {
    copper: (w * rates.copper).toFixed(2),
    aluminium: (w * rates.aluminium).toFixed(2),
    gold_grams: (w * rates.gold_grams_per_kg).toFixed(3),
    plastic: (w * rates.plastic).toFixed(2),
    steel: (w * rates.steel).toFixed(2),
    estimatedValue: Math.round(w * rates.value_per_kg),
    disclaimer: 'These are illustrative estimates based on configurable assumptions. Actual recovery depends on device condition, contamination, and recycler capabilities.'
  };
}

/** Calculate total estimated economic value across all requests */
function calculateTotalEconomicValue() {
  const requests = EcoStorage.getRequests().filter(r => r.status !== 'Cancelled');
  let totalValue = 0;
  requests.forEach(r => {
    const rates = MATERIAL_RATES[r.category];
    if (rates) {
      totalValue += (parseFloat(r.weightKg) || 0) * rates.value_per_kg;
    }
  });
  return Math.round(totalValue);
}
