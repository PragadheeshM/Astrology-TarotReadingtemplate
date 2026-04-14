/* ============================================
   THEME TOGGLE — Dark / Light Mode
   Persists preference in localStorage
   ============================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'astro-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcons(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function updateToggleIcons(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function(btn) {
      const icon = btn.querySelector('i');
      if (!icon) return;
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.title = 'Light Mode';
      } else {
        icon.className = 'fas fa-moon';
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.title = 'Dark Mode';
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // Apply theme immediately to prevent flash
  applyTheme(getPreferredTheme());

  // Bind toggle buttons after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    updateToggleIcons(getPreferredTheme());
    document.querySelectorAll('.theme-toggle').forEach(function(btn) {
      btn.addEventListener('click', toggleTheme);
    });
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
