/**
 * Main entry point
 * Coordinates global initialization.
 */

(function () {
  'use strict';

  // ---- Current Year in Footer ----
  var yearEls = document.querySelectorAll('.js-current-year');
  var currentYear = new Date().getFullYear();
  yearEls.forEach(function (el) {
    el.textContent = currentYear;
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Logo Image Handler ----
  // If an official logo image file is available at assets/logos/logo.png, display it and hide fallback
  var logoImgs = document.querySelectorAll('.site-logo-img');
  logoImgs.forEach(function (img) {
    // Test if image loaded successfully
    if (img.complete && img.naturalWidth > 0) {
      img.style.display = 'block';
      var fallback = img.parentElement.querySelector('.site-logo-fallback');
      if (fallback) fallback.style.display = 'none';
    } else {
      img.addEventListener('load', function () {
        img.style.display = 'block';
        var fallback = img.parentElement.querySelector('.site-logo-fallback');
        if (fallback) fallback.style.display = 'none';
      });
      img.addEventListener('error', function () {
        img.style.display = 'none';
        var fallback = img.parentElement.querySelector('.site-logo-fallback');
        if (fallback) fallback.style.display = 'inline-flex';
      });
    }
  });

})();
