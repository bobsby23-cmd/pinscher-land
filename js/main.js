/* Pinscher Land — shared interactions */
(function () {
  'use strict';

  const storageKey = 'preferred_lang';

  function applyLanguage(lang) {
    const selected = lang === 'en' ? 'en' : 'bg';
    document.documentElement.lang = selected;
    try { localStorage.setItem(storageKey, selected); } catch (_) {}
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = el.getAttribute(`data-${selected}`);
      if (value !== null) el.innerHTML = value;
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
      const active = button.getAttribute('data-language') === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function toggleAccordion(header) {
    const content = header.nextElementSibling;
    if (!content) return;
    const open = content.classList.toggle('open');
    header.classList.toggle('open', open);
    header.setAttribute('aria-expanded', String(open));
    content.setAttribute('aria-hidden', String(!open));
  }

  function toggleDogCard(header) { toggleAccordion(header); }
  window.toggleAccordion = toggleAccordion;
  window.toggleDogCard = toggleDogCard;

  let zoom = 1;
  function setZoom(next) {
    zoom = Math.min(1.8, Math.max(0.65, next));
    const target = document.querySelector('.pedigree-tree, .pedigree-canvas, .pedigree-content');
    if (target) target.style.transform = `scale(${zoom})`;
    const viewport = document.querySelector('.pedigree-viewport');
    if (viewport) viewport.classList.toggle('zoomed', zoom !== 1);
  }
  window.zoomIn = () => setZoom(zoom + 0.1);
  window.zoomOut = () => setZoom(zoom - 0.1);
  window.resetView = () => setZoom(1);

  window.filterDogs = function (filter, button) {
    document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
    if (button) button.classList.add('active');
    document.querySelectorAll('[data-category], .dog-card-item[data-filter]').forEach((item) => {
      const category = item.dataset.category || item.dataset.filter || 'all';
      item.hidden = filter !== 'all' && category !== filter;
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    let saved = 'bg';
    try { saved = localStorage.getItem(storageKey) || 'bg'; } catch (_) {}
    applyLanguage(saved);

    document.querySelectorAll('[data-language]').forEach((button) => {
      button.addEventListener('click', () => applyLanguage(button.dataset.language));
    });

    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    let overlay = document.querySelector('.nav-overlay');
    const closeMenu = () => {
      if (!mobileBtn || !nav) return;
      mobileBtn.classList.remove('active'); nav.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (overlay) overlay.classList.remove('visible');
    };
    if (mobileBtn && nav) {
      if (!overlay) {
        overlay = document.createElement('div'); overlay.className = 'nav-overlay';
        overlay.setAttribute('aria-hidden', 'true'); document.body.appendChild(overlay);
      }
      mobileBtn.addEventListener('click', () => {
        const open = !nav.classList.contains('open');
        if (open) { nav.classList.add('open'); mobileBtn.classList.add('active'); overlay.classList.add('visible'); document.body.classList.add('menu-open'); }
        else closeMenu();
        mobileBtn.setAttribute('aria-expanded', String(open));
      });
      overlay.addEventListener('click', closeMenu);
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    }

    const header = document.querySelector('.header');
    const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const faders = document.querySelectorAll('.fade-up');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }), { threshold: 0.12 });
      faders.forEach((item) => observer.observe(item));
    } else faders.forEach((item) => item.classList.add('visible'));

    document.querySelectorAll('.accordion-header').forEach((headerItem) => {
      headerItem.setAttribute('role', 'button'); headerItem.setAttribute('tabindex', '0');
      headerItem.setAttribute('aria-expanded', 'false');
      headerItem.addEventListener('click', () => toggleAccordion(headerItem));
      headerItem.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleAccordion(headerItem); } });
    });

    const form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]'); if (!button) return;
      const original = button.textContent; button.disabled = true; button.textContent = 'Изпратено'; button.classList.add('is-sent');
      setTimeout(() => { form.reset(); button.disabled = false; button.textContent = original; button.classList.remove('is-sent'); }, 3000);
    });
  });
})();

// Backward-compatible alias for older page markup.
window.setLanguage = (lang) => document.dispatchEvent(new CustomEvent('pinscher-language', { detail: lang }));
document.addEventListener('pinscher-language', (event) => {
  const button = document.querySelector(`[data-language="${event.detail}"]`);
  if (button) button.click();
});
