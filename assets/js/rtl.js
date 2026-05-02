/* ============================================
   RTL / LTR TOGGLE — Globe Icon
   Persists preference in localStorage
   ============================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'astro-direction';

  function getPreferredDir() {
    return localStorage.getItem(STORAGE_KEY) || 'ltr';
  }

  function applyDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem(STORAGE_KEY, dir);
    updateToggleState(dir);
  }

  function updateToggleState(dir) {
    const toggles = document.querySelectorAll('.rtl-toggle');
    toggles.forEach(function(btn) {
      const textSpan = btn.querySelector('span');
      if (dir === 'rtl') {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Switch to LTR layout');
        btn.title = 'Switch to LTR';
        if (textSpan) textSpan.textContent = 'LTR';
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Switch to RTL layout');
        btn.title = 'Switch to RTL';
        if (textSpan) textSpan.textContent = 'RTL';
      }
    });
  }

  function toggleDirection() {
    var current = document.documentElement.getAttribute('dir') || 'ltr';
    var next = current === 'rtl' ? 'ltr' : 'rtl';
    applyDirection(next);
  }

  // Apply direction immediately
  applyDirection(getPreferredDir());

  // Bind toggle buttons after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    updateToggleState(getPreferredDir());
    document.querySelectorAll('.rtl-toggle').forEach(function(btn) {
      btn.addEventListener('click', toggleDirection);
    });
  });
})();
