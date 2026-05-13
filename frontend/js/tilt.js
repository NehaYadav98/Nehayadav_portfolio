/* ═══════════════════════════════════════════════════════════════
   TILT.JS — 3D perspective tilt for cards on mouse move
═══════════════════════════════════════════════════════════════ */

(function initTilt() {
  'use strict';

  const TILT_CONFIG = {
    maxTilt:    8,       // degrees
    scale:      1.02,
    speed:      500,     // ms transition
    glare:      true,
    maxGlare:   0.12,
    perspective: 900,
  };

  class TiltCard {
    constructor(el, config = {}) {
      this.el     = el;
      this.cfg    = { ...TILT_CONFIG, ...config };
      this.glareEl = null;

      if (this.cfg.glare) this._initGlare();
      this._bind();
    }

    _initGlare() {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        position: absolute; inset: 0; overflow: hidden;
        border-radius: inherit; pointer-events: none; z-index: 10;
      `;

      this.glareEl = document.createElement('div');
      this.glareEl.style.cssText = `
        position: absolute;
        width: 200%; height: 200%;
        top: -50%; left: -50%;
        background: radial-gradient(ellipse at center,
          rgba(255,255,255,${this.cfg.maxGlare}) 0%,
          transparent 70%);
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        transform-origin: center;
      `;

      wrap.appendChild(this.glareEl);
      this.el.style.position = 'relative';
      this.el.appendChild(wrap);
    }

    _bind() {
      this._onMove  = this._onMove.bind(this);
      this._onLeave = this._onLeave.bind(this);

      this.el.addEventListener('mousemove',  this._onMove);
      this.el.addEventListener('mouseleave', this._onLeave);

      this.el.style.transition = `transform ${this.cfg.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
      this.el.style.willChange = 'transform';
    }

    _onMove(e) {
      const rect = this.el.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;

      const pctX = (x / rect.width)  - 0.5;  // -0.5 to 0.5
      const pctY = (y / rect.height) - 0.5;

      const rotX = -pctY * this.cfg.maxTilt;
      const rotY =  pctX * this.cfg.maxTilt;

      this.el.style.transform = `
        perspective(${this.cfg.perspective}px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        scale3d(${this.cfg.scale}, ${this.cfg.scale}, ${this.cfg.scale})
      `;

      if (this.glareEl) {
        const glareX = pctX * 100 + 50;
        const glareY = pctY * 100 + 50;
        this.glareEl.style.opacity = '1';
        this.glareEl.style.transform = `translate(${glareX - 50}%, ${glareY - 50}%)`;
      }
    }

    _onLeave() {
      this.el.style.transition = `transform ${this.cfg.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
      this.el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

      if (this.glareEl) {
        this.glareEl.style.opacity = '0';
      }
    }

    destroy() {
      this.el.removeEventListener('mousemove',  this._onMove);
      this.el.removeEventListener('mouseleave', this._onLeave);
    }
  }

  /* ── Apply tilt to cards ─────────────────────────────────── */
  function applyTilt() {
    // Skills category cards
    document.querySelectorAll('.skills-category').forEach(el => {
      new TiltCard(el, { maxTilt: 5, glare: false });
    });

    // Timeline cards
    document.querySelectorAll('.tl-content').forEach(el => {
      new TiltCard(el, { maxTilt: 4, scale: 1.01, glare: false });
    });

    // Contact links
    document.querySelectorAll('.contact-link').forEach(el => {
      new TiltCard(el, { maxTilt: 3, scale: 1.01, glare: false });
    });
  }

  // Apply after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTilt);
  } else {
    applyTilt();
  }

  // Export for external use
  window.TiltCard = TiltCard;

})();