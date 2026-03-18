/**
 * Jonesboro Tree Pros - Main JavaScript
 * Vanilla JS only. No external dependencies.
 * Handles all site interactivity for the static HTML site.
 *
 * Phone: (870) 555-0147 | tel:8705550147
 * Contact: /contact.html
 */
(function () {
  'use strict';

  // =========================================================================
  // 13. Utility: Throttle
  // =========================================================================
  function throttle(fn, wait) {
    var lastTime = 0;
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      var now = Date.now();
      var remaining = wait - (now - lastTime);
      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastTime = now;
        fn.apply(context, args);
      } else if (!timer) {
        timer = setTimeout(function () {
          lastTime = Date.now();
          timer = null;
          fn.apply(context, args);
        }, remaining);
      }
    };
  }

  // =========================================================================
  // 13. Utility: Debounce
  // =========================================================================
  function debounce(fn, wait, immediate) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      var callNow = immediate && !timer;
      clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        if (!immediate) {
          fn.apply(context, args);
        }
      }, wait);
      if (callNow) {
        fn.apply(context, args);
      }
    };
  }

  // =========================================================================
  // 1. Mobile Menu Toggle
  // =========================================================================
  function initMobileMenu() {
    var menuToggle = document.querySelector('.menu-toggle') || document.querySelector('.mobile-menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when a non-dropdown nav link is clicked (mobile)
    navLinks.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (
        link &&
        !link.closest('.dropdown') &&
        !link.closest('.nav-dropdown') &&
        !link.closest('.has-dropdown') &&
        window.innerWidth <= 768
      ) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // =========================================================================
  // 2. Mobile Dropdown Handling
  // =========================================================================
  function initMobileDropdowns() {
    // Support both .dropdown, .nav-dropdown, and .has-dropdown class conventions
    var dropdowns = document.querySelectorAll('.dropdown, .nav-dropdown, .has-dropdown');

    dropdowns.forEach(function (dropdown) {
      var dropdownLink = dropdown.querySelector(':scope > a');
      if (!dropdownLink) return;

      dropdownLink.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();

          // Close other open dropdowns
          dropdowns.forEach(function (other) {
            if (other !== dropdown) {
              other.classList.remove('active');
              // Reset chevron on other dropdowns
              var otherChevron = other.querySelector(':scope > a svg');
              if (otherChevron) {
                otherChevron.style.transform = '';
              }
            }
          });

          var isNowActive = dropdown.classList.toggle('active');

          // Also toggle .dropdown-menu child if present
          var submenu = dropdown.querySelector('.dropdown-menu');
          if (submenu) {
            submenu.classList.toggle('active', isNowActive);
          }

          // Rotate chevron icon if present
          var chevron = dropdownLink.querySelector('svg');
          if (chevron) {
            chevron.style.transform = isNowActive ? 'rotate(180deg)' : '';
          }
        }
      });
    });
  }

  // =========================================================================
  // 3. Smooth Scroll for Anchor Links
  // =========================================================================
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var header = document.querySelector('header, .header, .site-header');
      var headerOffset = header ? header.offsetHeight + 20 : 80;
      var targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      // Update URL hash without jump
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  }

  // =========================================================================
  // 4. Back to Top Button (dynamically created)
  // =========================================================================
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('title', 'Back to top');
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ' +
      'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="18 15 12 9 6 15"></polyline></svg>';

    // Inline styles for the button
    btn.style.cssText =
      'position:fixed;bottom:30px;right:30px;width:50px;height:50px;' +
      'border-radius:50%;background:#d97706;color:#fff;border:none;' +
      'cursor:pointer;z-index:999;display:flex;align-items:center;' +
      'justify-content:center;opacity:0;visibility:hidden;' +
      'transition:opacity 0.3s ease,visibility 0.3s ease,transform 0.3s ease;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.2);padding:0;';

    document.body.appendChild(btn);

    // Show/hide based on scroll position
    var handleScroll = throttle(function () {
      if (window.pageYOffset > 500) {
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Hover lift effect
    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'translateY(-3px)';
      btn.style.background = '#b45309';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translateY(0)';
      btn.style.background = '#d97706';
    });

    // Scroll to top on click
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 5. Header Scroll Behavior
  // =========================================================================
  function initHeaderScroll() {
    var header = document.querySelector('header, .header, .site-header');
    if (!header) return;

    var handleScroll = throttle(function () {
      if (window.pageYOffset > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    // Run on load in case page is already scrolled (e.g., refresh mid-page)
    handleScroll();
  }

  // =========================================================================
  // 6. Scroll-Triggered Animations (IntersectionObserver)
  // =========================================================================
  function initScrollAnimations() {
    // Auto-add .animate-on-scroll to common card and title elements
    var autoAnimateSelectors = [
      '.service-card',
      '.testimonial-card',
      '.location-card',
      '.section-title',
    ];

    autoAnimateSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        if (!el.classList.contains('animate-on-scroll')) {
          el.classList.add('animate-on-scroll');
        }
        // Stagger delays for cards in groups
        if (index % 3 === 1) el.classList.add('delay-1');
        if (index % 3 === 2) el.classList.add('delay-2');
      });
    });

    var animateElements = document.querySelectorAll('.animate-on-scroll');
    if (!animateElements.length) return;

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      animateElements.forEach(function (el) {
        el.classList.add('animated');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '-100px',
        threshold: 0,
      }
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================================================================
  // 7. FAQ Accordion
  // =========================================================================
  function initFaqAccordion() {
    var faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    /**
     * Smoothly collapses an element by animating its height to 0.
     */
    function slideUp(el, duration) {
      duration = duration || 300;
      el.style.overflow = 'hidden';
      el.style.height = el.scrollHeight + 'px';
      // Force reflow so the browser registers the starting height
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.transition = 'height ' + duration + 'ms ease';
      el.style.height = '0';
      setTimeout(function () {
        el.style.display = 'none';
        el.style.removeProperty('height');
        el.style.removeProperty('overflow');
        el.style.removeProperty('transition');
      }, duration);
    }

    /**
     * Smoothly expands a collapsed element by animating its height from 0.
     */
    function slideDown(el, duration) {
      duration = duration || 300;
      el.style.removeProperty('display');
      var display = window.getComputedStyle(el).display;
      if (display === 'none') {
        display = 'block';
      }
      el.style.display = display;
      var height = el.scrollHeight;
      el.style.overflow = 'hidden';
      el.style.height = '0';
      // Force reflow
      el.offsetHeight; // eslint-disable-line no-unused-expressions
      el.style.transition = 'height ' + duration + 'ms ease';
      el.style.height = height + 'px';
      setTimeout(function () {
        el.style.removeProperty('height');
        el.style.removeProperty('overflow');
        el.style.removeProperty('transition');
      }, duration);
    }

    faqQuestions.forEach(function (question) {
      var parentItem = question.closest('.faq-item') || question.parentElement;
      var answer = parentItem.querySelector('.faq-answer');

      // Set initial states
      var isInitiallyOpen = parentItem.classList.contains('active');
      question.setAttribute('aria-expanded', String(isInitiallyOpen));
      if (!isInitiallyOpen && answer) {
        answer.style.display = 'none';
      }

      // Click handler
      question.addEventListener('click', function () {
        var currentParent = question.closest('.faq-item') || question.parentElement;
        var currentAnswer = currentParent.querySelector('.faq-answer');
        var isOpen = currentParent.classList.contains('active');

        // Close all other FAQ items first (only one open at a time)
        faqQuestions.forEach(function (otherQuestion) {
          var otherParent =
            otherQuestion.closest('.faq-item') || otherQuestion.parentElement;
          var otherAnswer = otherParent.querySelector('.faq-answer');

          if (otherParent !== currentParent && otherParent.classList.contains('active')) {
            otherParent.classList.remove('active');
            otherQuestion.setAttribute('aria-expanded', 'false');
            if (otherAnswer) {
              slideUp(otherAnswer);
            }
          }
        });

        // Toggle the clicked item
        if (isOpen) {
          currentParent.classList.remove('active');
          question.setAttribute('aria-expanded', 'false');
          if (currentAnswer) {
            slideUp(currentAnswer);
          }
        } else {
          currentParent.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
          if (currentAnswer) {
            slideDown(currentAnswer);
          }
        }
      });
    });
  }

  // =========================================================================
  // 8. Form Enhancements
  // =========================================================================
  function initFormEnhancements() {
    var forms = document.querySelectorAll('form');
    if (!forms.length) return;

    forms.forEach(function (form) {
      var inputs = form.querySelectorAll('input, textarea, select');

      // ----- Focus / blur visual effects -----
      inputs.forEach(function (input) {
        input.addEventListener('focus', function () {
          var group =
            input.closest('.form-group') ||
            input.closest('.form-field') ||
            input.parentElement;
          if (group) {
            group.classList.add('focused');
          }
        });

        input.addEventListener('blur', function () {
          var group =
            input.closest('.form-group') ||
            input.closest('.form-field') ||
            input.parentElement;
          if (group) {
            group.classList.remove('focused');
            if (input.value.trim() !== '') {
              group.classList.add('filled');
            } else {
              group.classList.remove('filled');
            }
          }
        });

        // Clear error state on input
        input.addEventListener('input', function () {
          var group =
            input.closest('.form-group') ||
            input.closest('.form-field') ||
            input.parentElement;
          if (group) {
            group.classList.remove('error');
            var existingError = group.querySelector('.field-error');
            if (existingError) {
              existingError.remove();
            }
          }
          input.classList.remove('error');
        });
      });

      // ----- Required field validation on submit -----
      form.addEventListener('submit', function (e) {
        var isValid = true;
        var firstInvalid = null;

        // Remove previous error messages
        form.querySelectorAll('.field-error').forEach(function (el) {
          el.remove();
        });
        form.querySelectorAll('.error').forEach(function (el) {
          el.classList.remove('error');
        });

        var requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function (field) {
          var value = field.value.trim();
          var group =
            field.closest('.form-group') ||
            field.closest('.form-field') ||
            field.parentElement;

          // Empty check
          if (value === '') {
            isValid = false;
            field.classList.add('error');
            if (group) group.classList.add('error');

            var errorMsg = document.createElement('span');
            errorMsg.className = 'field-error';
            errorMsg.style.cssText =
              'color:#dc2626;font-size:0.85rem;display:block;margin-top:4px;';
            var label = group ? group.querySelector('label') : null;
            var fieldName = label
              ? label.textContent.replace('*', '').trim()
              : 'This field';
            errorMsg.textContent = fieldName + ' is required.';
            field.insertAdjacentElement('afterend', errorMsg);

            if (!firstInvalid) firstInvalid = field;
            return; // skip format checks if empty
          }

          // Email format check
          if (
            field.type === 'email' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ) {
            isValid = false;
            field.classList.add('error');
            if (group) group.classList.add('error');

            var emailErr = document.createElement('span');
            emailErr.className = 'field-error';
            emailErr.style.cssText =
              'color:#dc2626;font-size:0.85rem;display:block;margin-top:4px;';
            emailErr.textContent = 'Please enter a valid email address.';
            field.insertAdjacentElement('afterend', emailErr);

            if (!firstInvalid) firstInvalid = field;
          }

          // Phone format check
          if (
            field.type === 'tel' &&
            !/^[\d\s\-\(\)\+\.]{7,}$/.test(value)
          ) {
            isValid = false;
            field.classList.add('error');
            if (group) group.classList.add('error');

            var phoneErr = document.createElement('span');
            phoneErr.className = 'field-error';
            phoneErr.style.cssText =
              'color:#dc2626;font-size:0.85rem;display:block;margin-top:4px;';
            phoneErr.textContent = 'Please enter a valid phone number.';
            field.insertAdjacentElement('afterend', phoneErr);

            if (!firstInvalid) firstInvalid = field;
          }
        });

        if (!isValid) {
          e.preventDefault();
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });
  }

  // =========================================================================
  // 9. Lazy Loading Fallback
  // =========================================================================
  function initLazyLoadFallback() {
    // If the browser supports native lazy loading, no polyfill needed
    if ('loading' in HTMLImageElement.prototype) return;

    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (!lazyImages.length) return;

    if ('IntersectionObserver' in window) {
      var imageObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              img.removeAttribute('loading');
              imageObserver.unobserve(img);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );

      lazyImages.forEach(function (img) {
        imageObserver.observe(img);
      });
    } else {
      // Ultimate fallback: load all images immediately
      lazyImages.forEach(function (img) {
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      });
    }
  }

  // =========================================================================
  // 10. Phone Click Tracking (Google Analytics gtag)
  // =========================================================================
  function initPhoneTracking() {
    var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    if (!phoneLinks.length) return;

    phoneLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (typeof gtag === 'function') {
          gtag('event', 'click_to_call', {
            event_category: 'Contact',
            event_label: link.getAttribute('href').replace('tel:', ''),
            value: 1,
          });
        }
      });
    });
  }

  // =========================================================================
  // 11. Active Navigation Highlighting
  // =========================================================================
  function initActiveNav() {
    var currentPath = window.location.pathname;

    // Normalize trailing slash (keep "/" as-is)
    if (currentPath.length > 1 && currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
    }

    var navLinks = document.querySelectorAll(
      '.nav-links a, .nav-links .dropdown-menu a'
    );

    navLinks.forEach(function (link) {
      var linkHref = link.getAttribute('href');
      if (!linkHref) return;

      try {
        var resolved = new URL(linkHref, window.location.origin).pathname;
        if (resolved.length > 1 && resolved.endsWith('/')) {
          resolved = resolved.slice(0, -1);
        }

        // Exact match
        if (resolved === currentPath) {
          link.classList.add('active');
          // Highlight parent dropdown link too
          var parentDropdown = link.closest('.dropdown, .nav-dropdown, .has-dropdown');
          if (parentDropdown) {
            var parentLink = parentDropdown.querySelector(':scope > a');
            if (parentLink) parentLink.classList.add('active');
          }
          return;
        }

        // Section match (e.g., /services/* highlights the Services parent)
        if (
          resolved !== '/' &&
          currentPath.indexOf(resolved + '/') === 0
        ) {
          link.classList.add('active');
          var sectionDropdown = link.closest('.dropdown, .nav-dropdown, .has-dropdown');
          if (sectionDropdown) {
            var sectionLink = sectionDropdown.querySelector(':scope > a');
            if (sectionLink) sectionLink.classList.add('active');
          }
        }
      } catch (err) {
        // Skip malformed URLs
      }
    });
  }

  // =========================================================================
  // 12. Counter Animation
  // =========================================================================
  function initCounterAnimation() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      var duration = 2000; // 2 seconds
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var current = Math.floor(target * easeOutQuart(progress));

        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      counters.forEach(function (counter) {
        counter.textContent = '0';
        counterObserver.observe(counter);
      });
    } else {
      // Fallback: animate all immediately
      counters.forEach(function (counter) {
        animateCounter(counter);
      });
    }
  }

  // =========================================================================
  // Initialization - all modules
  // =========================================================================
  function init() {
    initMobileMenu();
    initMobileDropdowns();
    initSmoothScroll();
    initBackToTop();
    initHeaderScroll();
    initScrollAnimations();
    initFaqAccordion();
    initFormEnhancements();
    initLazyLoadFallback();
    initPhoneTracking();
    initActiveNav();
    initCounterAnimation();
  }

  // =========================================================================
  // DOM Ready
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already parsed (script loaded with defer or at end of body)
    init();
  }
})();
