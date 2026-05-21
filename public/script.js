'use strict';

const form = document.getElementById('promoForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const overlay = document.getElementById('overlay');

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId.replace('code_parrainage', 'code') + '-error') ||
                document.getElementById('code-error');
  if (input) input.classList.add('invalid');
  if (errEl) errEl.textContent = message;
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errId = fieldId === 'code_parrainage' ? 'code-error' : fieldId + '-error';
  const errEl = document.getElementById(errId);
  if (input) input.classList.remove('invalid');
  if (errEl) errEl.textContent = '';
}

function clearAll() {
  ['nom', 'prenom', 'telephone', 'adresse', 'code_postal', 'ville', 'email', 'code_parrainage'].forEach(clearError);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function isValidPhone(phone) {
  return /^[\d\s\+\-\(\)]{6,20}$/.test(phone.trim());
}

function validateForm(data) {
  let valid = true;

  if (!data.nom || data.nom.trim().length < 2) {
    showError('nom', 'Le nom doit contenir au moins 2 caractères.');
    valid = false;
  }
  if (!data.prenom || data.prenom.trim().length < 2) {
    showError('prenom', 'Le prénom doit contenir au moins 2 caractères.');
    valid = false;
  }
  if (!data.telephone || !isValidPhone(data.telephone)) {
    showError('telephone', 'Numéro de téléphone invalide.');
    valid = false;
  }
  if (!data.adresse || data.adresse.trim().length < 5) {
    showError('adresse', "L'adresse doit contenir au moins 5 caractères.");
    valid = false;
  }
  if (!data.code_postal || !/^\d{4,10}$/.test(data.code_postal.trim())) {
    showError('code_postal', 'Code postal invalide.');
    valid = false;
  }
  if (!data.ville || data.ville.trim().length < 2) {
    showError('ville', 'La ville doit contenir au moins 2 caractères.');
    valid = false;
  }
  if (!data.email || !isValidEmail(data.email)) {
    showError('email', 'Adresse email invalide.');
    valid = false;
  }
  if (!data.code_parrainage || data.code_parrainage.trim().length < 1) {
    showError('code_parrainage', 'Le code de parrainage est obligatoire.');
    valid = false;
  }

  return valid;
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoader.hidden = !loading;
}

function closePopup() {
  overlay.hidden = true;
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closePopup();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

['nom', 'prenom', 'telephone', 'adresse', 'code_postal', 'ville', 'email', 'code_parrainage'].forEach((id) => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', () => clearError(id));
  }
});

// Autocomplete adresse — API du gouvernement français
const adresseInput = document.getElementById('adresse');
const suggestionsList = document.getElementById('adresse-suggestions');
let debounceTimer = null;
let activeIndex = -1;

adresseInput.addEventListener('focus', () => adresseInput.removeAttribute('readonly'));

adresseInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = adresseInput.value.trim();
  if (query.length < 3) { hideSuggestions(); return; }
  debounceTimer = setTimeout(() => fetchAddresses(query), 280);
});

async function fetchAddresses(query) {
  try {
    const res = await fetch(
      'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(query) + '&limit=6&autocomplete=1'
    );
    const data = await res.json();
    showSuggestions(data.features || []);
  } catch {
    hideSuggestions();
  }
}

function showSuggestions(features) {
  suggestionsList.innerHTML = '';
  activeIndex = -1;
  if (!features.length) { hideSuggestions(); return; }
  features.forEach((feature) => {
    const { label, name, postcode, city } = feature.properties;
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.textContent = label;
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectAddress(name, postcode, city);
    });
    suggestionsList.appendChild(li);
  });
  suggestionsList.hidden = false;
}

function selectAddress(name, postcode, city) {
  adresseInput.value = name;
  document.getElementById('code_postal').value = postcode;
  document.getElementById('ville').value = city;
  clearError('adresse');
  clearError('code_postal');
  clearError('ville');
  hideSuggestions();
}

function hideSuggestions() {
  suggestionsList.hidden = true;
  suggestionsList.innerHTML = '';
  activeIndex = -1;
}

adresseInput.addEventListener('blur', () => setTimeout(hideSuggestions, 150));

adresseInput.addEventListener('keydown', (e) => {
  const items = suggestionsList.querySelectorAll('.suggestion-item');
  if (suggestionsList.hidden || !items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateActiveItem(items);
  } else if (e.key === 'Enter' && activeIndex >= 0) {
    e.preventDefault();
    items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
});

function updateActiveItem(items) {
  items.forEach((item, i) => item.classList.toggle('active', i === activeIndex));
  if (activeIndex >= 0) items[activeIndex].scrollIntoView({ block: 'nearest' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAll();

  const data = {
    nom: form.nom.value,
    prenom: form.prenom.value,
    telephone: form.telephone.value,
    adresse: form.adresse.value,
    code_postal: form.code_postal.value,
    ville: form.ville.value,
    email: form.email.value,
    code_parrainage: form.code_parrainage.value,
    honeypot: document.getElementById('honeypot').value,
  };

  if (!validateForm(data)) return;

  setLoading(true);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      form.reset();
      overlay.hidden = false;
    } else {
      const msg = result.error || 'Une erreur est survenue. Veuillez réessayer.';
      alert(msg);
    }
  } catch {
    alert('Impossible de contacter le serveur. Vérifiez votre connexion.');
  } finally {
    setLoading(false);
  }
});
