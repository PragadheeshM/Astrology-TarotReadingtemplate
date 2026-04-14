/* ============================================
   MAIN.JS — Shared Logic Across All Pages
   Navigation, dropdowns, scroll, etc.
   ============================================ */

(function() {
  'use strict';

  /* ---------- Navbar Scroll Effect ---------- */
  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Dropdown Menus ---------- */
  function initDropdowns() {
    var dropdowns = document.querySelectorAll('.navbar__dropdown');
    
    dropdowns.forEach(function(dropdown) {
      var toggle = dropdown.querySelector('.navbar__dropdown-toggle');
      
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other dropdowns
        dropdowns.forEach(function(d) {
          if (d !== dropdown) d.classList.remove('open');
        });
        
        dropdown.classList.toggle('open');
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.navbar__dropdown')) {
        dropdowns.forEach(function(d) {
          d.classList.remove('open');
        });
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        dropdowns.forEach(function(d) {
          d.classList.remove('open');
        });
      }
    });
  }

  /* ---------- Mobile Menu ---------- */
  function initMobileMenu() {
    var hamburger = document.querySelector('.navbar__hamburger');
    var mobileMenu = document.querySelector('.navbar__mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      
      // CSS bars handle animation via aria-expanded state

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    var mobileLinks = mobileMenu.querySelectorAll('.navbar__mobile-link');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        // CSS bars handle close via aria-expanded
        document.body.style.overflow = '';
      });
    });

    // Mobile submenu toggles
    var mobileDropdowns = mobileMenu.querySelectorAll('.navbar__mobile-dropdown');
    mobileDropdowns.forEach(function(dropdown) {
      var toggle = dropdown.querySelector('.navbar__mobile-dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        });
      }
    });
  }

  /* ---------- Back to Top ---------- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Accordion ---------- */
  function initAccordions() {
    var accordions = document.querySelectorAll('.accordion__header');
    
    accordions.forEach(function(header) {
      header.addEventListener('click', function() {
        var item = header.closest('.accordion__item');
        var isOpen = item.classList.contains('open');
        
        // Close siblings (optional — remove for multi-open)
        var parent = item.parentElement;
        parent.querySelectorAll('.accordion__item').forEach(function(sibling) {
          sibling.classList.remove('open');
        });
        
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ---------- Form Validation ---------- */
  function initFormValidation() {
    var forms = document.querySelectorAll('[data-validate]');
    
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        var isValid = true;
        var inputs = form.querySelectorAll('[required]');
        
        inputs.forEach(function(input) {
          var errorEl = input.parentElement.querySelector('.form-error');
          
          if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--clr-error)';
            if (errorEl) errorEl.textContent = 'This field is required';
          } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            isValid = false;
            input.style.borderColor = 'var(--clr-error)';
            if (errorEl) errorEl.textContent = 'Please enter a valid email address';
          } else {
            input.style.borderColor = '';
            if (errorEl) errorEl.textContent = '';
          }
        });
        
        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  }

  /* ---------- Pricing Toggle (Monthly/Yearly) ---------- */
  function initPricingToggle() {
    var toggle = document.querySelector('.pricing-toggle');
    if (!toggle) return;

    var input = toggle.querySelector('input');
    var monthlyEls = document.querySelectorAll('[data-price="monthly"]');
    var yearlyEls = document.querySelectorAll('[data-price="yearly"]');

    if (!input) return;

    input.addEventListener('change', function() {
      var isYearly = input.checked;
      monthlyEls.forEach(function(el) { el.style.display = isYearly ? 'none' : ''; });
      yearlyEls.forEach(function(el) { el.style.display = isYearly ? '' : 'none'; });
    });
  }

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
          var top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- Active Nav Highlight ---------- */
  function highlightActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('.navbar__link, .navbar__dropdown-item');
    
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPage = href.split('/').pop();
      if (linkPage === currentPage) {
        link.classList.add('active');
        // If inside dropdown, also activate parent
        var dropdown = link.closest('.navbar__dropdown');
        if (dropdown) {
          var parentLink = dropdown.querySelector('.navbar__dropdown-toggle');
          if (parentLink) parentLink.classList.add('active');
        }
      }
    });

    // Also for mobile links
    var mobileLinks = document.querySelectorAll('.navbar__mobile-link');
    mobileLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPage = href.split('/').pop();
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ---------- Tab Functionality ---------- */
  function initTabs() {
    var tabGroups = document.querySelectorAll('[data-tabs]');
    tabGroups.forEach(function(group) {
      var tabs = group.querySelectorAll('[data-tab]');
      var panels = group.querySelectorAll('[data-tab-panel]');

      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          var target = tab.getAttribute('data-tab');
          tabs.forEach(function(t) { t.classList.remove('active'); });
          panels.forEach(function(p) { p.classList.remove('active'); });
          tab.classList.add('active');
          var targetPanel = group.querySelector('[data-tab-panel="' + target + '"]');
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    });
  }

  /* ---------- Filter Functionality ---------- */
  function initFilters() {
    var filterGroups = document.querySelectorAll('[data-filter-group]');
    filterGroups.forEach(function(group) {
      var buttons = group.querySelectorAll('[data-filter]');
      var targetSelector = group.getAttribute('data-filter-group');
      var items = document.querySelectorAll(targetSelector);

      buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var filter = btn.getAttribute('data-filter');
          buttons.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');

          items.forEach(function(item) {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
              item.style.display = '';
              item.style.opacity = '0';
              setTimeout(function() { item.style.opacity = '1'; }, 50);
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    });
  }

  /* ---------- Initialize Everything ---------- */
  document.addEventListener('DOMContentLoaded', function() {
    initNavbarScroll();
    initDropdowns();
    initMobileMenu();
    initBackToTop();
    initAccordions();
    initFormValidation();
    initPricingToggle();
    initSmoothScroll();
    highlightActiveNav();
    initTabs();
    initFilters();
  });
})();
