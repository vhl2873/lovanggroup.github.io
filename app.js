document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));

document.body.insertAdjacentHTML('afterbegin', '<div class="scroll-progress" aria-hidden="true"></div>');

const loader = document.getElementById('site-loader');
const topbar = document.querySelector('.topbar');
const navToggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
const themeToggle = document.querySelector('.theme-toggle');
const perfToggle = document.querySelector('.perf-toggle');

const savedTheme = localStorage.getItem('lvg-theme');
const savedPerf = localStorage.getItem('lvg-performance') === 'on';
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.setAttribute('data-theme', 'dark');
}
if (savedPerf) document.body.classList.add('performance-mode');

function syncToolbarState() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  themeToggle?.classList.toggle('active', isDark);
  themeToggle?.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  perfToggle?.classList.toggle('active', document.body.classList.contains('performance-mode'));
  perfToggle?.setAttribute('aria-pressed', document.body.classList.contains('performance-mode') ? 'true' : 'false');
}

window.addEventListener('load', () => {
  setTimeout(() => loader?.classList.add('hide'), document.body.classList.contains('performance-mode') ? 80 : 420);
});
setTimeout(() => loader?.classList.add('hide'), document.body.classList.contains('performance-mode') ? 120 : 1200);

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
menu?.querySelectorAll('a[href]').forEach((link) => {
  const href = (link.getAttribute('href') || '').replace('./', '').toLowerCase();
  if (href === currentPage || (currentPage === '' && href === 'index.html')) link.classList.add('active');
});

themeToggle?.addEventListener('click', () => {
  const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if (next === 'dark') document.body.setAttribute('data-theme', 'dark');
  else document.body.removeAttribute('data-theme');
  localStorage.setItem('lvg-theme', next);
  syncToolbarState();
});

perfToggle?.addEventListener('click', () => {
  const enabled = document.body.classList.toggle('performance-mode');
  localStorage.setItem('lvg-performance', enabled ? 'on' : 'off');
  syncToolbarState();
});

syncToolbarState();

navToggle?.addEventListener('click', () => {
  const opened = topbar?.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  navToggle.textContent = opened ? '✕' : '☰';
});

document.addEventListener('click', (e) => {
  if (!topbar?.classList.contains('menu-open')) return;
  if (topbar.contains(e.target)) return;
  topbar.classList.remove('menu-open');
  navToggle?.setAttribute('aria-expanded', 'false');
  if (navToggle) navToggle.textContent = '☰';
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    topbar?.classList.remove('menu-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    if (navToggle) navToggle.textContent = '☰';
  });
});

const chips = Array.from(document.querySelectorAll('.chip'));
const jobs = Array.from(document.querySelectorAll('.job-card'));

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    jobs.forEach((job) => {
      const show = filter === 'all' || job.dataset.role === filter;
      job.style.display = show ? '' : 'none';
    });
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('reveal');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.hero-content, .card, .job-card, .quote, .alt, .cta, .apply-card, .case-card, .platform-panel, .platform-card, .masonry-grid img, .project-showcase .case-card').forEach((el) => observer.observe(el));

const parallaxLayers = Array.from(document.querySelectorAll('[data-parallax]'));
const heroContent = document.querySelector('.hero-content');
const progressBar = document.querySelector('.scroll-progress');

function onScrollEffects() {
  const y = window.scrollY || 0;
  if (topbar) topbar.classList.toggle('scrolled', y > 18);
  if (progressBar) {
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const ratio = Math.min(100, Math.max(0, (y / max) * 100));
    progressBar.style.setProperty('--scroll-progress', `${ratio}%`);
  }
  parallaxLayers.forEach((layer) => {
    const speed = Number(layer.getAttribute('data-parallax')) || 0;
    layer.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
  });
}

window.addEventListener('scroll', onScrollEffects, { passive: true });
onScrollEffects();

window.addEventListener('pointermove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  document.documentElement.style.setProperty('--mx', `${x}%`);
  document.documentElement.style.setProperty('--my', `${y}%`);
  if (heroContent && window.innerWidth > 900) {
    const rx = (event.clientY / window.innerHeight - 0.5) * -4;
    const ry = (event.clientX / window.innerWidth - 0.5) * 5;
    heroContent.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
}, { passive: true });

window.addEventListener('pointerleave', () => {
  if (heroContent) heroContent.style.transform = '';
});

function syncActiveImages(track, selector = 'img') {
  const items = Array.from(track.querySelectorAll(selector));
  if (!items.length) return;
  const center = track.scrollLeft + track.clientWidth / 2;
  let active = items[0];
  let best = Infinity;
  items.forEach((item) => {
    const itemCenter = item.offsetLeft + item.clientWidth / 2;
    const distance = Math.abs(center - itemCenter);
    if (distance < best) {
      best = distance;
      active = item;
    }
  });
  items.forEach((item) => item.classList.toggle('is-active', item === active));
}

const sliders = Array.from(document.querySelectorAll('[data-slider]'));
sliders.forEach((slider) => {
  const track = slider.querySelector('[data-slider-track]');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  if (!track || !prev || !next) return;
  const slide = () => Math.max(track.clientWidth * 0.82, 260);
  prev.addEventListener('click', () => track.scrollBy({ left: -slide(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: slide(), behavior: 'smooth' }));

  let startX = 0;
  let scrollLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX;
    scrollLeft = track.scrollLeft;
    track.dataset.dragging = '1';
    track.classList.add('is-dragging');
    track.setPointerCapture?.(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (track.dataset.dragging !== '1') return;
    e.preventDefault();
    const walk = (e.clientX - startX) * 1.15;
    track.scrollLeft = scrollLeft - walk;
    syncActiveImages(track);
  });
  const stopDrag = () => {
    delete track.dataset.dragging;
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', stopDrag);
  track.addEventListener('pointercancel', stopDrag);
  track.addEventListener('pointerleave', stopDrag);
  track.addEventListener('lostpointercapture', stopDrag);
  track.addEventListener('scroll', () => syncActiveImages(track), { passive: true });
  track.querySelectorAll('img').forEach((img) => img.setAttribute('draggable', 'false'));
  syncActiveImages(track);
});

const heroGrid = document.querySelector('.hero-grid');
if (heroGrid) {
  let heroTimer;
  let heroIndex = 0;

  const getHeroImages = () => Array.from(heroGrid.querySelectorAll('img')).filter((img) => {
    const style = window.getComputedStyle(img);
    return style.display !== 'none';
  });

  const scrollHeroGridToActive = (activeImage) => {
    if (!activeImage || window.innerWidth > 680) return;
    const targetLeft = Math.max(
      0,
      activeImage.offsetLeft - Math.max((heroGrid.clientWidth - activeImage.clientWidth) / 2, 0)
    );
    heroGrid.scrollTo({
      left: targetLeft,
      behavior: document.body.classList.contains('performance-mode') ? 'auto' : 'smooth',
    });
  };

  const syncHeroActive = (scrollOnMobile = false) => {
    const heroImages = getHeroImages();
    if (!heroImages.length) return;
    heroIndex = heroIndex % heroImages.length;
    heroImages.forEach((img, index) => img.classList.toggle('is-active', index === heroIndex));
    if (scrollOnMobile && window.innerWidth <= 680) {
      scrollHeroGridToActive(heroImages[heroIndex]);
    }
  };

  const startHeroRotation = () => {
    clearInterval(heroTimer);
    const heroImages = getHeroImages();
    if (heroImages.length <= 1) return;
    heroTimer = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
      syncHeroActive(window.innerWidth <= 680);
    }, document.body.classList.contains('performance-mode') ? 5200 : 3600);
  };

  syncHeroActive();
  startHeroRotation();

  heroGrid.addEventListener('pointerdown', () => clearInterval(heroTimer));
  heroGrid.addEventListener('pointerup', () => startHeroRotation());
  heroGrid.addEventListener('pointerleave', () => startHeroRotation());

  if (window.innerWidth <= 680) {
    heroGrid.addEventListener('scroll', () => syncActiveImages(heroGrid), { passive: true });
    syncActiveImages(heroGrid);
  }

  window.addEventListener('resize', () => {
    syncHeroActive();
    startHeroRotation();
  });
}

const motionCards = Array.from(document.querySelectorAll('.card, .job-card, .case-card, .apply-card, .contact-item, .platform-card'));
motionCards.forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    if (window.innerWidth < 900) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 6;
    const ry = (px - 0.5) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

const floatingButtons = Array.from(document.querySelectorAll('.floating-contact a'));
setInterval(() => {
  const target = floatingButtons[0];
  if (!target) return;
  target.classList.add('pulse');
  setTimeout(() => target.classList.remove('pulse'), 1600);
}, 4800);

let autoSliderTimer;
function startAutoSlider() {
  const sliders = Array.from(document.querySelectorAll('[data-slider-track]'));
  if (!sliders.length) return;
  clearInterval(autoSliderTimer);
  autoSliderTimer = setInterval(() => {
    sliders.forEach((track) => {
      const step = Math.max(track.clientWidth * 0.72, 220);
      const maxScroll = track.scrollWidth - track.clientWidth;
      const next = track.scrollLeft + step;
      track.scrollTo({ left: next >= maxScroll ? 0 : next, behavior: 'smooth' });
    });
  }, 3600);
}
startAutoSlider();
