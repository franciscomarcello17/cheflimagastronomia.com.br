// =====================================================
// CHEFF LIMA — MAIN TYPESCRIPT
// =====================================================

type Theme = 'dark' | 'light';

// =====================================================
// THEME TOGGLE
// =====================================================
const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
const themeIcon   = document.getElementById('themeIcon') as HTMLElement;

function applyTheme(theme: Theme): void {
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

// Sync icon with the theme applied by the anti-flash inline script
(function syncInitialIcon(): void {
  const current = (document.documentElement.getAttribute('data-theme') || 'dark') as Theme;
  applyTheme(current);
})();

themeToggle.addEventListener('click', (): void => {
  const current = document.documentElement.getAttribute('data-theme') as Theme;
  const next: Theme = current === 'dark' ? 'light' : 'dark';

  document.documentElement.classList.add('theme-transitioning');
  applyTheme(next);
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
});

// =====================================================
// NAVIGATION
// =====================================================
const header    = document.getElementById('header') as HTMLElement;
const navToggle = document.getElementById('navToggle') as HTMLButtonElement;
const navMenu   = document.getElementById('navMenu') as HTMLElement;
const navLinks  = document.querySelectorAll<HTMLAnchorElement>('.nav__link');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNav();
  toggleBackToTop();
});

let navOverlay: HTMLDivElement | null = null;

function openMenu(): void {
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

function closeMenu(): void {
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

function updateActiveNav(): void {
  const sections  = document.querySelectorAll<HTMLElement>('section[id]');
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector<HTMLAnchorElement>(`.nav__link[href="#${id}"]`)?.classList.add('active');
    }
  });
}

// =====================================================
// SMOOTH SCROLL
// =====================================================
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e: MouseEvent) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// =====================================================
// BACK TO TOP
// =====================================================
const backToTop = document.getElementById('backToTop') as HTMLButtonElement;

function toggleBackToTop(): void {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =====================================================
// ANIMATED COUNTERS
// =====================================================
function animateCounter(el: HTMLElement): void {
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
      const el = entry.target as HTMLElement;
      if (!el.dataset.animated) { el.dataset.animated = 'true'; animateCounter(el); }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => counterObserver.observe(el));

// =====================================================
// MENU TABS
// =====================================================
const menuTabs     = document.querySelectorAll<HTMLButtonElement>('.menu__tab');
const menuContents = document.querySelectorAll<HTMLElement>('.menu__content');

menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');
    if (!target) return;
    menuTabs.forEach(t => t.classList.remove('active'));
    menuContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${target}`)?.classList.add('active');
  });
});

// =====================================================
// GALLERY FILTER
// =====================================================
const galleryFilters = document.querySelectorAll<HTMLButtonElement>('.gallery__filter');
const galleryItems   = document.querySelectorAll<HTMLElement>('.gallery__item');

galleryFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    const category = filter.getAttribute('data-filter');
    galleryFilters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');

    galleryItems.forEach(item => {
      const visible = category === 'all' || item.getAttribute('data-category') === category;
      item.classList.toggle('hidden', !visible);
      if (visible) {
        item.style.animation = 'none';
        item.offsetHeight;
        item.style.animation = 'fadeSlide 0.4s ease forwards';
      }
    });
  });
});

// =====================================================
// TESTIMONIALS SLIDER
// =====================================================
const testimonialCards = document.querySelectorAll<HTMLElement>('.testimonial-card');
const prevBtn          = document.getElementById('prevTestimonial') as HTMLButtonElement;
const nextBtn          = document.getElementById('nextTestimonial') as HTMLButtonElement;
const dotsContainer    = document.getElementById('testimonialDots') as HTMLElement;

let currentTestimonial = 0;
let testimonialTimer: ReturnType<typeof setInterval>;

function createDots(): void {
  dotsContainer.innerHTML = '';
  testimonialCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.addEventListener('click', () => { showTestimonial(i); resetAutoSlide(); });
    dotsContainer.appendChild(dot);
  });
}

function showTestimonial(index: number): void {
  const dots = dotsContainer.querySelectorAll<HTMLButtonElement>('.testimonials__dot');
  testimonialCards[currentTestimonial].classList.remove('active');
  dots[currentTestimonial]?.classList.remove('active');

  currentTestimonial = ((index % testimonialCards.length) + testimonialCards.length) % testimonialCards.length;

  testimonialCards[currentTestimonial].classList.add('active');
  dots[currentTestimonial]?.classList.add('active');
}

function startAutoSlide(): void {
  testimonialTimer = setInterval(() => showTestimonial(currentTestimonial + 1), 5000);
}

function resetAutoSlide(): void {
  clearInterval(testimonialTimer);
  startAutoSlide();
}

prevBtn.addEventListener('click', () => { showTestimonial(currentTestimonial - 1); resetAutoSlide(); });
nextBtn.addEventListener('click', () => { showTestimonial(currentTestimonial + 1); resetAutoSlide(); });

createDots();
startAutoSlide();

const slider = document.getElementById('testimonialsSlider') as HTMLElement;
if (slider) {
  slider.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
  slider.addEventListener('mouseleave', startAutoSlide);

  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
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
const contactForm = document.getElementById('contactForm') as HTMLFormElement;

if (contactForm) {
  contactForm.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();

    const name    = (document.getElementById('name')    as HTMLInputElement).value.trim();
    const phone   = (document.getElementById('phone')   as HTMLInputElement).value.trim();
    const email   = (document.getElementById('email')   as HTMLInputElement).value.trim();
    const service = (document.getElementById('service') as HTMLSelectElement).value;
    const guests  = (document.getElementById('guests')  as HTMLInputElement).value.trim();
    const message = (document.getElementById('message') as HTMLTextAreaElement).value.trim();

    if (!name || !phone) { showFormError('Por favor, preencha seu nome e telefone.'); return; }

    const serviceLabels: Record<string, string> = {
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

    let text  = `Olá, Cheff Lima! 👨‍🍳\n\n`;
    text += `Meu nome é *${name}* e tenho interesse nos seus serviços.\n\n`;
    if (phone)   text += `📱 *Telefone:* ${phone}\n`;
    if (email)   text += `✉️ *E-mail:* ${email}\n`;
    text += `🍽️ *Tipo de evento:* ${serviceLabels[service] || service || 'Não informado'}\n`;
    if (guests)  text += `👥 *Convidados:* ${guests}\n`;
    if (message) text += `\n📝 *Mensagem:*\n${message}`;
    text += `\n\nAguardo seu contato!`;

    window.open(`https://wa.me/5547999999999?text=${encodeURIComponent(text)}`, '_blank');
  });
}

function showFormError(msg: string): void {
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
      (entry.target as HTMLElement).classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll<HTMLElement>(
  '.service-card, .dish-card, .gallery__item, .about__content, .about__visual, .badge-item, .contact__info, .contact__form-wrap'
).forEach(el => {
  el.setAttribute('data-reveal', '');
  revealObserver.observe(el);
});

// =====================================================
// PARALLAX (hero)
// =====================================================
const heroBg = document.querySelector<HTMLElement>('.hero__bg');
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
