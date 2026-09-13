// Losovací kolo a kostky — čistě klientské losování, nic se nikam neodesílá.
// Výsledek (kdo/co vyhrálo, hozené číslo) se vždy losuje přes crypto.getRandomValues
// s rejection samplingem (stejný princip jako u generátoru hesel) — bez modulo
// zkreslení. Math.random() se používá jen pro kosmetické "míchání"/naklápění
// během animace, nikdy pro skutečný výsledek.
//
// 3D kostky běží na vendorované knihovně three.js (three.module.min.js +
// three.core.min.js, mrdoob/three.js, MIT) — d4/d6/d8/d12/d20 jsou skutečná
// tělesa (Platónská tělesa mají v three.js vestavěnou geometrii). d10
// (pětiboký trapezoedr) vestavěnou geometrii nemá a ruční definice by výrazně
// zvedla náročnost, takže zůstává jako ploché číslo (stejně jako dřív).
import * as THREE from "./three.module.min.js";

function randomIndex(max) {
  const range = 256 - (256 % max);
  const bytes = new Uint8Array(1);
  let value;
  do {
    crypto.getRandomValues(bytes);
    value = bytes[0];
  } while (value >= range);
  return value % max;
}

// --- Přepínání záložek ---------------------------------------------------

const tabButtons = document.querySelectorAll(".tab");
const panels = {
  wheel: document.getElementById("panel-wheel"),
  dice: document.getElementById("panel-dice"),
};

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    for (const b of tabButtons) b.classList.toggle("active", b === button);
    for (const [key, panel] of Object.entries(panels)) {
      panel.hidden = key !== button.dataset.tab;
    }
  });
}

// --- Kolo ------------------------------------------------------------------

const optionsInput = document.getElementById("options");
const wheelCanvas = document.getElementById("wheel-canvas");
const wheelSpin = document.getElementById("wheel-spin");
const spinButton = document.getElementById("spin-button");
const wheelError = document.getElementById("wheel-error");
const wheelResult = document.getElementById("wheel-result");
const wheelCtx = wheelCanvas.getContext("2d");

const WHEEL_COLORS = [
  { fill: "#ef4444", text: "#ffffff" },
  { fill: "#f97316", text: "#ffffff" },
  { fill: "#eab308", text: "#1c1c1e" },
  { fill: "#22c55e", text: "#ffffff" },
  { fill: "#06b6d4", text: "#ffffff" },
  { fill: "#3b82f6", text: "#ffffff" },
  { fill: "#8b5cf6", text: "#ffffff" },
  { fill: "#ec4899", text: "#ffffff" },
];

function getOptions() {
  return optionsInput.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function truncateLabel(label) {
  return label.length > 18 ? label.slice(0, 17) + "…" : label;
}

function drawWheel(options) {
  const size = wheelCanvas.width;
  const center = size / 2;
  const radius = center - 4;
  const sliceAngle = (2 * Math.PI) / options.length;

  wheelCtx.clearRect(0, 0, size, size);

  options.forEach((label, i) => {
    const start = -Math.PI / 2 + i * sliceAngle;
    const end = start + sliceAngle;
    const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

    wheelCtx.beginPath();
    wheelCtx.moveTo(center, center);
    wheelCtx.arc(center, center, radius, start, end);
    wheelCtx.closePath();
    wheelCtx.fillStyle = color.fill;
    wheelCtx.fill();

    wheelCtx.save();
    wheelCtx.translate(center, center);
    wheelCtx.rotate(start + sliceAngle / 2);
    wheelCtx.fillStyle = color.text;
    wheelCtx.font = `${Math.max(11, 16 - Math.floor(options.length / 3))}px system-ui, sans-serif`;
    wheelCtx.textAlign = "right";
    wheelCtx.textBaseline = "middle";
    wheelCtx.fillText(truncateLabel(label), radius - 12, 0);
    wheelCtx.restore();
  });
}

// Kolo je nakreslené tak, že úhel 0 (vršek, kde je ukazatel) odpovídá začátku
// první výseče. totalRotation se jen sčítá (nikdy neresetuje na malé číslo) —
// jinak by CSS transition při dalším točení skočila zpátky místo plynulé animace.
let totalRotation = 0;
let spinning = false;

function spin() {
  if (spinning) return;

  const options = getOptions();
  if (options.length < 2) {
    wheelError.textContent = "Zadej aspoň dvě možnosti.";
    wheelError.hidden = false;
    return;
  }
  wheelError.hidden = true;
  wheelResult.textContent = "";

  const winnerIndex = randomIndex(options.length);
  const sliceAngleDeg = 360 / options.length;
  const targetSliceCenter = winnerIndex * sliceAngleDeg + sliceAngleDeg / 2;

  const currentMod = ((totalRotation % 360) + 360) % 360;
  const desiredMod = ((-targetSliceCenter % 360) + 360) % 360;
  let delta = desiredMod - currentMod;
  if (delta <= 0) delta += 360;

  const extraSpins = 5 + randomIndex(4);
  totalRotation += extraSpins * 360 + delta;

  spinning = true;
  spinButton.disabled = true;
  wheelSpin.style.transform = `rotate(${totalRotation}deg)`;

  wheelSpin.addEventListener(
    "transitionend",
    () => {
      spinning = false;
      spinButton.disabled = false;
      wheelResult.textContent = "Vylosováno: " + options[winnerIndex];
    },
    { once: true }
  );
}

spinButton.addEventListener("click", spin);
optionsInput.addEventListener("input", () => {
  const options = getOptions();
  if (options.length >= 2) drawWheel(options);
});

drawWheel(getOptions());

// --- Kostky ------------------------------------------------------------------

const diceCountSelect = document.getElementById("dice-count");
const diceSidesSelect = document.getElementById("dice-sides");
const dice3dContainer = document.getElementById("dice-3d");
const diceCanvas = document.getElementById("dice-canvas");
const diceRow = document.getElementById("dice-row");
const diceResult = document.getElementById("dice-result");
const rollButton = document.getElementById("roll-button");

const FLAT_SIDES = 10; // d10 nemá v three.js vestavěnou geometrii, viz komentář nahoře

function showDiceResult(values) {
  diceResult.textContent =
    values.length > 1 ? `Součet: ${values.reduce((a, b) => a + b, 0)}` : "";
}

// --- Ploché "d10" (a startovní stav před prvním hodem) --------------------

function renderFlatDice(values) {
  diceRow.innerHTML = "";
  for (const value of values) {
    const die = document.createElement("div");
    die.className = "die";
    die.textContent = value;
    diceRow.append(die);
  }
}

function rollFlat(count, sides) {
  rollButton.disabled = true;
  let ticks = 0;
  const shuffle = setInterval(() => {
    // kosmetické "míchání" — skutečný výsledek se losuje až na konci přes randomIndex
    const preview = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
    renderFlatDice(preview);
    ticks++;
    if (ticks >= 8) {
      clearInterval(shuffle);
      const final = Array.from({ length: count }, () => 1 + randomIndex(sides));
      renderFlatDice(final);
      showDiceResult(final);
      rollButton.disabled = false;
    }
  }, 60);
}

// --- 3D kostky --------------------------------------------------------------

const diceScene = new THREE.Scene();
const diceCamera = new THREE.OrthographicCamera();
const CAMERA_POSITION = new THREE.Vector3(2.4, 3.2, 5);
const CAMERA_FACING = CAMERA_POSITION.clone().normalize();
diceCamera.position.copy(CAMERA_POSITION);
diceCamera.lookAt(0, 0, 0);

const diceRenderer = new THREE.WebGLRenderer({ canvas: diceCanvas, antialias: true, alpha: true });
diceRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

diceScene.add(new THREE.AmbientLight(0xffffff, 0.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(3, 5, 4);
diceScene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(-4, -2, -3);
diceScene.add(fillLight);

function resizeDiceRenderer() {
  const width = dice3dContainer.clientWidth;
  const height = dice3dContainer.clientHeight;
  if (!width || !height) return; // panel skrytý (display:none) — nemá smysl počítat rozměry
  diceRenderer.setSize(width, height, false);
  const aspect = width / height;
  const viewSize = 3.2;
  diceCamera.left = -viewSize * aspect;
  diceCamera.right = viewSize * aspect;
  diceCamera.top = viewSize;
  diceCamera.bottom = -viewSize;
  diceCamera.updateProjectionMatrix();
}
window.addEventListener("resize", () => {
  if (!panels.dice.hidden) {
    resizeDiceRenderer();
    diceRenderer.render(diceScene, diceCamera);
  }
});

// Geometrie a materiály jsou pro daný typ kostky vždy stejné (mění se jen
// natočení jednotlivých kostek), proto se cachují a sdílejí mezi kostkami v hodu.
const dieAssetsCache = new Map();

function makeFaceTexture(number, background) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), 64, 70);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Sestaví geometrii kostky a jednu texturovanou barevnou plochu na každou stěnu.
// Krychle má vlastní skupiny podle stran (BoxGeometry: px,nx,py,ny,pz,nz) —
// ostatní Platónská tělesa je potřeba přeskupit ručně: PolyhedronGeometry
// s detail=0 dává 1 trojúhelník na stěnu (čtyřstěn/osmistěn/dvacetistěn),
// dvanáctistěn 3 trojúhelníky na (pětiúhelníkovou) stěnu — ověřeno přímo na
// vygenerované geometrii, ne jen odhadem ze zdrojáku.
function buildDieAssets(sides) {
  if (dieAssetsCache.has(sides)) return dieAssetsCache.get(sides);

  let geometry;
  switch (sides) {
    case 4:
      geometry = new THREE.TetrahedronGeometry(0.95);
      break;
    case 6:
      geometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
      break;
    case 8:
      geometry = new THREE.OctahedronGeometry(1.05);
      break;
    case 12:
      geometry = new THREE.DodecahedronGeometry(1.0);
      break;
    case 20:
      geometry = new THREE.IcosahedronGeometry(1.05);
      break;
    default:
      throw new Error("Nepodporovaný typ kostky pro 3D: " + sides);
  }

  if (sides !== 6) {
    const vertsPerFace = sides === 12 ? 9 : 3;
    const faceCount = geometry.attributes.position.count / vertsPerFace;
    geometry.clearGroups();
    for (let i = 0; i < faceCount; i++) {
      geometry.addGroup(i * vertsPerFace, vertsPerFace, i);
    }
  }

  const faceCount = geometry.groups.length;
  const cubeColors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#ec4899"];

  const materials = [];
  const faceNormals = [];
  for (let i = 0; i < faceCount; i++) {
    const background = sides === 6 ? cubeColors[i] : `hsl(${Math.round((i / faceCount) * 360)}, 65%, 45%)`;
    materials.push(new THREE.MeshStandardMaterial({ map: makeFaceTexture(i + 1, background) }));

    const group = geometry.groups[i];
    const normal = new THREE.Vector3()
      .fromBufferAttribute(geometry.attributes.normal, group.start)
      .normalize();
    faceNormals.push(normal);
  }

  const assets = { geometry, materials, faceNormals };
  dieAssetsCache.set(sides, assets);
  return assets;
}

let dieMeshes = [];

function layoutDice(count, sides) {
  for (const mesh of dieMeshes) diceScene.remove(mesh);
  dieMeshes = [];

  const { geometry, materials, faceNormals } = buildDieAssets(sides);
  const restQuat = new THREE.Quaternion().setFromUnitVectors(faceNormals[0], CAMERA_FACING);

  const spacing = 2.3;
  const startX = -((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(startX + i * spacing, 0, 0);
    mesh.quaternion.copy(restQuat);
    diceScene.add(mesh);
    dieMeshes.push(mesh);
  }

  resizeDiceRenderer();
  diceRenderer.render(diceScene, diceCamera);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

const TUMBLE_MS = 900;
const SETTLE_MS = 700;
let diceAnimating = false;

function roll3d(sides) {
  const { faceNormals } = buildDieAssets(sides);
  const results = [];
  const start = performance.now();

  const animations = dieMeshes.map((mesh, i) => {
    const faceIndex = randomIndex(sides);
    results.push(faceIndex + 1);

    const align = new THREE.Quaternion().setFromUnitVectors(faceNormals[faceIndex], CAMERA_FACING);
    const spin = new THREE.Quaternion().setFromAxisAngle(CAMERA_FACING, Math.random() * Math.PI * 2);
    const targetQuat = spin.multiply(align); // align se aplikuje první, spin (kolem osy kamery) druhý

    const tumbleAxis = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    const tumbleTurns = 4 + Math.random() * 3;

    return {
      mesh,
      startQuat: mesh.quaternion.clone(),
      tumbleAxis,
      tumbleTurns,
      targetQuat,
      tumbleEndQuat: null,
      stagger: i * (40 + Math.random() * 60),
    };
  });

  diceAnimating = true;
  rollButton.disabled = true;

  function frame(now) {
    let stillRunning = false;

    for (const anim of animations) {
      const elapsed = now - start - anim.stagger;

      if (elapsed < 0) {
        stillRunning = true;
      } else if (elapsed < TUMBLE_MS) {
        stillRunning = true;
        const progress = elapsed / TUMBLE_MS;
        const spin = new THREE.Quaternion().setFromAxisAngle(
          anim.tumbleAxis,
          progress * anim.tumbleTurns * Math.PI * 2
        );
        anim.mesh.quaternion.copy(anim.startQuat).premultiply(spin);
        anim.tumbleEndQuat = anim.mesh.quaternion.clone();
      } else if (elapsed < TUMBLE_MS + SETTLE_MS) {
        stillRunning = true;
        const progress = easeOutCubic((elapsed - TUMBLE_MS) / SETTLE_MS);
        anim.mesh.quaternion.copy(anim.tumbleEndQuat).slerp(anim.targetQuat, progress);
      } else {
        anim.mesh.quaternion.copy(anim.targetQuat);
      }
    }

    diceRenderer.render(diceScene, diceCamera);

    if (stillRunning) {
      requestAnimationFrame(frame);
    } else {
      diceAnimating = false;
      rollButton.disabled = false;
      showDiceResult(results);
    }
  }

  requestAnimationFrame(frame);
}

// --- Společné zapojení ------------------------------------------------------

function refreshDiceDisplay() {
  const count = Number(diceCountSelect.value);
  const sides = Number(diceSidesSelect.value);
  const isFlat = sides === FLAT_SIDES;

  dice3dContainer.hidden = isFlat;
  diceRow.hidden = !isFlat;
  diceResult.textContent = "";

  if (isFlat) {
    renderFlatDice(Array.from({ length: count }, () => 1));
  } else {
    layoutDice(count, sides);
  }
}

diceCountSelect.addEventListener("change", refreshDiceDisplay);
diceSidesSelect.addEventListener("change", refreshDiceDisplay);

rollButton.addEventListener("click", () => {
  if (diceAnimating) return;
  const count = Number(diceCountSelect.value);
  const sides = Number(diceSidesSelect.value);
  if (sides === FLAT_SIDES) {
    rollFlat(count, sides);
  } else {
    roll3d(sides);
  }
});

for (const button of tabButtons) {
  if (button.dataset.tab === "dice") {
    button.addEventListener("click", refreshDiceDisplay);
  }
}
