/* ============================================
   EcoReclaim — EPR & ESG Statutory Compliance Logic
   CPCB Form 2/3/6 generation & SHA-256 sealing
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  updateLiveESG(5400);
});

function updateLiveESG(weight) {
  const wt = Number(weight) || 0;
  if (wt <= 0) return;

  fetch('/api/esg/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weightKg: wt })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.metrics) {
      const m = data.metrics;
      document.getElementById('esg-co2').textContent = `${Number(m.co2AvoidedKg).toLocaleString()} kg`;
      document.getElementById('esg-water').textContent = `${Number(m.waterSavedLiters).toLocaleString()} L`;
      document.getElementById('esg-ore').textContent = `${Number(m.oreAvoidanceTons * 1000).toFixed(1)} kg`;
      document.getElementById('esg-credits').textContent = `₹${Math.round(Number(m.carbonCreditsValueINR)).toLocaleString()}`;
    }
  })
  .catch(err => {
    // Local fallback
    document.getElementById('esg-co2').textContent = `${(wt * 3.42).toFixed(1)} kg`;
    document.getElementById('esg-water').textContent = `${(wt * 24.5).toFixed(1)} L`;
  });
}

function handleGenerateCert(event) {
  event.preventDefault();

  const producerName = document.getElementById('prodName').value;
  const cpcbRegNo = document.getElementById('cpcbReg').value;
  const weightKg = document.getElementById('certWeight').value;
  const category = document.getElementById('certCat').value;

  fetch('/api/epr/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      producerName,
      cpcbRegNo,
      weightKg,
      category
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.certificate) {
      const c = data.certificate;
      document.getElementById('viewCertId').textContent = c.certId;
      document.getElementById('viewProducer').textContent = c.producerName;
      document.getElementById('viewCpcb').textContent = c.cpcbRegNo;
      document.getElementById('viewWeight').textContent = `${c.dispatchedWeightKg.toLocaleString()} kg`;
      document.getElementById('viewCat').textContent = c.category;
      document.getElementById('viewDate').textContent = c.issueDate;
      document.getElementById('viewHash').textContent = c.sha256Hash;

      showToast(`Certificate ${c.certId} generated & cryptographically sealed!`, 'success');
    }
  })
  .catch(err => {
    showToast('Network error generating certificate', 'error');
  });
}
