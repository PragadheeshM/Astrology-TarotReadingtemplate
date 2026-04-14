/* ============================================
   DASHBOARD.JS — Dashboard-specific Logic
   Sidebar toggle, notifications, dashboard interactions
   ============================================ */

(function() {
  'use strict';

  /* ---------- Sidebar Toggle (Mobile) ---------- */
  function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var hamburger = document.querySelector('.dash-header__hamburger');
    var closeBtn = document.querySelector('.sidebar__close');
    var overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (hamburger) {
      hamburger.addEventListener('click', openSidebar);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSidebar);
    }
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });
  }

  /* ---------- Active Sidebar Link ---------- */
  function highlightSidebarLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.sidebar__link');
    
    links.forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPage = href.split('/').pop();
      if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Notification Dropdown ---------- */
  function initNotifications() {
    var notifBtn = document.querySelector('.dash-header__notif-btn');
    var notifDropdown = document.querySelector('.dash-notif-dropdown');
    if (!notifBtn || !notifDropdown) return;

    notifBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dash-notif-dropdown') && !e.target.closest('.dash-header__notif-btn')) {
        notifDropdown.classList.remove('open');
      }
    });
  }

  /* ---------- Counter Animation ---------- */
  function animateCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(function(counter) {
      var target = parseInt(counter.getAttribute('data-counter'));
      var prefix = counter.getAttribute('data-prefix') || '';
      var suffix = counter.getAttribute('data-suffix') || '';
      var duration = 1500;
      var start = 0;
      var startTime = null;
      var isAnimated = false;

      function update(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = Math.floor(eased * target);
        counter.textContent = prefix + current.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !isAnimated) {
          isAnimated = true;
          requestAnimationFrame(update);
        }
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  /* ---------- Tab Switching in Dashboard ---------- */
  function initDashTabs() {
    var tabBtns = document.querySelectorAll('[data-dash-tab]');
    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = btn.closest('[data-dash-tabs]');
        if (!group) return;
        var target = btn.getAttribute('data-dash-tab');
        
        group.querySelectorAll('[data-dash-tab]').forEach(function(b) {
          b.classList.remove('active');
        });
        group.querySelectorAll('[data-dash-panel]').forEach(function(p) {
          p.style.display = 'none';
        });
        
        btn.classList.add('active');
        var targetPanel = group.querySelector('[data-dash-panel="' + target + '"]');
        if (targetPanel) targetPanel.style.display = '';
      });
    });
  }

  /* ---------- Select All Checkbox ---------- */
  function initSelectAll() {
    var selectAll = document.querySelectorAll('[data-select-all]');
    selectAll.forEach(function(checkbox) {
      var targetSelector = checkbox.getAttribute('data-select-all');
      checkbox.addEventListener('change', function() {
        var checkboxes = document.querySelectorAll(targetSelector);
        checkboxes.forEach(function(cb) {
          cb.checked = checkbox.checked;
        });
      });
    });
  }

  /* ---------- Init Dashboard ---------- */
  document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    highlightSidebarLink();
    initNotifications();
    animateCounters();
    initDashTabs();
    initSelectAll();
  });

})();
