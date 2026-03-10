var INSTALL_CMDS = [
  'npm install -g @basiclines/rampa',
  'bun add -g @basiclines/rampa',
  'brew install basiclines/tap/rampa',
];
var installIdx = 0;

function copyInstallCmd(button) {
  copyToClipboard(INSTALL_CMDS[installIdx], button);
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(function () {
    var copy = button.querySelector('[data-select="copy"]');
    var success = button.querySelector('[data-select="success"]');
    if (copy && success) {
      success.classList.toggle("hidden")
      copy.classList.toggle("hidden")
      setTimeout(function () {
        copy.classList.toggle("hidden")
        success.classList.toggle("hidden")
      }, 2000);
    }
  });
}

// Rotate install commands with typing effect
(function rotateInstall() {
  var el = document.getElementById('install-cmd');
  if (!el) return;
  var DELAY = 12000;
  var CHAR_MS = 15;

  function eraseAndType() {
    var oldText = INSTALL_CMDS[installIdx];
    installIdx = (installIdx + 1) % INSTALL_CMDS.length;
    var newText = INSTALL_CMDS[installIdx];

    var i = oldText.length;
    function eraseChar() {
      if (i <= 0) { typeChar(0); return; }
      i--;
      el.textContent = oldText.slice(0, i);
      setTimeout(eraseChar, CHAR_MS / 2);
    }
    function typeChar(j) {
      if (j > newText.length) { setTimeout(eraseAndType, DELAY); return; }
      el.textContent = newText.slice(0, j);
      setTimeout(function () { typeChar(j + 1); }, CHAR_MS);
    }
    eraseChar();
  }

  setTimeout(eraseAndType, DELAY);
})();

// CTA tab switching (Get Started section)
(function initCtaTabs() {
  var tabs = document.querySelectorAll('[data-cta-tab]');
  var cliPanel = document.getElementById('cta-cli');
  var sdkPanel = document.getElementById('cta-sdk');
  if (!tabs.length || !cliPanel || !sdkPanel) return;

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = btn.dataset.ctaTab;
      tabs.forEach(function (b) {
        b.classList.toggle('demo-tab-active', b.dataset.ctaTab === tab);
      });
      cliPanel.style.display = tab === 'cli' ? 'grid' : 'none';
      sdkPanel.style.display = tab === 'sdk' ? 'grid' : 'none';
    });
  });
})();
