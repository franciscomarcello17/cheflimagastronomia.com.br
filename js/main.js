// =====================================================
// CHEFF LIMA — COMPILED JS (from ts/main.ts)
// =====================================================
"use strict";

// =====================================================
// THEME TOGGLE
// =====================================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('chefflima-theme', theme);

  if (theme === 'dark') {
    themeIcon.className = 'fas fa-sun';
    themeToggle.setAttribute('aria-label', 'Alternar para tema claro');
  } else {
    themeIcon.className = 'fas fa-moon';
    themeToggle.setAttribute('aria-label', 'Alternar para tema escuro');
  }
}

// Sync icon with the theme that was applied by the anti-flash script
(function syncInitialIcon() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current);
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  // Smooth transition
  document.documentElement.classList.add('theme-transitioning');
  applyTheme(next);
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
});

// =====================================================
// NAVIGATION
// =====================================================
const header    = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
const navLinks  = document.querySelectorAll('.nav__link');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNav();
  toggleBackToTop();
});

let navOverlay = null;

function openMenu() {
  navMenu.classList.add('open');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  if (!navOverlay) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);
    navOverlay.addEventListener('click', closeMenu);
  }
  navOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  if (navOverlay) navOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  navMenu.classList.contains('open') ? closeMenu() : openMenu();
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav__link[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}

// =====================================================
// SMOOTH SCROLL
// =====================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// =====================================================
// BACK TO TOP
// =====================================================
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =====================================================
// ANIMATED COUNTERS
// =====================================================
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-count') || '0', 10);
  const duration = 2000;
  const step     = target / (duration / 16);
  let current    = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('pt-BR') + (target >= 100 ? '+' : '');
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (!el.dataset.animated) { el.dataset.animated = 'true'; animateCounter(el); }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// =====================================================
// MENU + GALLERY (data-driven carousels)
// =====================================================
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function buildCarousel(slidesHTML, extraClass) {
  return `
    <div class="carousel ${extraClass || ''}">
      <button class="carousel__btn carousel__btn--prev" aria-label="Anterior" type="button">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="carousel__viewport">
        <div class="carousel__track">${slidesHTML}</div>
      </div>
      <button class="carousel__btn carousel__btn--next" aria-label="Próximo" type="button">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

function bindCarousel(root) {
  const viewport = root.querySelector('.carousel__viewport');
  const prev     = root.querySelector('.carousel__btn--prev');
  const next     = root.querySelector('.carousel__btn--next');
  if (!viewport || !prev || !next) return;

  function updateState() {
    const max = viewport.scrollWidth - viewport.clientWidth - 2;
    prev.disabled = viewport.scrollLeft <= 0;
    next.disabled = viewport.scrollLeft >= max;
  }

  function step(dir) {
    viewport.scrollBy({ left: dir * viewport.clientWidth * 0.85, behavior: 'smooth' });
  }

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  viewport.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', updateState);

  // Touch swipe (in addition to native scroll, helps consistency)
  let startX = 0, scrolling = false;
  viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; scrolling = true; }, { passive: true });
  viewport.addEventListener('touchend',   e => {
    if (!scrolling) return;
    scrolling = false;
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 60) step(dx > 0 ? 1 : -1);
  });

  requestAnimationFrame(updateState);
}

function dishCardHTML(dish, segmentTag) {
  return `
    <article class="carousel__slide">
      <div class="dish-card">
        <div class="dish-card__img-wrap">
          <img class="dish-card__img" src="${escHtml(dish.image)}" alt="${escHtml(dish.title)}" loading="lazy" />
        </div>
        <div class="dish-card__body">
          <span class="dish-card__tag">${escHtml(segmentTag || dish.segment)}</span>
          <h3 class="dish-card__name">${escHtml(dish.title)}</h3>
          <p class="dish-card__desc">${escHtml(dish.description)}</p>
        </div>
      </div>
    </article>
  `;
}

function galleryItemHTML(item) {
  const caption = item.title ? `<div class="gallery__caption">${escHtml(item.title)}</div>` : '';
  return `
    <article class="carousel__slide" data-category="${escHtml(item.category)}">
      <div class="gallery__item">
        <img class="gallery__img" src="${escHtml(item.image)}" alt="${escHtml(item.title || 'Imagem da galeria')}" loading="lazy" />
        ${caption}
      </div>
    </article>
  `;
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Falha ao carregar ${path}: ${res.status}`);
  return res.json();
}

function observeReveal(els) {
  if (typeof revealObserver === 'undefined') return;
  els.forEach(el => {
    el.setAttribute('data-reveal', '');
    revealObserver.observe(el);
  });
}

// ----- MENU -----
async function renderMenu() {
  const tabsRoot      = document.getElementById('menuTabs');
  const carouselsRoot = document.getElementById('menuCarousels');
  if (!tabsRoot || !carouselsRoot) return;

  let data;
  try {
    data = await loadJSON('data/menu.json');
  } catch (err) {
    console.error(err);
    carouselsRoot.innerHTML = `<p style="text-align:center;color:var(--fg-2)">Não foi possível carregar o cardápio.</p>`;
    return;
  }

  const segments = data.segments || [];
  const dishes   = data.dishes   || [];
  if (!segments.length) return;

  // Tabs
  tabsRoot.innerHTML = segments.map((seg, i) => `
    <button class="menu__tab ${i === 1 ? 'active' : ''}" data-tab="${escHtml(seg.id)}" type="button">
      ${escHtml(seg.label)}
    </button>
  `).join('');

  // Carousels (one per segment)
  carouselsRoot.innerHTML = segments.map(seg => {
    const segDishes = dishes.filter(d => d.segment === seg.id);
    const slides = segDishes.map(d => dishCardHTML(d, seg.tag)).join('');
    return `<div class="menu__carousel" data-segment="${escHtml(seg.id)}">${buildCarousel(slides)}</div>`;
  }).join('');

  carouselsRoot.setAttribute('data-active', segments[1].id);

  // Tab switching
  tabsRoot.querySelectorAll('.menu__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabsRoot.querySelectorAll('.menu__tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      carouselsRoot.setAttribute('data-active', target);
    });
  });

  // Bind carousels
  carouselsRoot.querySelectorAll('.carousel').forEach(bindCarousel);

  // Reveal animation
  observeReveal(carouselsRoot.querySelectorAll('.dish-card'));
}

// ----- GALLERY -----
async function renderGallery() {
  const filtersRoot = document.getElementById('galleryFilters');
  const carouselRoot = document.getElementById('galleryCarousel');
  if (!filtersRoot || !carouselRoot) return;

  let data;
  try {
    data = await loadJSON('data/gallery.json');
  } catch (err) {
    console.error(err);
    carouselRoot.innerHTML = `<p style="text-align:center;color:var(--fg-2)">Não foi possível carregar a galeria.</p>`;
    return;
  }

  const categories = data.categories || [{ id: 'all', label: 'Todos' }];
  const items      = data.items      || [];

  filtersRoot.innerHTML = categories.map((cat, i) => `
    <button class="gallery__filter ${i === 0 ? 'active' : ''}" data-filter="${escHtml(cat.id)}" type="button">
      ${escHtml(cat.label)}
    </button>
  `).join('');

  function paint(filter) {
    const visible = filter === 'all' ? items : items.filter(i => i.category === filter);
    const slides = visible.map(galleryItemHTML).join('') ||
      `<p style="padding:2rem;color:var(--fg-2)">Nenhuma imagem nesta categoria.</p>`;
    carouselRoot.innerHTML = buildCarousel(slides, 'gallery__inner-carousel');
    const carousel = carouselRoot.querySelector('.carousel');
    if (carousel) bindCarousel(carousel);
    observeReveal(carouselRoot.querySelectorAll('.gallery__item'));
  }

  paint('all');

  filtersRoot.querySelectorAll('.gallery__filter').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersRoot.querySelectorAll('.gallery__filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      paint(btn.getAttribute('data-filter'));
    });
  });
}

// We render inside the gallery section element (which is wrapped in a .container in HTML)
// renderMenu / renderGallery are kicked off after revealObserver is defined below.

// =====================================================
// TESTIMONIALS SLIDER
// =====================================================
const testimonialCards = document.querySelectorAll('.testimonial-card');
const prevBtn          = document.getElementById('prevTestimonial');
const nextBtn          = document.getElementById('nextTestimonial');
const dotsContainer    = document.getElementById('testimonialDots');

let currentTestimonial = 0;
let testimonialTimer;

function createDots() {
  dotsContainer.innerHTML = '';
  testimonialCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.addEventListener('click', () => { showTestimonial(i); resetAutoSlide(); });
    dotsContainer.appendChild(dot);
  });
}

function showTestimonial(index) {
  const dots = dotsContainer.querySelectorAll('.testimonials__dot');
  testimonialCards[currentTestimonial].classList.remove('active');
  dots[currentTestimonial]?.classList.remove('active');

  currentTestimonial = ((index % testimonialCards.length) + testimonialCards.length) % testimonialCards.length;

  testimonialCards[currentTestimonial].classList.add('active');
  dots[currentTestimonial]?.classList.add('active');
}

function startAutoSlide() {
  testimonialTimer = setInterval(() => showTestimonial(currentTestimonial + 1), 5000);
}

function resetAutoSlide() {
  clearInterval(testimonialTimer);
  startAutoSlide();
}

prevBtn.addEventListener('click', () => { showTestimonial(currentTestimonial - 1); resetAutoSlide(); });
nextBtn.addEventListener('click', () => { showTestimonial(currentTestimonial + 1); resetAutoSlide(); });

createDots();
startAutoSlide();

const slider = document.getElementById('testimonialsSlider');
if (slider) {
  slider.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
  slider.addEventListener('mouseleave', startAutoSlide);

  // Touch swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      showTestimonial(currentTestimonial + (diff > 0 ? 1 : -1));
      resetAutoSlide();
    }
  });
}

// =====================================================
// CONTACT FORM → WHATSAPP
// =====================================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('name').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const email   = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const guests  = document.getElementById('guests').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !phone) { showFormError('Por favor, preencha seu nome e telefone.'); return; }

    const serviceLabels = {
      'jantar-privado': 'Jantar Privado',
      'casamento':      'Casamento',
      'corporativo':    'Evento Corporativo',
      'aniversario':    'Aniversário',
      'noivado':        'Noivado',
      'cha-panela':     'Chá de Panela',
      'chef-casa':      'Chef em Casa',
      'consultoria':    'Consultoria Gastronômica',
      'outro':          'Outro',
    };

    let text  = `Olá, Chef Lima!\n\n`;

    text += `*SOLICITAÇÃO DE ORÇAMENTO*\n`;
    text += `-----------------------------------------------------\n\n`;

    text += `*Nome:* ${name}\n`;

    if (phone) text += `*Telefone:* ${phone}\n`;
    if (email) text += `*E-mail:* ${email}\n`;

    text += `*Tipo de evento:* ${serviceLabels[service] || service || 'Não informado'}\n`;

    if (guests) text += `*Número de convidados:* ${guests}\n`;

    if (message) {
      text += `\n*Mensagem:*\n${message}\n`;
    }

    text += `\n-----------------------------------------------------\n`;
    text += `Aguardo seu contato.\n\n`;
    text += `Obrigado!`;

    window.open(`https://wa.me/554788175366?text=${encodeURIComponent(text)}`, '_blank');
  });
}

function showFormError(msg) {
  const existing = contactForm.querySelector('.form-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'form-error';
  div.style.cssText = `background:rgba(107,39,55,.3);border:1px solid rgba(139,51,71,.5);border-radius:8px;padding:.75rem 1rem;font-size:.875rem;color:#ff9ea9;margin-top:-.5rem;`;
  div.textContent = msg;
  const btn = contactForm.querySelector('button[type="submit"]');
  if (btn) contactForm.insertBefore(div, btn);
  setTimeout(() => div.remove(), 4000);
}

// =====================================================
// SCROLL REVEAL
// =====================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll(
  '.service-card, .dish-card, .gallery__item, .about__content, .about__visual, .badge-item, .contact__info, .contact__form-wrap'
).forEach(el => {
  el.setAttribute('data-reveal', '');
  revealObserver.observe(el);
});

// =====================================================
// PARALLAX (hero)
// =====================================================
const heroBg = document.querySelector('.hero__bg');
window.addEventListener('scroll', () => {
  if (heroBg && window.scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }
}, { passive: true });

// =====================================================
// INIT
// =====================================================
updateActiveNav();
toggleBackToTop();

renderMenu();
renderGallery();
