/**
 * Components Module
 * Shared UI component utilities.
 * Handles accessible accordions, interactive widgets, and dynamic UI elements.
 */

(function () {
  'use strict';

  // ============================================
  // ACCORDION COMPONENT (A11y Compliant)
  // ============================================

  function initAccordions() {
    var accordionGroups = document.querySelectorAll('[data-accordion]');

    accordionGroups.forEach(function (group) {
      var isSingleOpen = group.getAttribute('data-accordion') !== 'multiple';
      var triggers = group.querySelectorAll('.accordion-trigger');

      triggers.forEach(function (trigger, index) {
        var panelId = trigger.getAttribute('aria-controls');
        var panel = document.getElementById(panelId);

        if (!panel) return;

        // Ensure initial accessibility attributes
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (!isExpanded) {
          panel.style.maxHeight = '0px';
          panel.setAttribute('hidden', '');
        } else {
          panel.removeAttribute('hidden');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }

        // Click / Touch Handler
        trigger.addEventListener('click', function () {
          var currentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

          if (isSingleOpen && !currentlyExpanded) {
            // Close other accordions in this group
            triggers.forEach(function (otherTrigger) {
              if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
                closeAccordionItem(otherTrigger);
              }
            });
          }

          if (currentlyExpanded) {
            closeAccordionItem(trigger);
          } else {
            openAccordionItem(trigger);
          }
        });

        // Keyboard Navigation (WAI-ARIA Accordion Pattern)
        trigger.addEventListener('keydown', function (e) {
          var targetIndex = -1;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            targetIndex = (index + 1) % triggers.length;
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            targetIndex = (index - 1 + triggers.length) % triggers.length;
          } else if (e.key === 'Home') {
            e.preventDefault();
            targetIndex = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            targetIndex = triggers.length - 1;
          }

          if (targetIndex !== -1 && triggers[targetIndex]) {
            triggers[targetIndex].focus();
          }
        });
      });
    });
  }

  function openAccordionItem(trigger) {
    var panelId = trigger.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);
    if (!panel) return;

    trigger.setAttribute('aria-expanded', 'true');
    var item = trigger.closest('.accordion-item');
    if (item) item.classList.add('is-open');

    panel.removeAttribute('hidden');
    // Allow browser to register removal of hidden before setting height for animation
    requestAnimationFrame(function () {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  }

  function closeAccordionItem(trigger) {
    var panelId = trigger.getAttribute('aria-controls');
    var panel = document.getElementById(panelId);
    if (!panel) return;

    trigger.setAttribute('aria-expanded', 'false');
    var item = trigger.closest('.accordion-item');
    if (item) item.classList.remove('is-open');

    panel.style.maxHeight = '0px';

    // After animation completes, set hidden attribute for screen readers
    setTimeout(function () {
      if (trigger.getAttribute('aria-expanded') === 'false') {
        panel.setAttribute('hidden', '');
      }
    }, 280);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordions);
  } else {
    initAccordions();
  }

})();
