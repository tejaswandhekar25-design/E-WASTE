/* ============================================
   EcoLoop — Smart Segregation Engine
   Rule-based device assessment, stream classification,
   hazard detection, and handling advice.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const btnAssess = document.getElementById('btn-assess');
  if (!btnAssess) return;

  btnAssess.addEventListener('click', runSegregationAssessment);
  
  // Run on initial load with defaults so the box is populated if user wants quick inspection
  runSegregationAssessment();
});

function runSegregationAssessment() {
  const cat = document.getElementById('seg-category').value;
  const condition = document.getElementById('seg-condition').value;
  const damage = document.getElementById('seg-damage').value;
  const resultBox = document.getElementById('seg-result');

  let classification = 'Recyclable Materials';
  let badgeText = 'Stream 3: Recyclable';
  let title = 'Precious Metals Recovery & Material Smelting';
  let summary = '';
  let hazardLevel = 'Low';
  let channel = 'Authorized E-Waste Dismantler';
  let materials = 'Copper, Aluminium, Polycarbonate';
  let safetyAdvice = 'Store in a dry location until collection. Do not attempt burning or backyard dismantling.';
  let isHazardCritical = false;

  // Rule 1: Hazardous condition check
  if (damage === 'swollen_battery' || cat === 'Batteries & Others') {
    classification = 'Hazardous Components';
    badgeText = 'Stream 4: High Hazard Alert';
    title = 'Hazardous Battery Isolation & Neutralization';
    hazardLevel = 'CRITICAL (Fire & Toxic Leakage Risk)';
    channel = 'Specialized Battery Kiosk or Hazardous Waste Facility';
    materials = 'Lithium, Cobalt, Nickel, Graphite';
    safetyAdvice = 'DO NOT puncture or bend! Insulate metallic terminals with non-conductive electrical tape immediately. Keep away from flammable materials and store in a sand-filled container.';
    summary = `Your ${cat} contains unstable battery chemistry. To prevent thermal runaway, do not place it in regular collection bins. Transport in a non-conductive padded container.`;
    isHazardCritical = true;
  }
  // Rule 2: Working state check
  else if (condition === 'working' && damage === 'intact') {
    classification = 'Reusable Electronics';
    badgeText = 'Stream 1: Highest Environmental Value';
    title = 'Refurbishment, Resale, or Educational Donation';
    hazardLevel = 'None (Safe for immediate handling)';
    channel = 'College Donation Drive / Second-hand Electronics Market';
    materials = 'Complete functional circuits, display panels, power bricks';
    safetyAdvice = 'Perform a complete factory reset and cryptographic data wipe before handing over your device.';
    summary = `Great news! Since your ${cat} is fully functional and structurally sound, reuse saves 100% of the embedded manufacturing carbon footprint. Keep it in service!`;
  }
  // Rule 3: Minor fault check
  else if (condition === 'minor_fault' && damage !== 'swollen_battery') {
    classification = 'Repairable & Upcyclable';
    badgeText = 'Stream 2: Modular Repair & Upcycling';
    title = 'Component Repair & Modular Restoration';
    hazardLevel = 'Low / Moderate';
    channel = 'Certified Repair Café / Hardware Refurbisher';
    materials = 'Motherboard components, repairable enclosures, optical drives';
    safetyAdvice = 'Ensure power is disconnected. Keep all removed screws and accessories together in a sealed ziplock pouch.';
    summary = `Your ${cat} has repairable life left. Component replacement (such as a fresh battery or display ribbon cable) will extend its operational lifecycle by 2-4 years.`;
  }
  // Rule 4: Non-functional / dead electronics
  else {
    classification = 'Recyclable Materials';
    badgeText = 'Stream 3: Urban Mining & Refining';
    title = 'Mechanical Dismantling & Hydrometallurgical Extraction';
    hazardLevel = (damage === 'cracked_screen' || damage === 'exposed_wiring') ? 'Moderate (Sharp glass / exposed trace risk)' : 'Low';
    channel = 'Authorized R2 / e-Stewards Certified Recycler';

    if (cat.includes('Computers') || cat.includes('Mobile') || cat.includes('Circuit')) {
      materials = 'High-grade Gold (Au), Silver (Ag), Pure Copper (Cu), Palladium';
      summary = `Your ${cat} has reached end-of-life, but contains high concentrations of rare precious metals. It will be shredded, magnetically separated, and smelted to recover pure secondary metals.`;
    } else if (cat.includes('Chargers') || cat.includes('Peripherals')) {
      materials = 'Electrolytic Copper wire, High-density Polyethylene, ABS casing';
      summary = `High copper content in cables and motors allows 95%+ direct re-smelting into industrial grade wiring for the manufacturing industry.`;
    } else {
      materials = 'Structural Steel, Aluminium casting, ABS engineering plastics';
      summary = `Heavy metallic framework and motors will undergo magnetic extraction and plastic pelletizing to feed raw manufacturing supply chains.`;
    }

    if (damage === 'cracked_screen') {
      safetyAdvice = 'Wrap fractured glass with clear packing tape to prevent skin cuts and glass particle contamination during transit.';
    } else if (damage === 'exposed_wiring') {
      safetyAdvice = 'Do not plug into wall outlets. Tape frayed cord ends with electrical insulation tape.';
    }
  }

  // Populate UI
  document.getElementById('result-badge').textContent = badgeText;
  document.getElementById('result-badge').className = `badge ${isHazardCritical ? 'badge-cancelled' : (classification.includes('Reusable') ? 'badge-collected' : 'badge-scheduled')}`;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-summary').textContent = summary;
  document.getElementById('result-classification').textContent = classification;
  document.getElementById('result-hazard').textContent = hazardLevel;
  document.getElementById('result-channel').textContent = channel;
  document.getElementById('result-materials').textContent = materials;
  document.getElementById('result-safety-text').textContent = safetyAdvice;

  const safetyBox = document.getElementById('result-safety-box');
  if (isHazardCritical) {
    safetyBox.style.background = '#FEF2F2';
    safetyBox.style.borderLeftColor = '#EF4444';
    safetyBox.style.color = '#991B1B';
  } else {
    safetyBox.style.background = '#EFF6FF';
    safetyBox.style.borderLeftColor = '#3B82F6';
    safetyBox.style.color = '#1E40AF';
  }

  resultBox.style.display = 'block';
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
