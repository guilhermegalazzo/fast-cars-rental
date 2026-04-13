// ===== FAST CARS MIAMI - APP.JS (Backend Integrated) =====

let translations = {};
let fleetData = [];
let currentLang = 'en';
let currentCity = 'miami';

// ===== DATA FETCHING =====
async function initAppData() {
  try {
    const [contentRes, fleetRes] = await Promise.all([
      fetch('data/content.json'),
      fetch('data/fleet.json')
    ]);

    translations = await contentRes.json();
    const fleetFile = await fleetRes.json();
    fleetData = fleetFile.cars || [];

    setLanguage('en');
    renderFleet();
    console.log('✅ Data loaded');
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
}

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  if (!t) return;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n').replace('.', '_'); // CMS uses underscores
    
    // Handle city-specific subtitle
    if (key === 'fleet_subtitle') {
      const cityKey = `fleet_subtitle_${currentCity}`;
      el.textContent = t[cityKey] || t[key];
      return;
    }
    
    if (t[key]) {
      if (key === 'hero_title') {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
  
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en';
  
  // Update rent buttons
  document.querySelectorAll('.btn-rent span').forEach(el => {
    el.textContent = t['btn_rent'] || (lang === 'pt' ? 'Alugar' : lang === 'es' ? 'Alquilar' : 'Rent');
  });
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const fleetGrid = document.getElementById('fleetGrid');
const heroImgMiami = document.getElementById('heroImgMiami');
const heroImgOrlando = document.getElementById('heroImgOrlando');

// ===== CITY SELECTOR =====
function setCity(city) {
  currentCity = city;
  
  // Update city buttons
  document.querySelectorAll('.city-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.city === city);
  });
  
  // Crossfade hero backgrounds
  if (city === 'miami') {
    heroImgMiami.classList.add('active');
    heroImgOrlando.classList.remove('active');
  } else {
    heroImgMiami.classList.remove('active');
    heroImgOrlando.classList.add('active');
  }
  
  // Update fleet subtitle for selected city
  const subtitleEl = document.querySelector('[data-i18n="fleet.subtitle"]');
  if (subtitleEl) {
    const t = translations[currentLang];
    subtitleEl.textContent = t[`fleet_subtitle_${city}`];
  }
  
  // Re-render fleet with city filter
  renderFleet();
}

// City selector event listener
document.getElementById('citySelector').addEventListener('click', (e) => {
  const btn = e.target.closest('.city-btn');
  if (!btn) return;
  setCity(btn.dataset.city);
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ===== MOBILE MENU =====
mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// ===== LANGUAGE SWITCHER =====
document.getElementById('langSwitcher').addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  setLanguage(btn.dataset.lang);
});

// ===== RENDER FLEET CARDS =====
function createCarCard(car) {
  const whatsappNum = translations[currentLang]?.whatsapp_number || '19542790200';
  const cleanWhatsapp = whatsappNum.replace(/\+/g, '');
  const whatsappMsg = encodeURIComponent(`Hi! I'm interested in renting the ${car.name} (${car.year}) in ${currentCity === 'miami' ? 'Miami' : 'Orlando'}.`);
  const rentLabel = translations[currentLang]?.btn_rent || (currentLang === 'pt' ? 'Alugar' : currentLang === 'es' ? 'Alquilar' : 'Rent');
  
  return `
    <div class="car-card reveal">
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.name}" loading="lazy">
        ${car.badge ? `<span class="car-card-badge">${car.badge}</span>` : ''}
      </div>
      <div class="car-card-info">
        <h3>${car.name}</h3>
        <div class="car-year">${car.year}</div>
        <div class="car-card-specs">
          <span class="car-spec">Seats: ${car.seats}</span>
          <span class="car-spec">${car.transmission}</span>
          <span class="car-spec">${car.hp}</span>
        </div>
        <div class="car-card-footer">
          <div class="car-price">
            <span class="amount">${car.price}</span>
            <span class="period">/day</span>
          </div>
          <a href="https://wa.me/${cleanWhatsapp}?text=${whatsappMsg}" target="_blank" rel="noopener" class="btn-rent">
            <span>${rentLabel}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderFleet() {
  const filtered = fleetData.filter(car => car.location === currentCity || car.location === 'both');
  fleetGrid.style.opacity = '0';
  
  setTimeout(() => {
    fleetGrid.innerHTML = filtered.map(createCarCard).join('');
    fleetGrid.style.opacity = '1';
    
    // Re-trigger reveal animation logic if needed
    const newReveals = fleetGrid.querySelectorAll('.reveal');
    newReveals.forEach(el => revealObserver.observe(el));
  }, 300);
}

// ===== UTILS & ANIMATIONS =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

// Observe all static reveal elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

// Initialize everything
document.addEventListener('DOMContentLoaded', initAppData);
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
