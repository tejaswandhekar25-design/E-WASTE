/* ============================================
   EcoReclaim — B2B Liquidity Exchange Logic
   Real-time auctions, bidding, and payouts
   ============================================ */

let activeLots = [];
let currentLotInModal = null;
let commodityRates = {
  gold: 6845.50,
  silver: 83.40,
  copper: 748.00,
  lithium: 1420.00
};

document.addEventListener('DOMContentLoaded', () => {
  fetchLots();
  fetchCommodityRates();
  recalculatePayout();
});

function fetchLots() {
  fetch('/api/b2b/lots')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.lots) {
        activeLots = data.lots;
        renderLots(activeLots);
      }
    })
    .catch(err => {
      console.error('Failed to load lots:', err);
    });
}

function fetchCommodityRates() {
  fetch('/api/commodity-rates')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.rates) {
        const r = data.rates;
        commodityRates.gold = r.gold.rate;
        commodityRates.silver = r.silver.rate;
        commodityRates.copper = r.copper.rate;
        commodityRates.lithium = r.lithium.rate;

        // Render ticker if present
        const container = document.getElementById('liveRatesContainer');
        if (container) {
          container.innerHTML = `
            <span class="commodity-pill" style="color:#0F172A;">🥇 Gold: ₹${r.gold.rate.toLocaleString()}/g (${r.gold.change})</span>
            <span class="commodity-pill" style="color:#0F172A;">🥈 Silver: ₹${r.silver.rate.toLocaleString()}/g (${r.silver.change})</span>
            <span class="commodity-pill" style="color:#0F172A;">🥉 Copper: ₹${r.copper.rate.toLocaleString()}/kg (${r.copper.change})</span>
            <span class="commodity-pill" style="color:#0F172A;">🔋 Lithium: ₹${r.lithium.rate.toLocaleString()}/kg (${r.lithium.change})</span>
            <span class="commodity-pill" style="color:#0F172A;">⚡ Palladium: ₹${r.palladium.rate.toLocaleString()}/g (${r.palladium.change})</span>
          `;
        }
      }
    });
}

function renderLots(lots) {
  const grid = document.getElementById('b2bLotsGrid');
  if (!grid) return;

  grid.innerHTML = lots.map(lot => `
    <div class="b2b-lot-card">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.75rem; background:var(--blue-50); color:var(--blue-700); font-weight:700; padding:3px 8px; border-radius:var(--radius-full);">
            ${lot.id}
          </span>
          <span style="font-size:0.75rem; color:#EF4444; font-weight:700; display:flex; align-items:center; gap:4px;">
            <span class="live-dot"></span> Closes in ${Math.round(lot.timeRemainingMs / 3600000)}h
          </span>
        </div>

        <h3 style="font-size:1.1rem; margin-bottom:6px; color:#0F172A;">${lot.title}</h3>
        <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">${lot.condition}</p>

        <div style="background:var(--gray-50); padding:10px; border-radius:var(--radius-md); margin-bottom:14px; font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--text-secondary);">Weight:</span>
            <strong>${lot.weightKg.toLocaleString()} kg</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--text-secondary);">Seller:</span>
            <span>${lot.seller}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-secondary);">High Bidder:</span>
            <span style="color:var(--green-700); font-weight:600;">${lot.highestBidder}</span>
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
          <div>
            <span style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">Current High Bid</span>
            <div style="font-size:1.35rem; font-weight:800; color:#0F172A;">
              ₹${lot.currentBid.toLocaleString()}
            </div>
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted);">${lot.bidCount} Bids placed</span>
        </div>

        <button class="btn btn-primary" style="width:100%;" onclick="openBidModal('${lot.id}')">
          💰 Place Competing Bid
        </button>
      </div>
    </div>
  `).join('');
}

function openBidModal(lotId) {
  const lot = activeLots.find(l => l.id === lotId);
  if (!lot) return;

  currentLotInModal = lot;
  document.getElementById('modalLotTitle').textContent = `Bid on ${lot.id}`;
  document.getElementById('modalCurrentBid').textContent = `₹${lot.currentBid.toLocaleString()}`;
  document.getElementById('modalHighBidder').textContent = lot.highestBidder;
  document.getElementById('bidAmount').value = lot.currentBid + 15000;

  document.getElementById('bidModal').classList.add('open');
}

function closeBidModal() {
  document.getElementById('bidModal').classList.remove('open');
}

function submitBid() {
  if (!currentLotInModal) return;

  const amount = Number(document.getElementById('bidAmount').value);
  const bidder = document.getElementById('bidOrgName').value || 'Authorized Refiner';

  if (!amount || amount <= currentLotInModal.currentBid) {
    showToast(`Bid must exceed current highest bid of ₹${currentLotInModal.currentBid.toLocaleString()}`, 'error');
    return;
  }

  fetch('/api/b2b/bid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lotId: currentLotInModal.id,
      bidAmount: amount,
      bidderName: bidder
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast(`Success! Your bid of ₹${amount.toLocaleString()} is locked in escrow.`, 'success');
      closeBidModal();
      fetchLots(); // refresh feed
    } else {
      showToast(data.error || 'Failed to submit bid', 'error');
    }
  })
  .catch(err => {
    showToast('Network error submitting bid', 'error');
  });
}

function recalculatePayout() {
  const cat = document.getElementById('calc-category').value;
  const wt = Number(document.getElementById('calc-weight').value) || 100;
  
  let goldYieldG = 0;
  let copperYieldKg = 0;
  let polymerKg = wt * 0.30;

  if (cat === 'pcbs') {
    goldYieldG = wt * 0.85;
    copperYieldKg = wt * 0.22;
  } else if (cat === 'smartphones') {
    goldYieldG = wt * 0.35;
    copperYieldKg = wt * 0.16;
  } else if (cat === 'laptops') {
    goldYieldG = wt * 0.045;
    copperYieldKg = wt * 0.12;
  } else if (cat === 'batteries') {
    goldYieldG = 0;
    copperYieldKg = wt * 0.14;
  }

  const valGold = goldYieldG * commodityRates.gold;
  const valCopper = copperYieldKg * commodityRates.copper;
  const totalVal = Math.round(valGold + valCopper + (polymerKg * 45));

  document.getElementById('calc-total-val').textContent = `₹${totalVal.toLocaleString()}`;
  document.getElementById('calc-breakdown').innerHTML = `
    Estimated Pure Recoveries: <strong>${goldYieldG.toFixed(1)}g Gold (₹${Math.round(valGold).toLocaleString()})</strong>, 
    <strong>${copperYieldKg.toFixed(1)}kg Copper (₹${Math.round(valCopper).toLocaleString()})</strong>, 
    <strong>${polymerKg.toFixed(1)}kg Recycled Polymers</strong>.
  `;
}

function openNewLotModal() {
  showToast('Enterprise Seller Portal: Consignment registration window loaded.', 'info');
}
