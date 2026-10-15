/* ============================================
   EcoLoop — Recycling & Material Recovery Calculator
   Calculates estimated recovery weights and economic
   value based on disclosed metallurgical assumptions.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const weightInput = document.getElementById('calc-weight');
  const scenarioSelect = document.getElementById('calc-scenario');

  if (weightInput && scenarioSelect) {
    weightInput.addEventListener('input', calculateRecovery);
    scenarioSelect.addEventListener('change', calculateRecovery);
    
    // Initial run
    calculateRecovery();
  }
});

// Scientific Benchmarks: Yield per Kilogram of raw e-waste feed
// Source model: UNEP / StEP Initiative / Global E-waste Monitor
const SCENARIO_COEFFICIENTS = {
  // Gold (g/kg), Silver (g/kg), Copper (kg/kg), Alum+Steel (kg/kg), Plastics (kg/kg)
  laptops: {
    gold_g_per_kg: 0.045,      // ~45 mg per kg
    silver_g_per_kg: 0.28,     // 280 mg per kg
    copper_kg_per_kg: 0.12,    // 12% copper
    metals_kg_per_kg: 0.45,    // 45% aluminum & steel
    plastics_kg_per_kg: 0.25   // 25% ABS/Polycarb
  },
  smartphones: {
    gold_g_per_kg: 0.35,       // ~350 mg per kg (highest gold density)
    silver_g_per_kg: 1.20,     // 1.2 g per kg
    copper_kg_per_kg: 0.16,    // 16% copper
    metals_kg_per_kg: 0.18,    // 18% structural alloy
    plastics_kg_per_kg: 0.38   // 38% casing/substrates
  },
  cables: {
    gold_g_per_kg: 0.001,      // traces on connectors
    silver_g_per_kg: 0.005,
    copper_kg_per_kg: 0.48,    // 48% pure copper conductor
    metals_kg_per_kg: 0.05,    // 5% brass plugs
    plastics_kg_per_kg: 0.42   // 42% PVC sheath
  },
  peripherals: {
    gold_g_per_kg: 0.008,
    silver_g_per_kg: 0.04,
    copper_kg_per_kg: 0.08,
    metals_kg_per_kg: 0.42,    // structural steel frame
    plastics_kg_per_kg: 0.44   // high polymer housing
  },
  pcbs: {
    gold_g_per_kg: 0.85,       // High grade telecom/server motherboards
    silver_g_per_kg: 2.50,
    copper_kg_per_kg: 0.22,
    metals_kg_per_kg: 0.08,
    plastics_kg_per_kg: 0.30
  },
  mixed: {
    gold_g_per_kg: 0.07,
    silver_g_per_kg: 0.35,
    copper_kg_per_kg: 0.15,
    metals_kg_per_kg: 0.38,
    plastics_kg_per_kg: 0.30
  }
};

// Base Commodity Market Pricing in INR (₹)
const MARKET_PRICES = {
  gold_per_g: 6500,        // ₹6,500 per gram
  silver_per_g: 80,        // ₹80 per gram
  copper_per_kg: 680,      // ₹680 per kg
  metals_per_kg: 65,       // ₹65 per kg (weighted aluminum + steel blend)
  plastics_per_kg: 45      // ₹45 per kg (recycled polymer flakes)
};

function calculateRecovery() {
  const weightInput = document.getElementById('calc-weight');
  const scenarioSelect = document.getElementById('calc-scenario');

  let weight = parseFloat(weightInput.value);
  if (isNaN(weight) || weight <= 0) {
    weight = 0;
  }

  const scenario = scenarioSelect.value || 'mixed';
  const coef = SCENARIO_COEFFICIENTS[scenario] || SCENARIO_COEFFICIENTS.mixed;

  // Compute physical recovered quantities
  const totalGoldGrams = weight * coef.gold_g_per_kg;
  const totalSilverGrams = weight * coef.silver_g_per_kg;
  const totalCopperKg = weight * coef.copper_kg_per_kg;
  const totalMetalsKg = weight * coef.metals_kg_per_kg;
  const totalPlasticsKg = weight * coef.plastics_kg_per_kg;

  // Compute Total Weight Yield (fraction of original weight that is physically recovered)
  const totalRecoveredKg = (totalGoldGrams / 1000) + (totalSilverGrams / 1000) + totalCopperKg + totalMetalsKg + totalPlasticsKg;

  // Compute Potential Economic Valuation in INR
  const goldVal = totalGoldGrams * MARKET_PRICES.gold_per_g;
  const silverVal = totalSilverGrams * MARKET_PRICES.silver_per_g;
  const copperVal = totalCopperKg * MARKET_PRICES.copper_per_kg;
  const metalsVal = totalMetalsKg * MARKET_PRICES.metals_per_kg;
  const plasticsVal = totalPlasticsKg * MARKET_PRICES.plastics_per_kg;

  const totalValue = Math.round(goldVal + silverVal + copperVal + metalsVal + plasticsVal);

  // Update DOM Elements
  document.getElementById('calc-total-value').textContent = `₹${totalValue.toLocaleString('en-IN')}`;
  document.getElementById('calc-total-yield').textContent = `${totalRecoveredKg.toFixed(2)} kg (${((totalRecoveredKg / (weight || 1)) * 100).toFixed(0)}% yield)`;

  // Gold format: if < 1 gram, display in milligrams (mg)
  if (totalGoldGrams < 1) {
    document.getElementById('calc-gold-val').textContent = `${(totalGoldGrams * 1000).toFixed(1)} mg`;
  } else {
    document.getElementById('calc-gold-val').textContent = `${totalGoldGrams.toFixed(3)} g`;
  }

  document.getElementById('calc-silver-val').textContent = `${totalSilverGrams.toFixed(2)} g`;
  document.getElementById('calc-copper-val').textContent = `${totalCopperKg.toFixed(2)} kg`;
  document.getElementById('calc-aluminium-val').textContent = `${totalMetalsKg.toFixed(2)} kg`;
  document.getElementById('calc-plastics-val').textContent = `${totalPlasticsKg.toFixed(2)} kg`;
}
