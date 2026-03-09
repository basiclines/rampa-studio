// Dynamic favicon: isometric cube that cycles through theme anchor colors
(function () {
  var SIZE = 32;
  var canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  var ctx = canvas.getContext('2d');

  // Create or reuse <link rel="icon">
  var link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }

  var colorIndex = 0;

  function getAnchors() {
    var fb = ['#ef4444', '#22c55e', '#3b82f6', '#06b6d4', '#a855f7', '#eab308'];
    var src = (window.RampaTheme && window.RampaTheme.defaults) || null;
    if (!src) return fb;
    return [src.red, src.green, src.blue, src.cyan, src.magenta, src.yellow];
  }

  function shade(hex, factor) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.round(r * factor));
    g = Math.min(255, Math.round(g * factor));
    b = Math.min(255, Math.round(b * factor));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function drawCube(color) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    var cx = SIZE / 2;
    var cy = SIZE / 2;
    var s = SIZE * 0.38;

    var dx = s * Math.cos(Math.PI / 6);
    var dy = s * Math.sin(Math.PI / 6);

    var top    = [cx, cy - s];
    var right  = [cx + dx, cy - s + dy];
    var botR   = [cx + dx, cy + dy];
    var bottom = [cx, cy + s];
    var botL   = [cx - dx, cy + dy];
    var left   = [cx - dx, cy - s + dy];
    var center = [cx, cy];

    // Top face (lightest)
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    ctx.lineTo(right[0], right[1]);
    ctx.lineTo(center[0], center[1]);
    ctx.lineTo(left[0], left[1]);
    ctx.closePath();
    ctx.fillStyle = shade(color, 1.3);
    ctx.fill();

    // Left face (mid)
    ctx.beginPath();
    ctx.moveTo(left[0], left[1]);
    ctx.lineTo(center[0], center[1]);
    ctx.lineTo(bottom[0], bottom[1]);
    ctx.lineTo(botL[0], botL[1]);
    ctx.closePath();
    ctx.fillStyle = shade(color, 0.85);
    ctx.fill();

    // Right face (darkest)
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    ctx.lineTo(right[0], right[1]);
    ctx.lineTo(botR[0], botR[1]);
    ctx.lineTo(bottom[0], bottom[1]);
    ctx.closePath();
    ctx.fillStyle = shade(color, 0.6);
    ctx.fill();
  }

  // Called by hero-cubes.js on each rotation cycle / click wave
  // Pass a hex color to set it directly, or omit to cycle through anchors
  window.updateFavicon = function (hex) {
    var color;
    if (hex) {
      color = hex;
    } else {
      var anchors = getAnchors();
      color = anchors[colorIndex % anchors.length];
      colorIndex++;
    }
    drawCube(color);
    link.href = canvas.toDataURL('image/png');
  };

  // Initial draw
  window.updateFavicon();
})();
