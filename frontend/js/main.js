/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Core interactions, scroll effects, navbar
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── HERO ENTRY ANIMATION ────────────────────────────────── */
  // Ensure browser has performed layout/first-paint before starting animations.
  // Use requestAnimationFrame twice to yield to the compositor (robust across fast prod bundles).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const hero = document.querySelector('.hero');
      if (hero) hero.classList.add('hero-loaded');
    });
  });


  /* ── NAVBAR SCROLL BEHAVIOR ──────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });


  /* ── HAMBURGER MENU ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');

  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });

  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => navMobile.classList.remove('open'));
  });


  /* ── SMOOTH SCROLL FOR NAV LINKS ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── SCROLL REVEAL (Intersection Observer) ───────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
    .forEach(el => revealObserver.observe(el));


  /* ── SKILL BAR FILL (on scroll into view) ────────────────── */
  const skillBarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.dataset.width;
          fill.style.width = width + '%';
          fill.classList.add('animate');
          skillBarObserver.unobserve(fill);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.skill-bar-fill')
    .forEach(el => skillBarObserver.observe(el));


  /* ── COUNTER ANIMATION ───────────────────────────────────── */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe counters, and also immediately trigger any counters already inside the viewport
  document.querySelectorAll('.counter').forEach(el => {
    counterObserver.observe(el);

    // If the element is already above-the-fold (fast prod loads), animate immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      // Prevent duplicate observer callback.
      counterObserver.unobserve(el);
      animateCounter(el);
    }
  });

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  }


  /* ── PROJECT FILTER TABS ─────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active btn
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
          return;
        }

        const categories = card.dataset.category.split(' ');
        if (categories.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  /* ── CONTACT FORM ─────────────────────────────────────────── */
  const formSubmit = document.getElementById('formSubmit');
  const formSuccess = document.getElementById('formSuccess');

  if (formSubmit) {
    formSubmit.addEventListener('click', (e) => {
      e.preventDefault();

      const name    = document.getElementById('formName').value.trim();
      const email   = document.getElementById('formEmail').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      if (!name || !email || !message) {
        // Simple shake animation
        formSubmit.style.animation = 'none';
        formSubmit.offsetHeight; // reflow
        formSubmit.style.animation = 'shake 0.4s ease';
        return;
      }

      // Simulate submit
      formSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      formSubmit.disabled = true;

      setTimeout(() => {
        formSuccess.classList.add('visible');
        formSubmit.innerHTML = '<span>Send Message</span><i class="fa-solid fa-paper-plane"></i>';
        formSubmit.disabled = false;

        // Reset fields
        ['formName', 'formEmail', 'formSubject', 'formMessage'].forEach(id => {
          document.getElementById(id).value = '';
        });

        setTimeout(() => formSuccess.classList.remove('visible'), 4000);
      }, 1200);
    });
  }


  /* ── MAGNETIC BUTTON EFFECT ───────────────────────────────── */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect  = btn.getBoundingClientRect();
      const x     = e.clientX - rect.left - rect.width / 2;
      const y     = e.clientY - rect.top  - rect.height / 2;
      const power = 0.3;
      btn.style.transform = `translate(${x * power}px, ${y * power}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  /* ── TILT EFFECT (Profile card) ───────────────────────────── */
  const profileCard = document.getElementById('profileCard');

  if (profileCard) {
    profileCard.addEventListener('mousemove', (e) => {
      const rect = profileCard.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const maxTilt = 8;

      profileCard.style.transform =
        `perspective(800px) rotateY(${dx * maxTilt}deg) rotateX(${-dy * maxTilt}deg) scale(1.02)`;
    });

    profileCard.addEventListener('mouseleave', () => {
      profileCard.style.transform = '';
    });
  }


  /* ── CURSOR HOVER DETECTION ───────────────────────────────── */
  const interactives = 'a, button, .pill, .filter-btn, .suggestion-btn, .flip-card, .profile-card, .tl-content';

  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });


  /* ── ACTIVE NAV HIGHLIGHT ON SCROLL ──────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active-link',
              link.getAttribute('href') === '#' + id
            );
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach(s => sectionObserver.observe(s));

});