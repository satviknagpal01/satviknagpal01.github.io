// /src/js/animations.js
export function revealOnScroll(selector = '.section', options = {threshold: 0.12}) {
  const els = Array.from(document.querySelectorAll(selector));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, options);
  els.forEach(el => observer.observe(el));
  return observer;
}

export function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const navH = document.querySelector('.navbar')?.offsetHeight || 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function typewriter(el, speed = 18) {
  const text = el.getAttribute('data-text') || el.textContent || '';
  el.textContent = '';
  let i = 0;
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed + Math.random()*22);
    }
  })();
}
