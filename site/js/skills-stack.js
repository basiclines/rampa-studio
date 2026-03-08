/**
 * Skills Stack — Carousel animation for stacked terminal cards.
 * Cycles through skills: front card exits up, others shift forward.
 */
(function () {
  'use strict';

  var cards = [].slice.call(document.querySelectorAll('.skills-card'));
  var N = cards.length;
  if (N < 2) return;

  var INTERVAL = 4000;
  var EXIT_DUR = 350;
  var CARD_OFFSET_Y = 36;
  var EASE = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';

  // Position slots: back (0) → front (N-1)
  var positions = [];
  for (var i = 0; i < N; i++) {
    var t = i / (N - 1);
    positions.push({
      scale: 0.88 + 0.12 * t,
      y: i * CARD_OFFSET_Y,
      opacity: 0.35 + 0.65 * t,
      z: i + 1,
    });
  }

  // cardOrder[i] = card element at position i
  var cardOrder = cards.slice();

  function setPos(card, pos, animate) {
    card.style.transition = animate ? EASE : 'none';
    card.style.transform = 'translateX(-50%) scale(' + pos.scale + ') translateY(' + pos.y + 'px)';
    card.style.opacity = pos.opacity;
    card.style.zIndex = pos.z;
  }

  // Initialize
  for (var i = 0; i < N; i++) setPos(cardOrder[i], positions[i], false);

  function cycle() {
    var front = cardOrder.pop();

    // Exit: front card scales up slightly and fades out
    front.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
    front.style.transform = 'translateX(-50%) scale(1.03) translateY(' + (positions[N - 1].y - 10) + 'px)';
    front.style.opacity = '0';
    front.style.zIndex = N + 1;

    // Shift remaining cards forward one slot
    for (var i = 0; i < cardOrder.length; i++) {
      setPos(cardOrder[i], positions[i + 1], true);
    }

    // After exit, snap dismissed card to back (no transition)
    setTimeout(function () {
      setPos(front, positions[0], false);
      cardOrder.unshift(front);

      // Re-enable transitions after reflow
      requestAnimationFrame(function () {
        front.style.transition = EASE;
      });
    }, EXIT_DUR);
  }

  setInterval(cycle, INTERVAL);
})();
