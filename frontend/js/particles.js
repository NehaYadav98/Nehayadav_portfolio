/* ═══════════════════════════════════════════════════════════════
   PARTICLES.JS — Background particle field + cursor trail
═══════════════════════════════════════════════════════════════ */

(function initParticles() {

  /* ── BACKGROUND PARTICLES ─────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let animFrame;

  // Config
  const CONFIG = {
    count:       80,
    maxRadius:   2.2,
    minRadius:   0.4,
    speed:       0.25,
    opacity:     0.5,
    colors:      ['#06b6d4', '#7c3aed', '#a78bfa', '#67e8f9'],
    connectDist: 130,
    connectAlpha: 0.08,
  };

  let particles = [];
  let mouse     = { x: -999, y: -999 };

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      this.r  = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.alpha = 0.15 + Math.random() * CONFIG.opacity;
      this.originalAlpha = this.alpha;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = 120;

      if (dist < repelRadius && dist > 0) {
        const force = (repelRadius - dist) / repelRadius;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
        this.alpha = Math.min(1, this.originalAlpha + force * 0.5);
      } else {
        this.alpha += (this.originalAlpha - this.alpha) * 0.05;
      }

      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.fill();
    }
  }

  function initCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawnParticles() {
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          const alpha = CONFIG.connectAlpha * (1 - dist / CONFIG.connectDist);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#7c3aed';
          ctx.globalAlpha = alpha;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);

    drawConnections();

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(loop);
  }

  // Init
  initCanvas();
  spawnParticles();
  loop();

  // Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animFrame);
      initCanvas();
      spawnParticles();
      loop();
    }, 200);
  });

  // Track mouse for repulsion
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });


  /* ── CURSOR SYSTEM ─────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;

  let dotPos  = { x: 0, y: 0 };
  let ringPos = { x: 0, y: 0 };
  let dotTarget  = { x: 0, y: 0 };
  let ringTarget = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    dotTarget.x  = e.clientX;
    dotTarget.y  = e.clientY;
    ringTarget.x = e.clientX;
    ringTarget.y = e.clientY;
  });

  function animateCursor() {
    // Dot — snappy
    dotPos.x += (dotTarget.x - dotPos.x) * 0.85;
    dotPos.y += (dotTarget.y - dotPos.y) * 0.85;

    // Ring — laggy follow
    ringPos.x += (ringTarget.x - ringPos.x) * 0.12;
    ringPos.y += (ringTarget.y - ringPos.y) * 0.12;

    dot.style.left  = dotPos.x + 'px';
    dot.style.top   = dotPos.y + 'px';
    ring.style.left = ringPos.x + 'px';
    ring.style.top  = ringPos.y + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });


  /* ── CURSOR TRAIL SPARKS ───────────────────────────────────── */
  const trailCanvas  = document.createElement('canvas');
  trailCanvas.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    pointer-events: none;
  `;
  document.body.appendChild(trailCanvas);

  const tCtx = trailCanvas.getContext('2d');
  let tW = 0, tH = 0;
  let sparks = [];

  function resizeTrail() {
    tW = trailCanvas.width  = window.innerWidth;
    tH = trailCanvas.height = window.innerHeight;
  }

  resizeTrail();
  window.addEventListener('resize', resizeTrail);

  class Spark {
    constructor(x, y) {
      this.x  = x;
      this.y  = y;
      this.vx = (Math.random() - 0.5) * 2.5;
      this.vy = (Math.random() - 0.5) * 2.5 - 1.5;
      this.life  = 1;
      this.decay = 0.04 + Math.random() * 0.04;
      this.r     = 1.5 + Math.random() * 1.5;
      this.color = Math.random() > 0.5 ? '#06b6d4' : '#7c3aed';
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.vy   += 0.08;
      this.life -= this.decay;
      this.r    *= 0.97;
    }

    draw() {
      tCtx.beginPath();
      tCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      tCtx.globalAlpha = this.life * 0.6;
      tCtx.fillStyle   = this.color;
      tCtx.fill();
    }
  }

  let lastTrailX = 0, lastTrailY = 0;

  window.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastTrailX;
    const dy = e.clientY - lastTrailY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    if (speed > 6) {
      const count = Math.min(Math.floor(speed / 5), 4);
      for (let i = 0; i < count; i++) {
        sparks.push(new Spark(e.clientX, e.clientY));
      }
      lastTrailX = e.clientX;
      lastTrailY = e.clientY;
    }
  });

  function trailLoop() {
    tCtx.clearRect(0, 0, tW, tH);
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => { s.update(); s.draw(); });
    tCtx.globalAlpha = 1;
    requestAnimationFrame(trailLoop);
  }

  trailLoop();

})();