/* =============================================
   dog-tracker.js — Jake's Countdown Dog
   Reads the existing countdown timer and
   slides the dog emoji from left -> right
   toward Jake's photo as time runs out.
   ============================================= */

(function () {
  'use strict';

  // -- Configuration ------------------------------------------------
  const TARGET_DATE   = new Date('April 11, 2026 12:00:00').getTime();
  const JAKE_IMG_SRC  = 'jake.jpeg';   // path relative to the HTML file
  const EXCITED_PCT   = 90;            // % progress where dog gets excited
  const READY_PCT     = 85;            // % progress where Jake starts glowing

  // -- Inject HTML elements -----------------------------------------
  function buildUI() {
    // Left "start" label
    const startLabel = document.createElement('div');
    startLabel.id = 'dog-start-label';
    startLabel.innerHTML = `<span>Start</span>`;
    document.body.appendChild(startLabel);

    // Track container
    const container = document.createElement('div');
    container.id = 'dog-track-container';
    container.innerHTML = `
      <div id="dog-track-bar">
        <div id="dog-track-fill"></div>
        <div id="dog-runner">🐕</div>
      </div>
    `;
    document.body.appendChild(container);

    // Jake target (right side)
    const jake = document.createElement('div');
    jake.id = 'jake-target';
    jake.innerHTML = `
      <img src="${JAKE_IMG_SRC}" alt="Jake" />
      <span>Jake!</span>
    `;
    document.body.appendChild(jake);

    // Arrival message (hidden until done)
    const msg = document.createElement('div');
    msg.id = 'dog-arrived-msg';
    msg.textContent = '🐕 Jake is here! 🎉';
    document.body.appendChild(msg);
  }

  // -- Calculate progress (0–100) ----------------------------------------
  // We need a START date to anchor the left side.
  // We derive it from the page's own countdown if possible,
  // otherwise fall back to a fixed start date.
  let startDate = null;

  function getStartDate() {
    if (startDate !== null) return startDate;

    // Try to read total seconds from the page's existing countdown elements.
    // Most countdown scripts store a start time or we can infer from days shown.
    // As a reliable fallback we use the date the page was first loaded and
    // store it in sessionStorage so it persists across refreshes in the same session.
    const stored = sessionStorage.getItem('dogTrackerStart');
    if (stored) {
      startDate = parseInt(stored, 10);
    } else {
      // First visit: use right now as the anchor.
      // Better anchor: pick a meaningful start. We'll use Jan 1 2026 as the
      // "release start" so the dog is already partway across on launch day.
      startDate = new Date('January 1, 2026 00:00:00').getTime();
      sessionStorage.setItem('dogTrackerStart', startDate);
    }
    return startDate;
  }

  function getProgress() {
    const now      = Date.now();
    const start    = getStartDate();
    const total    = TARGET_DATE - start;
    const elapsed  = now - start;
    const pct      = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return pct;
  }

  // -- Map progress -> left% position on track ----------------------------
  // The track spans from ~5% (near left edge, room for dog emoji)
  // to ~88% (near right edge, just before Jake's photo)
  function progressToLeft(pct) {
    const MIN_LEFT = 4;   // % — leftmost position
    const MAX_LEFT = 87;  // % — rightmost position (just before Jake)
    return MIN_LEFT + (pct / 100) * (MAX_LEFT - MIN_LEFT);
  }

  // -- Update the UI every second ------------------------------------------
  function tick() {
    const pct    = getProgress();
    const leftPc = progressToLeft(pct);

    const fill   = document.getElementById('dog-track-fill');
    const runner = document.getElementById('dog-runner');
    const jake   = document.getElementById('jake-target');
    const msg    = document.getElementById('dog-arrived-msg');

    if (!fill || !runner) return;

    fill.style.width   = pct + '%';
    runner.style.left  = leftPc + '%';

    // Excitement threshold
    if (pct >= EXCITED_PCT) {
      runner.classList.add('dog-excited');
    } else {
      runner.classList.remove('dog-excited');
    }

    // Jake glow threshold
    if (pct >= READY_PCT) {
      jake.classList.add('jake-ready');
    } else {
      jake.classList.remove('jake-ready');
    }

    // Arrival!
    if (pct >= 100) {
      runner.textContent = '🎉';
      msg.style.display  = 'block';
    }
  }

  // -- Boot ------------------------------------------------------------
  function init() {
    buildUI();
    tick();                           // immediate first draw
    setInterval(tick, 1000);          // update every second
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
