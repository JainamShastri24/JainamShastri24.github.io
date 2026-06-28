// ============================================================
//  JAINAM SHASTRI — 3D DATA CENTER PORTFOLIO
//  Three.js UMD global build
// ============================================================

// On-screen error display
window.onerror = function(msg, src, line) {
  var d = document.getElementById('debug-error');
  if (!d) {
    d = document.createElement('div');
    d.id = 'debug-error';
    d.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:rgba(180,0,0,0.92);color:#fff;padding:12px;font:13px monospace;z-index:9999;white-space:pre-wrap;border-radius:4px;';
    document.body.appendChild(d);
  }
  d.textContent += 'JS ERROR: ' + msg + '\nLine: ' + line + '\n';
};

// ============================================================
//  LOADING SCREEN
// ============================================================
var loadingScreen = document.getElementById('loading-screen');
var loadingFill   = document.getElementById('loading-fill');
var loadingPct    = document.getElementById('loading-pct');
var loadingStatus = document.getElementById('loading-status');
var clickPrompt   = document.getElementById('click-prompt');

var loadMsgs = [
  'Initializing data center environment...',
  'Loading GCP infrastructure modules...',
  'Calibrating server rack geometry...',
  'Compiling operational analytics...',
  'Mapping demand forecast pathways...',
  'Data center online. Welcome, Visitor.',
];

var loadProgress = 0;
var loadInterval = setInterval(function() {
  loadProgress = Math.min(100, loadProgress + (Math.random() * 12 + 5));
  loadingFill.style.width = loadProgress + '%';
  loadingPct.textContent  = Math.floor(loadProgress) + '%';
  loadingStatus.textContent = loadMsgs[Math.min(Math.floor(loadProgress / 18), loadMsgs.length - 1)];
  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    setTimeout(function() {
      loadingScreen.classList.add('fade-out');
      setTimeout(function() { loadingScreen.style.display = 'none'; }, 800);
    }, 500);
  }
}, 120);

// ============================================================
//  SCENE + RENDERER
// ============================================================
var scene    = new THREE.Scene();
scene.background = new THREE.Color(0x05080f);
scene.fog = new THREE.Fog(0x05080f, 25, 65);   // linear fog — more predictable than FogExp2

var W = window.innerWidth, H = window.innerHeight;
var camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100);
camera.position.set(0, 1.7, 18);
camera.rotation.order = 'YXZ';

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x05080f);
document.getElementById('canvas-container').appendChild(renderer.domElement);

scene.add(camera);

// ============================================================
//  LIGHTING — bright enough to see clearly on all devices
// ============================================================
// Strong ambient so nothing is completely black
scene.add(new THREE.AmbientLight(0x334466, 3.0));

// Hemisphere: warm top, cool bottom
scene.add(new THREE.HemisphereLight(0x4466bb, 0x112233, 1.5));

// Main directional light — fills the whole room
var sun = new THREE.DirectionalLight(0x88aaff, 2.0);
sun.position.set(2, 8, 5);
scene.add(sun);

// Two fill lights from either end of the corridor
var fillA = new THREE.DirectionalLight(0x2244cc, 1.0);
fillA.position.set(0, 4, -20);
scene.add(fillA);

var fillB = new THREE.DirectionalLight(0x3355bb, 1.0);
fillB.position.set(0, 4, 20);
scene.add(fillB);

// ============================================================
//  FLOOR
// ============================================================
var floorCanvas = document.createElement('canvas');
floorCanvas.width = floorCanvas.height = 256;
var fc = floorCanvas.getContext('2d');
fc.fillStyle = '#0e1422';
fc.fillRect(0, 0, 256, 256);
fc.strokeStyle = '#1a2a40';
fc.lineWidth = 1;
for (var gi = 0; gi <= 256; gi += 32) {
  fc.beginPath(); fc.moveTo(gi,0); fc.lineTo(gi,256); fc.stroke();
  fc.beginPath(); fc.moveTo(0,gi); fc.lineTo(256,gi); fc.stroke();
}
var floorTex = new THREE.CanvasTexture(floorCanvas);
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(12, 22);

var floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 60),
  new THREE.MeshLambertMaterial({ map: floorTex })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ============================================================
//  CEILING
// ============================================================
var ceilMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 60),
  new THREE.MeshLambertMaterial({ color: 0x080c14 })
);
ceilMesh.rotation.x = Math.PI / 2;
ceilMesh.position.y = 5;
scene.add(ceilMesh);

// Ceiling light strips — glowing white/blue panels
for (var lz = 16; lz >= -28; lz -= 5) {
  var lp = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.05, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x99bbff })
  );
  lp.position.set(0, 4.95, lz);
  scene.add(lp);
}

// ============================================================
//  WALLS
// ============================================================
var wallMat = new THREE.MeshLambertMaterial({ color: 0x0d1520 });

var lWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 60), wallMat);
lWall.position.set(-14, 2.5, 0);
scene.add(lWall);

var rWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 60), wallMat);
rWall.position.set(14, 2.5, 0);
scene.add(rWall);

var bkWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5, 0.3), wallMat);
bkWall.position.set(0, 2.5, -30);
scene.add(bkWall);

var ftWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5, 0.3), wallMat);
ftWall.position.set(0, 2.5, 22);
scene.add(ftWall);

// Glowing floor edge strips — visible navigation guides
[-2.8, 2.8].forEach(function(ex) {
  var strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.02, 58),
    new THREE.MeshBasicMaterial({ color: 0x0055ff })
  );
  strip.position.set(ex, 0.01, -4);
  scene.add(strip);
});

// ============================================================
//  ZONE DEFINITIONS
// ============================================================
var zones = [
  {
    id: 0,
    name: 'SECTOR_01 // WHO I AM',
    color: 0x0066ff, hexColor: '#0066ff',
    zRange: [17, 9], center: 13,
    title: 'Jainam Shastri',
    subtitle: 'Technical Program Manager · Data Analyst II · GCP Vendor at Astreya',
    content: 'I turn operational chaos into clean, data-driven decisions — at Google scale.\n\nProgram Manager and Data Analyst II at Astreya, embedded inside Google Cloud Platform. I sit at the intersection of data, operations, and engineering — owning supply chain analytics, order fulfillment systems, and process automation for GCP\'s data center infrastructure.\n\nB.Eng. IT · PG Business Analytics · PG Predictive Analytics · Google Data Analytics Certified.\nBased in Canada · Open to Relocate.',
    tags: ['GCP Vendor', 'Python', 'SQL', 'R', 'Google PLX', 'Data Nexus', 'Canada'],
  },
  {
    id: 1,
    name: 'SECTOR_02 // GCP CLOUD',
    color: 0x00ddaa, hexColor: '#00ddaa',
    zRange: [6, -2], center: 2,
    title: 'Operating Inside Google Cloud',
    subtitle: 'Dashboards that run GCP supply chain compliance — built by me',
    content: 'Most people use Google Cloud. I help run it.\n\nAt Astreya (GCP vendor, Dec 2024–present), I design dashboards using Google PLX scripts that track C3PO eligibility, allocation, demand shaping, cluster planning, and power management across the cloud supply chain.\n\nDelivered 20% system improvement via standardized SOPs. Applied analytical thinking across C3PO, allocation, and power compliance workflows — driving on-time delivery at infrastructure scale.',
    tags: ['Google PLX Scripts', 'GCP Infrastructure', 'C3PO Compliance', 'SOPs', 'Supply Chain', 'Demand Shaping'],
  },
  {
    id: 2,
    name: 'SECTOR_03 // ORDER ENGINE',
    color: 0xff8800, hexColor: '#ff8800',
    zRange: [-5, -13], center: -9,
    title: 'Mastering the Order Machine',
    subtitle: 'From demand signal to deployed server rack — I own the pipeline',
    content: 'Cloud capacity starts with an order. I make sure it finishes with a rack online.\n\nI manage the end-to-end hardware order lifecycle — tracking servers, drives, networking gear, and cooling units from demand signal to live deployment. I identify pipeline stalls, push through blockers, and run KPI dashboards across procurement and logistics teams.\n\nPreviously at AnalystSpace: improved data accuracy by 95%, reduced reporting errors 20%, and built KPI dashboards for Rapid Transit Operations using Power BI.',
    tags: ['Order Management', 'Hardware Lifecycle', 'KPI Dashboards', 'Power BI', 'Supply Chain Analytics', 'Cross-functional'],
  },
  {
    id: 3,
    name: 'SECTOR_04 // FORECASTING',
    color: 0xaa00ff, hexColor: '#aa00ff',
    zRange: [-16, -22], center: -19,
    title: 'Predicting Demand Before It Hits',
    subtitle: 'ARIMA, EOQ, and stock trend models shipped to production',
    content: 'The best operational crisis is the one that never happens.\n\nI build demand forecasting models using ARIMA, Exponential Smoothing, EOQ, and Reorder Point analysis — predicting hardware demand weeks before requests land, so procurement acts early, not late.\n\nProjects: Reliance Stock Trend Analysis (80% accuracy, Python/Pandas/Matplotlib) and Inventory Management Optimization (25% cost reduction via predictive modeling in R). Also drove 35% reporting efficiency gains via automation at EVM India.',
    tags: ['ARIMA', 'Demand Forecasting', 'EOQ', 'Python', 'R', 'Pandas', 'Matplotlib', 'Inventory Optimization'],
  },
  {
    id: 4,
    name: 'SECTOR_05 // CONNECT',
    color: 0xff0055, hexColor: '#ff0055',
    zRange: [-25, -29], center: -27,
    title: 'Automation & Let\'s Talk',
    subtitle: 'I automate bottlenecks and I\'m open to the next challenge',
    content: 'Every manual process is a bottleneck waiting to be eliminated.\n\nI work across Engineering, Logistics, Procurement, and Ops — identifying where humans do what scripts should, then automating it. At EVM India, process automation drove 35% reporting efficiency improvement, 20% labor cost reduction, and 15% productivity gain.\n\nSkills: Python · SQL · R · Power BI · Google PLX · BigQuery · Excel · Data Nexus · Buganizer · Slack · Google Suite\n\nReach out:\njainamshastri24@gmail.com\n(519) 760-9277',
    tags: ['Process Automation', 'Python', 'SQL', 'Bottleneck Analysis', 'Open to Work', 'Canada', 'Relocate'],
  },
];

// ============================================================
//  SERVER RACK BUILDER
// ============================================================
var ledMeshes = [];

function buildRack(x, z, accentHex) {
  var g  = new THREE.Group();
  var ac = new THREE.Color(accentHex);

  // Chassis — medium grey so it's visible under lighting
  var chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.2, 0.85),
    new THREE.MeshLambertMaterial({ color: 0x1a2030 })
  );
  chassis.position.y = 1.1;
  g.add(chassis);

  // Faceplate — slightly lighter
  var face = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 2.18, 0.02),
    new THREE.MeshLambertMaterial({ color: 0x222d3d })
  );
  face.position.set(0, 1.1, 0.435);
  g.add(face);

  // Glowing accent strip at top of faceplate
  var accentStrip = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.06, 0.03),
    new THREE.MeshBasicMaterial({ color: ac })
  );
  accentStrip.position.set(0, 2.15, 0.445);
  g.add(accentStrip);

  // 1U server rows with LEDs
  for (var i = 0; i < 12; i++) {
    var uy = 0.1 + i * 0.175;

    var unit = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.15, 0.02),
      new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x1e2d3f : 0x172030 })
    );
    unit.position.set(0, uy + 0.075, 0.445);
    g.add(unit);

    // LEDs
    var ledColors = [0x00ff44, 0x00ff44, 0x00aaff, 0xff8800, 0x00ff44];
    for (var l = 0; l < 5; l++) {
      var active = Math.random() > 0.2;
      var led = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 5, 5),
        new THREE.MeshBasicMaterial({ color: active ? ledColors[l] : 0x111111 })
      );
      led.position.set(-0.48 + l * 0.12, uy + 0.075, 0.455);
      if (active) {
        led.userData.blink  = 0.3 + Math.random() * 2.5;
        led.userData.offset = Math.random() * Math.PI * 2;
        led.userData.col    = ledColors[l];
        ledMeshes.push(led);
      }
      g.add(led);
    }
  }

  // Edge highlight lines using accentColor
  var edgeGeo  = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.42, 2.22, 0.87));
  var edgeMat  = new THREE.LineBasicMaterial({ color: ac.clone().multiplyScalar(0.6) });
  var edgeLine = new THREE.LineSegments(edgeGeo, edgeMat);
  edgeLine.position.y = 1.1;
  g.add(edgeLine);

  // Bottom glow bar
  var glow = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.04, 0.04),
    new THREE.MeshBasicMaterial({ color: ac.clone().multiplyScalar(0.7) })
  );
  glow.position.set(0, 0.02, 0.4);
  g.add(glow);

  g.position.set(x, 0, z);
  scene.add(g);
  return g;
}

// ============================================================
//  POPULATE ZONES
// ============================================================
zones.forEach(function(zone) {
  var zs = zone.zRange[0], ze = zone.zRange[1];

  for (var rz = zs; rz >= ze; rz -= 3) {
    // Racks at x = ±4.5 and ±6.5 — visible from corridor center
    buildRack(-6.5, rz, zone.hexColor);
    buildRack(-4.5, rz, zone.hexColor);
    buildRack( 4.5, rz, zone.hexColor);
    buildRack( 6.5, rz, zone.hexColor);
  }

  // Zone floor highlight strip — clearly visible
  var stripLen = Math.abs(zs - ze);
  var fstrip = new THREE.Mesh(
    new THREE.PlaneGeometry(10, stripLen),
    new THREE.MeshBasicMaterial({ color: zone.color, transparent: true, opacity: 0.06, depthWrite: false })
  );
  fstrip.rotation.x = -Math.PI / 2;
  fstrip.position.set(0, 0.02, (zs + ze) / 2);
  scene.add(fstrip);

  // Zone entrance marker — a bright glowing arch/sign visible from a distance
  var markerGeo  = new THREE.BoxGeometry(6, 0.12, 0.12);
  var markerMat  = new THREE.MeshBasicMaterial({ color: zone.color });
  var markerTop  = new THREE.Mesh(markerGeo, markerMat);
  markerTop.position.set(0, 4.2, zs + 0.5);
  scene.add(markerTop);

  var markerL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4, 0.12), markerMat);
  markerL.position.set(-3, 2, zs + 0.5);
  scene.add(markerL);

  var markerR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4, 0.12), markerMat);
  markerR.position.set(3, 2, zs + 0.5);
  scene.add(markerR);

  // Zone label on wall (both sides)
  [-13.6, 13.6].forEach(function(wx, idx) {
    var lc = document.createElement('canvas');
    lc.width = 512; lc.height = 128;
    var lx = lc.getContext('2d');
    var col = new THREE.Color(zone.color);
    var r = Math.round(col.r*255), gg = Math.round(col.g*255), b = Math.round(col.b*255);

    lx.fillStyle = 'rgba(' + r + ',' + gg + ',' + b + ',0.1)';
    lx.fillRect(0, 0, 512, 128);
    lx.strokeStyle = 'rgba(' + r + ',' + gg + ',' + b + ',0.85)';
    lx.lineWidth = 2; lx.strokeRect(3, 3, 506, 122);

    // Zone code — small
    lx.font = '13px monospace';
    lx.fillStyle = 'rgba(' + r + ',' + gg + ',' + b + ',0.75)';
    lx.textAlign = 'center';
    lx.fillText(zone.name, 256, 32);

    // Big punchy title
    lx.font = 'bold 19px monospace';
    lx.fillStyle = '#ffffff';
    lx.fillText(zone.title, 256, 64);

    // One-liner subtitle — the hook
    lx.font = '13px monospace';
    lx.fillStyle = 'rgba(180,210,255,0.8)';
    // Truncate subtitle if too long for wall label
    var sub = zone.subtitle.length > 52 ? zone.subtitle.slice(0, 50) + '…' : zone.subtitle;
    lx.fillText(sub, 256, 96);

    var lt = new THREE.CanvasTexture(lc);
    var lm = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 0.88),
      new THREE.MeshBasicMaterial({ map: lt, transparent: true, side: THREE.DoubleSide })
    );
    lm.position.set(wx, 3.5, (zs + ze) / 2);
    if (idx === 1) lm.rotation.y = Math.PI;
    scene.add(lm);
  });
});

// ============================================================
//  OVERHEAD CABLE TRAYS
// ============================================================
[-5.5, 5.5].forEach(function(tx) {
  var tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.1, 58),
    new THREE.MeshLambertMaterial({ color: 0x0a1018 })
  );
  tray.position.set(tx, 4.3, -4);
  scene.add(tray);
});

// ============================================================
//  SIGNAL CABLES WITH FLOWING DOTS
// ============================================================
var signalDots = [];

(function buildCables() {
  var cableColors = [0x00aaff, 0x00ffaa, 0xff6600, 0xaa44ff, 0xff2255, 0x44ffcc];
  // Horizontal runs along ceiling tray, then drop-cables between racks
  // Each cable: series of points forming a path, dots travel along it

  // --- Long spine cables along z-axis on both sides of corridor ---
  var spineZ = [
    { pts: [[-5.4, 4.25, 18], [-5.4, 4.25, -28]], col: 0x0088ff },
    { pts: [[ 5.4, 4.25, 18], [ 5.4, 4.25, -28]], col: 0x00ffaa },
    { pts: [[-5.4, 4.20, 18], [-5.4, 4.20, -28]], col: 0x4433ff },
    { pts: [[ 5.4, 4.20, 18], [ 5.4, 4.20, -28]], col: 0xff6600 }
  ];

  // --- Cross cables bridging the ceiling every 6 units ---
  var crossCables = [];
  for (var cz = -26; cz <= 16; cz += 6) {
    crossCables.push({ pts: [[-5.4, 4.25, cz], [5.4, 4.25, cz]], col: cableColors[Math.floor(Math.random() * cableColors.length)] });
  }

  // --- Drop cables from tray down to rack tops (x ±4.5 and ±6.5) ---
  var dropCables = [];
  var rackXs = [-6.5, -4.5, 4.5, 6.5];
  for (var di = 0; di < rackXs.length; di++) {
    var rx = rackXs[di];
    var trayX = rx < 0 ? -5.4 : 5.4;
    for (var dz = -25; dz <= 15; dz += 4) {
      dropCables.push({
        pts: [[trayX, 4.25, dz], [rx, 4.25, dz], [rx, 2.1, dz]],
        col: cableColors[(di + Math.floor(dz/4)) % cableColors.length]
      });
    }
  }

  var allCables = spineZ.concat(crossCables).concat(dropCables);

  allCables.forEach(function(cable) {
    // Draw the cable as a thin BoxGeometry line between each pair of points
    var pts = cable.pts;
    for (var si = 0; si < pts.length - 1; si++) {
      var a = pts[si], b = pts[si+1];
      var dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2];
      var len = Math.sqrt(dx*dx+dy*dy+dz*dz);
      if (len < 0.001) continue;
      var seg = new THREE.Mesh(
        new THREE.BoxGeometry(
          Math.abs(dx) > 0.01 ? len : 0.02,
          Math.abs(dy) > 0.01 ? len : 0.02,
          Math.abs(dz) > 0.01 ? len : 0.02
        ),
        new THREE.MeshBasicMaterial({ color: 0x0a1420 })
      );
      seg.position.set((a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2);
      scene.add(seg);
    }

    // Add 1-3 signal dots per cable
    var numDots = 1 + Math.floor(Math.random() * 2);
    for (var nd = 0; nd < numDots; nd++) {
      var dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 6, 6),
        new THREE.MeshBasicMaterial({ color: cable.col })
      );
      scene.add(dot);
      signalDots.push({
        mesh: dot,
        pts: pts,
        t: Math.random(),         // position along cable 0..1
        speed: 0.04 + Math.random() * 0.12,
        col: cable.col
      });
    }
  });
})();

// Evaluate a polyline at normalized t (0=start, 1=end)
function polylineAt(pts, t) {
  var totalLen = 0;
  var lens = [];
  for (var i = 0; i < pts.length-1; i++) {
    var a = pts[i], b = pts[i+1];
    var l = Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2)+Math.pow(b[2]-a[2],2));
    lens.push(l);
    totalLen += l;
  }
  var target = t * totalLen;
  var acc = 0;
  for (var j = 0; j < lens.length; j++) {
    if (acc + lens[j] >= target) {
      var f = (target - acc) / lens[j];
      var pa = pts[j], pb = pts[j+1];
      return [
        pa[0] + (pb[0]-pa[0])*f,
        pa[1] + (pb[1]-pa[1])*f,
        pa[2] + (pb[2]-pa[2])*f
      ];
    }
    acc += lens[j];
  }
  var last = pts[pts.length-1];
  return [last[0], last[1], last[2]];
}

// ============================================================
//  AMBIENT PARTICLES
// ============================================================
var PCNT = 300;
var pPos = new Float32Array(PCNT * 3);
var pVel = new Float32Array(PCNT * 3);
for (var pi = 0; pi < PCNT; pi++) {
  pPos[pi*3]   = (Math.random() - 0.5) * 26;
  pPos[pi*3+1] = Math.random() * 4.8;
  pPos[pi*3+2] = (Math.random() - 0.5) * 58;
  pVel[pi*3]   = (Math.random() - 0.5) * 0.001;
  pVel[pi*3+1] = (Math.random() - 0.5) * 0.0004;
  pVel[pi*3+2] = (Math.random() - 0.5) * 0.001;
}
var pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x3355aa, size: 0.04, transparent: true, opacity: 0.5 })));

// ============================================================
//  TOUCH + KEYBOARD CONTROLS
// ============================================================
var started = false;
var cameraYaw   = 0;
var cameraPitch = 0;

function startExperience() {
  if (started) return;
  started = true;
  clickPrompt.classList.add('hidden');
  setTimeout(function() { updateGuide(-1, '#0066ff'); }, 800);
}

document.addEventListener('pointerdown', startExperience, { once: true });

var joystickId     = null;
var joystickOrigin = { x: 0, y: 0 };
var joystickDelta  = { x: 0, y: 0 };
var lookId   = null;
var lookPrev = { x: 0, y: 0 };

var jBase = document.getElementById('joystick-base');
var jKnob = document.getElementById('joystick-knob');
var JMAX  = 55;

function showJoy(x, y) {
  jBase.style.left = (x - 60) + 'px';
  jBase.style.top  = (y - 60) + 'px';
  jBase.style.display = 'block';
}
function moveKnob(dx, dy) {
  var dist = Math.min(Math.sqrt(dx*dx + dy*dy), JMAX);
  var ang  = Math.atan2(dy, dx);
  jKnob.style.transform = 'translate(calc(-50% + ' + (Math.cos(ang)*dist) + 'px), calc(-50% + ' + (Math.sin(ang)*dist) + 'px))';
}
function hideJoy() {
  jBase.style.display = 'none';
  joystickDelta.x = joystickDelta.y = 0;
}

document.addEventListener('touchstart', function(e) {
  startExperience();
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (t.clientX < window.innerWidth * 0.5 && joystickId === null) {
      joystickId = t.identifier;
      joystickOrigin.x = t.clientX; joystickOrigin.y = t.clientY;
      joystickDelta.x  = joystickDelta.y = 0;
      showJoy(t.clientX, t.clientY);
    } else if (t.clientX >= window.innerWidth * 0.5 && lookId === null) {
      lookId = t.identifier;
      lookPrev.x = t.clientX; lookPrev.y = t.clientY;
    }
  }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (t.identifier === joystickId) {
      joystickDelta.x = t.clientX - joystickOrigin.x;
      joystickDelta.y = t.clientY - joystickOrigin.y;
      moveKnob(joystickDelta.x, joystickDelta.y);
    } else if (t.identifier === lookId) {
      cameraYaw   -= (t.clientX - lookPrev.x) * 0.004;
      cameraPitch -= (t.clientY - lookPrev.y) * 0.004;
      cameraPitch  = Math.max(-0.45, Math.min(0.45, cameraPitch));
      lookPrev.x = t.clientX; lookPrev.y = t.clientY;
    }
  }
}, { passive: true });

document.addEventListener('touchend', function(e) {
  for (var i = 0; i < e.changedTouches.length; i++) {
    var t = e.changedTouches[i];
    if (t.identifier === joystickId) { joystickId = null; hideJoy(); }
    if (t.identifier === lookId)     { lookId = null; }
  }
}, { passive: true });

// Keyboard
var keys = {};
document.addEventListener('keydown', function(e) { keys[e.code] = true; startExperience(); });
document.addEventListener('keyup',   function(e) { keys[e.code] = false; });

// Mouse look (desktop + iPad with mouse) — no click required after start
var mPrev = { x: -1, y: -1 };
renderer.domElement.addEventListener('mousedown', function() { startExperience(); });
document.addEventListener('mousemove', function(e) {
  if (!started) return;
  if (mPrev.x < 0) { mPrev.x = e.clientX; mPrev.y = e.clientY; return; }
  cameraYaw   -= (e.clientX - mPrev.x) * 0.004;
  cameraPitch -= (e.clientY - mPrev.y) * 0.004;
  cameraPitch  = Math.max(-0.45, Math.min(0.45, cameraPitch));
  mPrev.x = e.clientX; mPrev.y = e.clientY;
});

// ============================================================
//  ZONE ANNOUNCEMENT + INFO PANEL
// ============================================================
var infoPanel    = document.getElementById('info-panel');
var elZone       = document.getElementById('panel-zone');
var elTitle      = document.getElementById('panel-title');
var elSubtitle   = document.getElementById('panel-subtitle');
var elContent    = document.getElementById('panel-content');
var elTags       = document.getElementById('panel-tags');
var elDivider    = document.getElementById('panel-divider');
var elSectorName = document.getElementById('info-sector-name');
var elShortTitle = document.getElementById('info-short-title');
var elInfoDot    = document.getElementById('info-dot');
var hudSector    = document.getElementById('hud-sector');
var hudCoords    = document.getElementById('hud-coords');

// Cinematic announcement elements
var zoneAnnounce = document.getElementById('zone-announce');
var zaCode       = document.getElementById('za-code');
var zaTitle      = document.getElementById('za-title');
var zaSubtitle   = document.getElementById('za-subtitle');
var announceTimer = null;

// ============================================================
//  3D GUIDE CHARACTER
// ============================================================
var guideLines = [
  "Hi! I'm your guide. Walk forward to explore Jainam's story.",
  'Sector 2: GCP Cloud Ops. Jainam builds dashboards inside Google. Tap ▼.',
  'Sector 3: Order Engine. Hardware lifecycle from signal to rack. Tap ▼.',
  'Sector 4: Forecasting. ARIMA models, 80% accuracy. Tap ▼ for projects.',
  "Last stop! Let's connect. Email and phone inside. Tap ▼.",
  'Keep exploring — walk through each glowing arch!',
];

// Helper: draw rounded rect on canvas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

// Helper: word-wrap text on canvas
function wrapText(ctx, text, cx, y, maxW, lineH) {
  var words = text.split(' ');
  var line = '';
  for (var i = 0; i < words.length; i++) {
    var test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && line !== '') {
      ctx.fillText(line.trim(), cx, y);
      y += lineH; line = words[i] + ' ';
    } else { line = test; }
  }
  if (line.trim()) ctx.fillText(line.trim(), cx, y);
}

function buildGuideCharacter() {
  var root = new THREE.Group();

  var suitMat  = new THREE.MeshLambertMaterial({ color: 0x1a3a6e });
  var suit2Mat = new THREE.MeshLambertMaterial({ color: 0x102850 });
  var skinMat  = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
  var shoeMat  = new THREE.MeshLambertMaterial({ color: 0x111111 });
  var eyeMat   = new THREE.MeshBasicMaterial({ color: 0x111111 });

  // --- HEAD ---
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), skinMat);
  head.position.y = 1.52;
  root.add(head);

  // Eyes
  [-0.045, 0.045].forEach(function(ex) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeMat);
    eye.position.set(ex, 1.535, 0.1);
    root.add(eye);
  });

  // Hair
  var hairMat = new THREE.MeshLambertMaterial({ color: 0x1a0800 });
  var hair = new THREE.Mesh(new THREE.SphereGeometry(0.112, 10, 6, 0, Math.PI*2, 0, Math.PI*0.5), hairMat);
  hair.position.y = 1.52;
  root.add(hair);

  // --- NECK ---
  var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 6), skinMat);
  neck.position.y = 1.38;
  root.add(neck);

  // --- TORSO ---
  var torso = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.13), suitMat);
  torso.position.y = 1.14;
  root.add(torso);

  // Collar / tie hint
  var tie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.015), new THREE.MeshLambertMaterial({ color: 0x880000 }));
  tie.position.set(0, 1.18, 0.068);
  root.add(tie);

  // --- HIPS ---
  var hips = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.12), suit2Mat);
  hips.position.y = 0.9;
  root.add(hips);

  // --- LEFT ARM ---
  var lShoulderG = new THREE.Group();
  lShoulderG.position.set(-0.16, 1.28, 0);
  root.add(lShoulderG);

  var lUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), suitMat);
  lUpper.position.y = -0.11;
  lShoulderG.add(lUpper);

  var lElbowG = new THREE.Group();
  lElbowG.position.y = -0.22;
  lShoulderG.add(lElbowG);

  var lFore = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.19, 0.07), skinMat);
  lFore.position.y = -0.095;
  lElbowG.add(lFore);

  // --- RIGHT ARM ---
  var rShoulderG = new THREE.Group();
  rShoulderG.position.set(0.16, 1.28, 0);
  root.add(rShoulderG);

  var rUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), suitMat);
  rUpper.position.y = -0.11;
  rShoulderG.add(rUpper);

  var rElbowG = new THREE.Group();
  rElbowG.position.y = -0.22;
  rShoulderG.add(rElbowG);

  var rFore = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.19, 0.07), skinMat);
  rFore.position.y = -0.095;
  rElbowG.add(rFore);

  // --- LEFT LEG ---
  var lHipG = new THREE.Group();
  lHipG.position.set(-0.075, 0.85, 0);
  root.add(lHipG);

  var lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), suit2Mat);
  lThigh.position.y = -0.14;
  lHipG.add(lThigh);

  var lKneeG = new THREE.Group();
  lKneeG.position.y = -0.28;
  lHipG.add(lKneeG);

  var lShin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.09), suit2Mat);
  lShin.position.y = -0.13;
  lKneeG.add(lShin);

  var lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.15), shoeMat);
  lFoot.position.set(0, -0.285, 0.03);
  lKneeG.add(lFoot);

  // --- RIGHT LEG ---
  var rHipG = new THREE.Group();
  rHipG.position.set(0.075, 0.85, 0);
  root.add(rHipG);

  var rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), suit2Mat);
  rThigh.position.y = -0.14;
  rHipG.add(rThigh);

  var rKneeG = new THREE.Group();
  rKneeG.position.y = -0.28;
  rHipG.add(rKneeG);

  var rShin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.09), suit2Mat);
  rShin.position.y = -0.13;
  rKneeG.add(rShin);

  var rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.15), shoeMat);
  rFoot.position.set(0, -0.285, 0.03);
  rKneeG.add(rFoot);

  // --- SPEECH BUBBLE (canvas texture billboard) ---
  var bCanvas = document.createElement('canvas');
  bCanvas.width = 320; bCanvas.height = 120;
  var bTex = new THREE.CanvasTexture(bCanvas);
  var bMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.34),
    new THREE.MeshBasicMaterial({ map: bTex, transparent: true, side: THREE.DoubleSide, depthTest: false })
  );
  bMesh.position.y = 1.98;
  bMesh.visible = false;
  root.add(bMesh);

  scene.add(root);
  root.visible = false; // hide until experience starts

  return {
    root: root,
    lShoulderG: lShoulderG, rShoulderG: rShoulderG,
    lElbowG: lElbowG,       rElbowG: rElbowG,
    lHipG: lHipG,           rHipG: rHipG,
    lKneeG: lKneeG,         rKneeG: rKneeG,
    bMesh: bMesh,           bCanvas: bCanvas, bTex: bTex,
    walkCycle: 0,
    bubbleTimer: null,
    accentColor: '#0066ff',
  };
}

var guide = buildGuideCharacter();

function setGuideBubble(msg, color) {
  var ctx = guide.bCanvas.getContext('2d');
  var W = 320, H = 120;
  ctx.clearRect(0, 0, W, H);

  var col = color || guide.accentColor;

  // Bubble background
  ctx.fillStyle = 'rgba(2,6,22,0.92)';
  roundRect(ctx, 4, 4, W-8, 82, 10);
  ctx.fill();

  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  roundRect(ctx, 4, 4, W-8, 82, 10);
  ctx.stroke();

  // Tail pointing down
  ctx.fillStyle = 'rgba(2,6,22,0.92)';
  ctx.beginPath();
  ctx.moveTo(W/2 - 10, 86);
  ctx.lineTo(W/2, 110);
  ctx.lineTo(W/2 + 10, 86);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W/2 - 10, 86);
  ctx.lineTo(W/2, 110);
  ctx.lineTo(W/2 + 10, 86);
  ctx.stroke();

  // Text
  ctx.fillStyle = 'rgba(210,230,255,0.95)';
  ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, msg, W/2, 30, W - 28, 20);

  guide.bTex.needsUpdate = true;
  guide.bMesh.visible = true;

  if (guide.bubbleTimer) clearTimeout(guide.bubbleTimer);
  guide.bubbleTimer = setTimeout(function() {
    guide.bMesh.visible = false;
  }, 5500);
}

function updateGuide(zoneId, color) {
  guide.accentColor = color || '#0066ff';
  var msgIdx = (zoneId === -1) ? 0 : (zoneId + 1);
  var msg = guideLines[Math.min(msgIdx, guideLines.length - 1)];
  setTimeout(function() { setGuideBubble(msg, guide.accentColor); }, 600);
}

var activeZoneId = -1;

function togglePanel() {
  infoPanel.classList.toggle('expanded');
}

function fireAnnouncement(zone) {
  if (announceTimer) clearTimeout(announceTimer);
  // Briefly remove show so child transitions replay on zone change
  zoneAnnounce.classList.remove('show', 'hide');
  void zoneAnnounce.offsetWidth;

  zoneAnnounce.style.setProperty('--za-color', zone.hexColor);
  zaCode.textContent     = zone.name;
  zaTitle.textContent    = zone.title;
  zaSubtitle.textContent = zone.subtitle;
  zoneAnnounce.classList.add('show');
  // Stays visible until hidePanel() is called
}

function showZone(zone) {
  if (zone.id === activeZoneId) return;
  activeZoneId = zone.id;

  // Fire cinematic title card
  fireAnnouncement(zone);

  // Populate bottom detail drawer (available on tap)
  elSectorName.textContent       = zone.name;
  elSectorName.style.color       = zone.hexColor;
  elShortTitle.textContent       = zone.title;
  elInfoDot.style.background     = zone.hexColor;
  elInfoDot.style.boxShadow      = '0 0 6px ' + zone.hexColor;
  elDivider.style.background     = 'linear-gradient(90deg,' + zone.hexColor + ',transparent)';
  elZone.textContent             = zone.name;
  elZone.style.color             = zone.hexColor;
  elTitle.textContent            = zone.title;
  elSubtitle.textContent         = zone.subtitle;
  elContent.textContent          = zone.content;
  elTags.innerHTML = zone.tags.map(function(t) {
    return '<span class="tag" style="border-color:' + zone.hexColor + ';color:' + zone.hexColor + '">' + t + '</span>';
  }).join('');

  infoPanel.classList.add('visible');
  hudSector.textContent = zone.name.split('//')[1].trim();
  updateGuide(zone.id, zone.hexColor);
}

function hidePanel() {
  if (activeZoneId === -1) return;
  activeZoneId = -1;
  infoPanel.classList.remove('visible', 'expanded');
  zoneAnnounce.classList.remove('show');
  zoneAnnounce.classList.add('hide');
  hudSector.textContent = 'CORRIDOR';
  updateGuide(-1, '#0066ff');
}

function detectZone() {
  var pz = camera.position.z;
  for (var i = 0; i < zones.length; i++) {
    var z = zones[i];
    if (pz <= z.zRange[0] + 2 && pz >= z.zRange[1] - 2) { showZone(z); return; }
  }
  hidePanel();
}

// ============================================================
//  MINIMAP
// ============================================================
function drawMinimap() {
  var mc  = document.getElementById('minimap-canvas');
  var ctx = mc.getContext('2d');
  var MW  = mc.width, MH = mc.height;
  ctx.clearRect(0, 0, MW, MH);
  ctx.fillStyle = 'rgba(0,4,14,0.95)';
  ctx.fillRect(0, 0, MW, MH);

  // world: x[-14,14], z[20,-30] (range 28 x 50)
  function mx(wx) { return (wx + 14) / 28 * MW; }
  function mz(wz) { return (20 - wz) / 50 * MH; }

  // zone bands
  zones.forEach(function(z) {
    var c = new THREE.Color(z.color);
    ctx.fillStyle = 'rgba(' + Math.round(c.r*255) + ',' + Math.round(c.g*255) + ',' + Math.round(c.b*255) + ',0.25)';
    ctx.fillRect(0, mz(z.zRange[0]), MW, mz(z.zRange[1]) - mz(z.zRange[0]));
  });

  // rack columns
  ctx.fillStyle = '#1e2d40';
  [-6.5, -4.5, 4.5, 6.5].forEach(function(rx) {
    ctx.fillRect(mx(rx) - 1.5, 0, 3, MH);
  });

  // player dot
  var px = mx(camera.position.x);
  var pz = mz(camera.position.z);
  ctx.beginPath(); ctx.arc(px, pz, 3, 0, Math.PI*2);
  ctx.fillStyle = '#ffffff'; ctx.fill();

  // direction arrow
  ctx.beginPath();
  ctx.moveTo(px, pz);
  ctx.lineTo(px + (-Math.sin(cameraYaw)) * 9, pz + (-Math.cos(cameraYaw)) * 9);
  ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1.5; ctx.stroke();
}

// ============================================================
//  ANIMATION LOOP
// ============================================================
var prevTime = performance.now();
var frame    = 0;

function animate() {
  requestAnimationFrame(animate);
  frame++;

  var now = performance.now();
  var dt  = Math.min((now - prevTime) / 1000, 0.05);
  prevTime = now;
  var t = now * 0.001;

  // Camera rotation
  camera.rotation.y = cameraYaw;
  camera.rotation.x = cameraPitch;

  // Movement
  if (started) {
    var kf = (keys['KeyW'] || keys['ArrowUp']    ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown']  ? 1 : 0);
    var ks = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft']  ? 1 : 0);
    var jx = Math.max(-1, Math.min(1, joystickDelta.x / JMAX));
    var jy = Math.max(-1, Math.min(1, joystickDelta.y / JMAX));

    var fwd    = kf + (-jy);
    var strafe = ks + jx;

    if (fwd !== 0 || strafe !== 0) {
      var speed = (keys['ShiftLeft'] ? 0.12 : 0.07);
      var sinY  = Math.sin(cameraYaw);
      var cosY  = Math.cos(cameraYaw);
      camera.position.x += (fwd * -sinY + strafe *  cosY) * speed;
      camera.position.z += (fwd * -cosY + strafe * -sinY) * speed;
    }

    camera.position.x = Math.max(-3.5, Math.min(3.5, camera.position.x));
    camera.position.z = Math.max(-29,  Math.min(20,  camera.position.z));
    camera.position.y = 1.7;

    if (frame % 8 === 0) {
      hudCoords.textContent = 'POS: ' + camera.position.x.toFixed(1) + ', ' + camera.position.z.toFixed(1);
    }
    if (frame % 12 === 0) detectZone();
  }

  // Animate signal dots along cables
  for (var si2 = 0; si2 < signalDots.length; si2++) {
    var sd = signalDots[si2];
    sd.t += sd.speed * dt;
    if (sd.t > 1) sd.t -= 1;
    var sp = polylineAt(sd.pts, sd.t);
    sd.mesh.position.set(sp[0], sp[1], sp[2]);
    // Pulse glow via scale
    var pulse = 1.0 + 0.4 * Math.sin(t * 8 + si2 * 1.3);
    sd.mesh.scale.setScalar(pulse);
  }

  // Blink LEDs
  ledMeshes.forEach(function(led) {
    var on = Math.sin(t * led.userData.blink * Math.PI * 2 + led.userData.offset) > 0;
    led.material.color.setHex(on ? led.userData.col : 0x0a0a0a);
  });

  // Drift particles
  if (frame % 2 === 0) {
    var pos = pGeo.attributes.position;
    for (var i = 0; i < PCNT; i++) {
      pos.array[i*3]   += pVel[i*3];
      pos.array[i*3+1] += pVel[i*3+1];
      pos.array[i*3+2] += pVel[i*3+2];
      if (pos.array[i*3+1] > 5)  pos.array[i*3+1] = 0;
      if (pos.array[i*3]   > 13) pos.array[i*3]   = -13;
      if (pos.array[i*3]   < -13) pos.array[i*3]  = 13;
      if (pos.array[i*3+2] > 22) pos.array[i*3+2] = -28;
      if (pos.array[i*3+2] < -28) pos.array[i*3+2] = 22;
    }
    pos.needsUpdate = true;
  }

  if (frame % 6 === 0) drawMinimap();

  // Guide character
  if (started && guide && guide.root) {
    guide.root.visible = true;
    var sinY2 = Math.sin(cameraYaw), cosY2 = Math.cos(cameraYaw);
    var rightX = cosY2, rightZ = -sinY2;
    var fwdX2 = -sinY2, fwdZ2 = -cosY2;
    var tgx = camera.position.x - rightX * 1.2 + fwdX2 * 1.8;
    var tgz = camera.position.z - rightZ * 1.2 + fwdZ2 * 1.8;
    guide.root.position.x += (tgx - guide.root.position.x) * 0.1;
    guide.root.position.z += (tgz - guide.root.position.z) * 0.1;
    guide.root.rotation.y = Math.PI + cameraYaw;

    var kf2 = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
    var ks2 = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
    var jy2 = joystickDelta.y / JMAX;
    var jx2 = joystickDelta.x / JMAX;
    var isWalking = (kf2 !== 0 || ks2 !== 0 || Math.abs(jx2) > 0.1 || Math.abs(jy2) > 0.1);
    if (isWalking) guide.walkCycle += dt * 4;
    var wc = guide.walkCycle;
    guide.lHipG.rotation.x    =  Math.sin(wc) * 0.5;
    guide.rHipG.rotation.x    = -Math.sin(wc) * 0.5;
    guide.lKneeG.rotation.x   =  Math.max(0, -Math.sin(wc)) * 0.55;
    guide.rKneeG.rotation.x   =  Math.max(0,  Math.sin(wc)) * 0.55;
    guide.lShoulderG.rotation.x = -Math.sin(wc) * 0.4;
    guide.rShoulderG.rotation.x =  Math.sin(wc) * 0.4;
    guide.root.position.y = Math.abs(Math.sin(wc * 2)) * 0.025;

    // Billboard bubble to face camera
    if (guide.bMesh) {
      guide.bMesh.rotation.y = -guide.root.rotation.y + cameraYaw;
    }
  }

  renderer.render(scene, camera);
}

animate();

// ============================================================
//  RESIZE
// ============================================================
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
