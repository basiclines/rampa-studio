(function () {
  var overlay = document.getElementById('credits-overlay');
  var scroll = document.getElementById('credits-scroll');
  var trigger = document.getElementById('credits-trigger');
  var closeBtn = document.getElementById('credits-close');

  if (!overlay || !scroll || !trigger) return;

  var SPEED = 50; // pixels per second
  var animId = null;
  var startTime = 0;
  var offset = 0;

  function startScroll() {
    // Reset position to below viewport
    offset = 0;
    scroll.style.transform = 'translateY(0)';
    startTime = performance.now();
    animId = requestAnimationFrame(tick);
  }

  function tick(now) {
    var elapsed = (now - startTime) / 1000;
    offset = elapsed * SPEED;
    scroll.style.transform = 'translateY(-' + offset + 'px)';

    // Stop when all content has scrolled past the top
    var scrollHeight = scroll.offsetHeight;
    var viewportHeight = overlay.offsetHeight;
    if (offset > scrollHeight + viewportHeight * 0.2) {
      close();
      return;
    }

    animId = requestAnimationFrame(tick);
  }

  function open() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Small delay so the fade-in is visible before scroll starts
    setTimeout(startScroll, 600);
  }

  function close() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    open();
  });

  closeBtn.addEventListener('click', close);

  // Esc key to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      close();
    }
  });
})();
