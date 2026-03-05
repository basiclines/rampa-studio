// ==========================================
// Read anchor colors from Rampa theme (or fallback)
// ==========================================
const THEME = (window.RampaTheme && window.RampaTheme.defaults) || {
  foreground: '#0a0a0a',
  background: '#fafafa',
  red:     '#ef4444',
  green:   '#22c55e',
  blue:    '#3b82f6',
  cyan:    '#06b6d4',
  magenta: '#a855f7',
  yellow:  '#eab308',
};

// Ordered anchor hues — evenly distributed across the row, wrapping back to first
const ANCHOR_COLORS = [
  THEME.red, THEME.green, THEME.blue,
  THEME.cyan, THEME.magenta, THEME.yellow,
];
const BG_HEX = THEME.foreground;

const GAP_PX = 0;
const CUBE_PX = 48;
const CUBE_SCALE_ANIM = 0.5;
const CUBE_SCALE_REST = 0.95;
const STAGGER = 0.08;
const ROT_DUR = 1.8;
const PAUSE = 8.0;

function hexToGL(hex) {
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
}

const BG_GL = hexToGL(BG_HEX);

// Build a cols × rows color grid using Rampa SDK
// Top row: anchors placed evenly, gaps filled via LinearColorSpace
// Each column: fades from top-row color → background via LinearColorSpace
let grid = [];      // grid[col][row] = [r,g,b] GL color
let cachedCols = 0;
let cachedRows = 0;

// Steps between anchor colors (for face offset calculation)
let faceStep = 1;

function buildGrid(cols, rows) {
  if (cols === cachedCols && rows === cachedRows) return;
  cachedCols = cols;
  cachedRows = rows;

  // 1. Compute anchor column positions (evenly spaced, wrapping)
  var n = ANCHOR_COLORS.length;
  var spacing = cols / n;
  faceStep = Math.max(1, Math.floor(spacing));
  var anchorCols = [];
  for (var i = 0; i < n; i++) {
    anchorCols.push(Math.round(i * spacing));
  }

  // 2. Build top row by interpolating between anchors
  var topRow = new Array(cols);
  for (var seg = 0; seg < n; seg++) {
    var fromCol = anchorCols[seg];
    var toCol = seg < n - 1 ? anchorCols[seg + 1] : cols;
    var fromHex = ANCHOR_COLORS[seg];
    var toHex = ANCHOR_COLORS[(seg + 1) % n];
    var segLen = toCol - fromCol;
    if (segLen <= 0) continue;
    var ramp = new Rampa.LinearColorSpace(fromHex, toHex).size(segLen);
    for (var j = 0; j < segLen; j++) {
      topRow[fromCol + j] = '' + ramp(j + 1);
    }
  }
  // Fill any remaining cols (shouldn't happen, but safety)
  for (var c = 0; c < cols; c++) {
    if (!topRow[c]) topRow[c] = ANCHOR_COLORS[ANCHOR_COLORS.length - 1];
  }

  // 3. For each column, fade from top-row color → background
  grid = new Array(cols);
  for (var c = 0; c < cols; c++) {
    var colRamp = new Rampa.LinearColorSpace(topRow[c], BG_HEX).size(Math.max(rows, 2));
    grid[c] = new Array(rows);
    for (var r = 0; r < rows; r++) {
      grid[c][r] = hexToGL('' + colRamp(r + 1));
    }
  }
}

const canvas = document.getElementById('c');
function resize() {
  const parent = canvas.parentElement;
  const w = parent ? parent.offsetWidth : window.innerWidth;
  const h = parent ? parent.offsetHeight : window.innerHeight;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
}
resize();
window.addEventListener('resize', resize);

const gl = canvas.getContext('webgl', { antialias: true, alpha: false });

const VS = `
attribute vec3 aP, aN;
uniform mat4 uPr, uVi, uMo;
varying vec3 vN, vW;
void main(){
  vec4 w = uMo * vec4(aP, 1.0);
  vW = w.xyz;
  vN = mat3(uMo) * aN;
  gl_Position = uPr * uVi * w;
}`;

const FS = `
precision mediump float;
varying vec3 vN, vW;
uniform vec3 uFC[6], uLD;
void main(){
  vec3 n = normalize(vN);
  vec3 a = abs(n);
  int fi = 0;
  if(a.x>a.y && a.x>a.z) fi = n.x>0.0 ? 0 : 1;
  else if(a.y>a.z) fi = n.y>0.0 ? 2 : 3;
  else fi = n.z>0.0 ? 4 : 5;
  vec3 c;
  if(fi==0) c=uFC[0]; else if(fi==1) c=uFC[1];
  else if(fi==2) c=uFC[2]; else if(fi==3) c=uFC[3];
  else if(fi==4) c=uFC[4]; else c=uFC[5];
  float d = max(dot(n, normalize(uLD)), 0.0);
  gl_FragColor = vec4(c * (0.35 + 0.65*d), 1.0);
}`;

function mkS(src, t) {
  const s = gl.createShader(t);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}
const p = gl.createProgram();
gl.attachShader(p, mkS(VS, gl.VERTEX_SHADER));
gl.attachShader(p, mkS(FS, gl.FRAGMENT_SHADER));
gl.linkProgram(p);
gl.useProgram(p);

const aP = gl.getAttribLocation(p, 'aP');
const aN = gl.getAttribLocation(p, 'aN');
const uPr = gl.getUniformLocation(p, 'uPr');
const uVi = gl.getUniformLocation(p, 'uVi');
const uMo = gl.getUniformLocation(p, 'uMo');
const uLD = gl.getUniformLocation(p, 'uLD');
const uFC = [];
for (let i = 0; i < 6; i++) uFC.push(gl.getUniformLocation(p, `uFC[${i}]`));

// Cube geometry
const S = CUBE_SCALE_ANIM;
const F = [
  {n:[1,0,0], v:[[S,-S,-S],[S,S,-S],[S,S,S],[S,-S,-S],[S,S,S],[S,-S,S]]},
  {n:[-1,0,0], v:[[-S,S,-S],[-S,-S,-S],[-S,-S,S],[-S,S,-S],[-S,-S,S],[-S,S,S]]},
  {n:[0,1,0], v:[[-S,S,-S],[-S,S,S],[S,S,S],[-S,S,-S],[S,S,S],[S,S,-S]]},
  {n:[0,-1,0], v:[[-S,-S,S],[-S,-S,-S],[S,-S,-S],[-S,-S,S],[S,-S,-S],[S,-S,S]]},
  {n:[0,0,1], v:[[-S,-S,S],[S,-S,S],[S,S,S],[-S,-S,S],[S,S,S],[-S,S,S]]},
  {n:[0,0,-1], v:[[S,-S,-S],[-S,-S,-S],[-S,S,-S],[S,-S,-S],[-S,S,-S],[S,S,-S]]},
];
const d = [];
F.forEach(f => f.v.forEach(v => d.push(v[0],v[1],v[2],f.n[0],f.n[1],f.n[2])));
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW);
gl.enableVertexAttribArray(aP);
gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(aN);
gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 24, 12);

gl.enable(gl.DEPTH_TEST);
gl.clearColor(BG_GL[0], BG_GL[1], BG_GL[2], 1);

// Math
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function crs(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function nrm(v){const l=Math.sqrt(dot(v,v));return [v[0]/l,v[1]/l,v[2]/l];}
function mul(a,b){const r=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++)r[j*4+i]=a[i]*b[j*4]+a[4+i]*b[j*4+1]+a[8+i]*b[j*4+2]+a[12+i]*b[j*4+3];return r;}
function rX(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);}
function rY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);}
function tr(x,y,z){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);}
function sc(s){return new Float32Array([s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1]);}

function ease(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}

// Face rotations — each entry exposes a unique geometric face to the camera.
// Every consecutive pair differs on BOTH axes → dramatic diagonal tumble.
// Visible face sequence: +Z, -Y, +X, +Y, -Z, -X (all 6, no repeats)
const FR = [
  [0, 0],                        // face 4 (+Z front)
  [Math.PI/2, -Math.PI/2],       // face 3 (-Y)
  [Math.PI, Math.PI/2],          // face 0 (+X)
  [-Math.PI/2, -Math.PI/2],      // face 2 (+Y)
  [0, Math.PI],                  // face 5 (-Z)
  [Math.PI, -Math.PI/2],         // face 1 (-X)
];

// Orthographic projection for pixel-perfect cube sizing
function ortho(l, r, b, t, n, f) {
  return new Float32Array([2/(r-l),0,0,0, 0,2/(t-b),0,0, 0,0,-2/(f-n),0, -(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);
}

gl.uniform3f(uLD, 0.5, 0.8, 1.0);

let prevCols = 0, prevRows = 0;
const startTime = performance.now() / 1000;

function frame() {
  const now = performance.now()/1000;
  gl.viewport(0, 0, canvas.width, canvas.height);
  const W = canvas.width / devicePixelRatio;
  const H = canvas.height / devicePixelRatio;
  const cell = CUBE_PX + GAP_PX;
  const cols = Math.ceil(W / cell) + 1;
  const rows = Math.ceil(H / cell) + 1;

  if (cols !== prevCols || rows !== prevRows) {
    prevCols = cols; prevRows = rows;
    buildGrid(cols, rows);
  }

  const cycleLen = ROT_DUR + PAUSE;

  // Orthographic: 1 unit = 1 CSS pixel
  gl.uniformMatrix4fv(uPr, false, ortho(0, W, 0, H, -500, 500));
  gl.uniformMatrix4fv(uVi, false, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const elapsed = now - startTime;
  const cubeScale = CUBE_PX * 0.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Each cube has its own continuous timeline
      const del = (c + r) * STAGGER;
      const cubeTime = Math.max(0, elapsed - del);
      const cubeCycle = Math.floor(cubeTime / cycleLen);
      const phase = (cubeTime - cubeCycle * cycleLen) / ROT_DUR;
      const lt = Math.min(1, phase);
      const t = ease(lt);

      // Each face picks a color stepped by faceStep along the grid columns.
      // Face 0 (front at rest) = grid[c], face 1 = grid[c + faceStep], etc.
      // Since rotations cycle through faces, each rest position shows a
      // different color — no color interpolation, just the rotation effect.
      const ci = cubeCycle % FR.length;
      const fi = cubeCycle % FR.length;
      const ti = (cubeCycle + 1) % FR.length;

      for (let i = 0; i < 6; i++) {
        var fc_col = ((c + i * faceStep) % cols + cols) % cols;
        var fc = grid[fc_col] ? grid[fc_col][r] : BG_GL;
        gl.uniform3f(uFC[i], fc[0], fc[1], fc[2]);
      }

      const from = FR[fi], to = FR[ti];
      const rx = from[0] + (to[0] - from[0]) * t;
      const ry = from[1] + (to[1] - from[1]) * t;

      // Animated scale: full at rest (t=0,1), shrink at mid-rotation (t=0.5)
      const scaleLerp = 1 - Math.sin(t * Math.PI); // 0 at edges, 1 at midpoint
      const animScale = CUBE_SCALE_ANIM + (CUBE_SCALE_REST - CUBE_SCALE_ANIM) * scaleLerp;

      // Position: center of each cell, Y flipped (screen coords)
      const px = c * cell + CUBE_PX / 2;
      const py = H - (r * cell + CUBE_PX / 2);

      let m = tr(px, py, 0);
      m = mul(m, rX(rx));
      m = mul(m, rY(ry));
      m = mul(m, sc(cubeScale * animScale / CUBE_SCALE_ANIM));

      gl.uniformMatrix4fv(uMo, false, m);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
  }
  requestAnimationFrame(frame);
}
frame();
