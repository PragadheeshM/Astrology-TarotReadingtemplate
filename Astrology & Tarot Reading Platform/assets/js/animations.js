/* ============================================
   SCROLL ANIMATIONS & ANIMATED COUNTERS
   ============================================ */

(function() {
  'use strict';

  /* ---------- Scroll Reveal ---------- */
  function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(function() {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ---------- Animated Counters ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.floor(easedProgress * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ---------- Parallax (subtle) ---------- */
  function initParallax() {
    var parallaxBgs = document.querySelectorAll('[data-parallax]');
    if (!parallaxBgs.length) return;

    window.addEventListener('scroll', function() {
      var scrollTop = window.pageYOffset;
      parallaxBgs.forEach(function(el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
        var rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var offset = scrollTop * speed;
          el.style.transform = 'translateY(' + offset + 'px)';
        }
      });
    }, { passive: true });
  }

  /* ---------- Staggered children animation ---------- */
  function initStaggered() {
    var groups = document.querySelectorAll('[data-stagger]');
    if (!groups.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var children = entry.target.children;
          var delay = parseInt(entry.target.getAttribute('data-stagger')) || 100;
          Array.from(children).forEach(function(child, i) {
            setTimeout(function() {
              child.classList.add('visible');
            }, i * delay);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    groups.forEach(function(el) {
      observer.observe(el);
    });
  }

  /* ---------- Init All ---------- */
  document.addEventListener('DOMContentLoaded', function() {
    initScrollReveal();
    initCounters();
    initParallax();
    initStaggered();
  });
})();
