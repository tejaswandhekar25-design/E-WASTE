/* ============================================
   EcoLoop — Collection Form Handler
   Manages client-side validation, weight estimation,
   data submission to LocalStorage, and user feedback.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('collection-form');
  if (!form) return;

  // Auto-estimate weight hint based on category & quantity
  const categorySelect = document.getElementById('category');
  const quantityInput = document.getElementById('quantity');
  const weightInput = document.getElementById('weightKg');

  const defaultWeights = {
    'Computers & Laptops': 2.5,
    'Mobile Phones & Tablets': 0.25,
    'Chargers & Cables': 0.1,
    'Printers & Scanners': 5.0,
    'Keyboards, Mice & Peripherals': 0.6,
    'Circuit Boards & Components': 0.3,
    'Batteries & Others': 0.5
  };

  function updateWeightEstimate() {
    const cat = categorySelect.value;
    const qty = parseInt(quantityInput.value) || 1;
    if (cat && defaultWeights[cat] && (!weightInput.value || weightInput.dataset.autoEstimated === 'true')) {
      const estimated = (defaultWeights[cat] * qty).toFixed(2);
      weightInput.value = estimated;
      weightInput.dataset.autoEstimated = 'true';
    }
  }

  categorySelect.addEventListener('change', updateWeightEstimate);
  quantityInput.addEventListener('input', updateWeightEstimate);
  weightInput.addEventListener('input', () => {
    // If the user manually edits the weight, stop auto-overriding
    weightInput.dataset.autoEstimated = 'false';
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all required fields
    const userNameInput = document.getElementById('userName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const cityInput = document.getElementById('city');
    const deviceNameInput = document.getElementById('deviceName');
    const conditionInput = document.getElementById('deviceCondition');
    const methodInput = document.getElementById('collectionMethod');
    const notesInput = document.getElementById('notes');

    const v1 = validateField(userNameInput, { required: true, minLength: 2, requiredMsg: 'Please enter your full name' });
    const v2 = validateField(emailInput, { required: true, email: true, requiredMsg: 'Please enter your email address' });
    const v3 = validateField(phoneInput, { required: true, phone: true, requiredMsg: 'Please enter a valid 10-digit phone number' });
    const v4 = validateField(cityInput, { required: true, minLength: 2, requiredMsg: 'Please enter your city/area' });
    const v5 = validateField(categorySelect, { required: true, requiredMsg: 'Please select an e-waste category' });
    const v6 = validateField(deviceNameInput, { required: true, minLength: 2, requiredMsg: 'Please enter the device name/model' });
    const v7 = validateField(quantityInput, { required: true, min: 1, max: 100, requiredMsg: 'Quantity must be between 1 and 100' });
    const v8 = validateField(weightInput, { required: true, min: 0.01, max: 500, requiredMsg: 'Weight must be between 0.01 and 500 kg' });
    const v9 = validateField(conditionInput, { required: true, requiredMsg: 'Please select device condition' });
    const v10 = validateField(methodInput, { required: true, requiredMsg: 'Please select collection method' });

    if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6 || !v7 || !v8 || !v9 || !v10) {
      showToast('Please fix all highlighted errors before submitting.', 'error');
      return;
    }

    // Prepare Request Object
    const requestData = {
      userName: userNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      city: cityInput.value.trim(),
      category: categorySelect.value,
      deviceName: deviceNameInput.value.trim(),
      quantity: parseInt(quantityInput.value.trim(), 10),
      weightKg: parseFloat(weightInput.value.trim()).toFixed(2),
      deviceCondition: conditionInput.value,
      collectionMethod: methodInput.value,
      notes: notesInput ? notesInput.value.trim() : ''
    };

    // Save using EcoStorage
    const saved = EcoStorage.addRequest(requestData);

    if (saved && saved.requestId) {
      // Show success container & hide form
      const successBox = document.getElementById('success-message');
      const formBox = document.getElementById('collection-form-container');
      const reqIdEl = document.getElementById('success-request-id');

      if (reqIdEl) reqIdEl.textContent = saved.requestId;
      if (successBox) successBox.style.display = 'block';
      if (formBox) formBox.style.display = 'none';

      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Registration saved! Request ID: ${saved.requestId}`, 'success');
    } else {
      showToast('Error saving request. Please try again.', 'error');
    }
  });
});

/** Global reset helper called from "Register Another" button */
function resetForm() {
  const form = document.getElementById('collection-form');
  const successBox = document.getElementById('success-message');
  const formBox = document.getElementById('collection-form-container');

  if (form) {
    form.reset();
    clearValidationErrors(form);
    const weightInput = document.getElementById('weightKg');
    if (weightInput) delete weightInput.dataset.autoEstimated;
  }
  if (successBox) successBox.style.display = 'none';
  if (formBox) formBox.style.display = 'block';
}
