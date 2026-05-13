/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER.JS — Hero role cycling animation
═══════════════════════════════════════════════════════════════ */

(function initTypewriter() {
  const el = document.getElementById('typewriterEl');
  if (!el) return;

  const phrases = [
    'beautiful interfaces',
    'delightful UX',
    'AI-powered apps',
    'scalable frontends',
    'creative experiences',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let isPaused    = false;

  // Timings (ms)
  const TYPE_SPEED   = 60;
  const DELETE_SPEED = 35;
  const PAUSE_AFTER  = 1800;
  const PAUSE_BEFORE = 300;

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Finished typing — pause then start deleting
        if (isPaused) return;
        isPaused = true;
        setTimeout(() => {
          isPaused   = false;
          isDeleting = true;
          schedule();
        }, PAUSE_AFTER);
        return;
      }
    } else {
      // Deleting
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(() => schedule(), PAUSE_BEFORE);
        return;
      }
    }

    schedule();
  }

  function schedule() {
    const delay = isDeleting ? DELETE_SPEED : TYPE_SPEED;
    // Slight variance for realism
    const jitter = Math.random() * 20 - 10;
    setTimeout(tick, delay + jitter);
  }

  // Kick off after hero entry animation completes
  setTimeout(schedule, 900);
})();