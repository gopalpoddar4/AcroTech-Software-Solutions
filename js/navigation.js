/**
 * Navigation Module
 * Handles mobile hamburger menu, active page states, overlay, keyboard support
 */

(function () {
  'use strict';

  // ---- DOM Elements ----
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const body = document.body;

  // ---- State ----
  let isMenuOpen = false;

  // ---- Mobile Menu Toggle ----

  function openMenu() {
    if (isMenuOpen) return;
    isMenuOpen = true;

    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    mobileOverlay.classList.add('is-visible');
    body.style.overflow = 'hidden';

    // Focus the first link after the menu animates open
    requestAnimationFrame(function () {
      const firstLink = mobileNav.querySelector('.mobile-nav-link');
      if (firstLink) firstLink.focus();
    });
  }

  function closeMenu() {
    if (!isMenuOpen) return;
    isMenuOpen = false;

    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    mobileOverlay.classList.remove('is-visible');
    body.style.overflow = '';

    // Return focus to hamburger
    hamburgerBtn.focus();
  }

  function toggleMenu() {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // ---- Event Listeners ----

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMenu);
  }

  // Close on overlay click
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMenu);
  }

  // Close on nav link click
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  // Close on window resize past mobile breakpoint
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        closeMenu();
      }
    }, 100);
  });

  // ---- Active Page Indicator ----

  function setActiveNavLink() {
    // Get current page filename
    var path = window.location.pathname;

    // Determine the "page key" from the URL
    var pageKey = '';
    if (path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html')) {
      pageKey = 'home';
    } else if (path.includes('/about')) {
      pageKey = 'about';
    } else if (path.includes('/services')) {
      pageKey = 'services';
    } else if (path.includes('/career')) {
      pageKey = 'career';
    }

    // Apply active class to desktop nav
    desktopNavLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === pageKey) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Apply active class to mobile nav
    mobileNavLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === pageKey) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  setActiveNavLink();

  // ---- Trap focus inside mobile nav when open ----

  document.addEventListener('keydown', function (e) {
    if (!isMenuOpen || e.key !== 'Tab') return;

    var focusableElements = mobileNav.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    var firstEl = hamburgerBtn;
    var lastEl = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });

})();
