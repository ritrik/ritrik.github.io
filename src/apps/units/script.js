// Převodník jednotek — čistě klientský výpočet, nic se nikam neodesílá.
// Běžné jednotky převedené na společný základ (SI), teplota má vlastní vzorce.

const CATEGORIES = {
  length: {
    label: "Délka",
    units: {
      mm: { label: "milimetry (mm)", factor: 0.001 },
      cm: { label: "centimetry (cm)", factor: 0.01 },
      m: { label: "metry (m)", factor: 1 },
      km: { label: "kilometry (km)", factor: 1000 },
      in: { label: "palce (in)", factor: 0.0254 },
      ft: { label: "stopy (ft)", factor: 0.3048 },
      yd: { label: "yardy (yd)", factor: 0.9144 },
      mi: { label: "míle (mi)", factor: 1609.344 },
    },
  },
  mass: {
    label: "Hmotnost",
    units: {
      mg: { label: "miligramy (mg)", factor: 0.000001 },
      g: { label: "gramy (g)", factor: 0.001 },
      kg: { label: "kilogramy (kg)", factor: 1 },
      t: { label: "tuny (t)", factor: 1000 },
      oz: { label: "unce (oz)", factor: 0.0283495 },
      lb: { label: "libry (lb)", factor: 0.453592 },
    },
  },
  volume: {
    label: "Objem",
    units: {
      ml: { label: "mililitry (ml)", factor: 0.001 },
      l: { label: "litry (l)", factor: 1 },
      m3: { label: "metry krychlové (m³)", factor: 1000 },
      galUs: { label: "americké galony (gal)", factor: 3.785411784 },
      flOzUs: { label: "americké unce tekuté (fl oz)", factor: 0.0295735295625 },
    },
  },
  area: {
    label: "Plocha",
    units: {
      mm2: { label: "milimetry čtvereční (mm²)", factor: 0.000001 },
      cm2: { label: "centimetry čtvereční (cm²)", factor: 0.0001 },
      m2: { label: "metry čtvereční (m²)", factor: 1 },
      km2: { label: "kilometry čtvereční (km²)", factor: 1000000 },
      ha: { label: "hektary (ha)", factor: 10000 },
      acre: { label: "akry (ac)", factor: 4046.8564224 },
    },
  },
  speed: {
    label: "Rychlost",
    units: {
      mps: { label: "metry za sekundu (m/s)", factor: 1 },
      kmh: { label: "kilometry za hodinu (km/h)", factor: 1 / 3.6 },
      mph: { label: "míle za hodinu (mph)", factor: 0.44704 },
      knot: { label: "uzly (kn)", factor: 0.514444 },
    },
  },
  data: {
    label: "Data",
    units: {
      b: { label: "bajty (B)", factor: 1 },
      kb: { label: "kilobajty (KB)", factor: 1024 },
      mb: { label: "megabajty (MB)", factor: 1024 ** 2 },
      gb: { label: "gigabajty (GB)", factor: 1024 ** 3 },
      tb: { label: "terabajty (TB)", factor: 1024 ** 4 },
    },
  },
  temperature: {
    label: "Teplota",
    special: true,
    units: {
      c: {
        label: "stupně Celsia (°C)",
        toBase: (v) => v + 273.15,
        fromBase: (k) => k - 273.15,
      },
      f: {
        label: "stupně Fahrenheita (°F)",
        toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
        fromBase: (k) => ((k - 273.15) * 9) / 5 + 32,
      },
      k: {
        label: "kelviny (K)",
        toBase: (v) => v,
        fromBase: (k) => k,
      },
    },
  },
};

const categorySelect = document.getElementById("category");
const convertRow = document.getElementById("convert-row");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const valueInput = document.getElementById("value");
const resultOutput = document.getElementById("result");
const swapButton = document.getElementById("swap");

const colorRow = document.getElementById("color-row");
const colorPicker = document.getElementById("color-picker");
const colorPreview = document.getElementById("color-preview");
const hexValue = document.getElementById("hex-value");
const rgbValue = document.getElementById("rgb-value");
const hslValue = document.getElementById("hsl-value");
const alphaSlider = document.getElementById("alpha-value");
const alphaOutput = document.getElementById("alpha-output");

function convert(categoryKey, fromKey, toKey, value) {
  const category = CATEGORIES[categoryKey];
  const from = category.units[fromKey];
  const to = category.units[toKey];
  if (category.special) {
    return to.fromBase(from.toBase(value));
  }
  return (value * from.factor) / to.factor;
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return "";
  const rounded = Number(n.toPrecision(10));
  return rounded.toLocaleString("cs-CZ", { maximumFractionDigits: 10 });
}

function populateUnitSelect(select, categoryKey, preferredKey) {
  const units = CATEGORIES[categoryKey].units;
  select.innerHTML = "";
  for (const [key, unit] of Object.entries(units)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = unit.label;
    select.append(option);
  }
  if (preferredKey && units[preferredKey]) {
    select.value = preferredKey;
  }
}

function populateCategoryUnits(categoryKey) {
  const keys = Object.keys(CATEGORIES[categoryKey].units);
  populateUnitSelect(fromSelect, categoryKey, keys[0]);
  populateUnitSelect(toSelect, categoryKey, keys[1] ?? keys[0]);
}

function recompute() {
  const value = parseFloat(valueInput.value);
  if (Number.isNaN(value)) {
    resultOutput.textContent = "";
    return;
  }
  const result = convert(categorySelect.value, fromSelect.value, toSelect.value, value);
  resultOutput.textContent = formatNumber(result);
}

// --- Barvy (HEX/RGB/HSL) ---------------------------------------------

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Přijímá #rgb, #rgba, #rrggbb i #rrggbbaa — alfa chybí-li, je 1 (plně krycí).
function hexToRgba(str) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(str.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((c) => c + c).join("");
  }
  const num = parseInt(hex.slice(0, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a };
}

function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// 6místný hex je-li barva plně krycí (zpětně kompatibilní výstup), jinak 8místný s alfa bajtem.
function rgbaToHex({ r, g, b, a }) {
  const base = rgbToHex({ r, g, b });
  if (a >= 1) return base;
  return base + Math.round(a * 255).toString(16).padStart(2, "0");
}

function parseRgbaString(str) {
  const match = /^(?:rgba?\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+)(%)?)?/i.exec(
    str.trim()
  );
  if (!match) return null;
  let a = 1;
  if (match[4] !== undefined) {
    a = match[5] ? Number(match[4]) / 100 : Number(match[4]);
  }
  return {
    r: clamp(Number(match[1]), 0, 255),
    g: clamp(Number(match[2]), 0, 255),
    b: clamp(Number(match[3]), 0, 255),
    a: clamp(a, 0, 1),
  };
}

function formatRgba({ r, g, b, a }) {
  return a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${round2(a)})`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function parseHslaString(str) {
  const match = /^(?:hsla?\(\s*)?(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?(?:\s*,\s*([\d.]+)(%)?)?/i.exec(
    str.trim()
  );
  if (!match) return null;
  let a = 1;
  if (match[4] !== undefined) {
    a = match[5] ? Number(match[4]) / 100 : Number(match[4]);
  }
  return {
    h: Number(match[1]),
    s: clamp(Number(match[2]), 0, 100),
    l: clamp(Number(match[3]), 0, 100),
    a: clamp(a, 0, 1),
  };
}

function formatHsla({ h, s, l, a }) {
  return a >= 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${round2(a)})`;
}

function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let seg;
  if (h < 60) seg = [c, x, 0];
  else if (h < 120) seg = [x, c, 0];
  else if (h < 180) seg = [0, c, x];
  else if (h < 240) seg = [0, x, c];
  else if (h < 300) seg = [x, 0, c];
  else seg = [c, 0, x];
  return {
    r: Math.round((seg[0] + m) * 255),
    g: Math.round((seg[1] + m) * 255),
    b: Math.round((seg[2] + m) * 255),
  };
}

// Sdílený stav aktuální barvy (RGB + alfa) — všechna pole se dopočítávají odtud,
// takže posuvník průhlednosti může měnit jen "a" a zachovat zbytek beze změny.
let currentColor = { r: 51, g: 102, b: 255, a: 1 };

// Aktualizuje barevná pole podle currentColor, kromě pole, ze kterého uživatel
// zrovna píše — jinak by mu to během psaní přepisovalo kurzor.
function renderColor(source) {
  const c = currentColor;
  const hsl = rgbToHsl(c);

  if (source !== "picker") colorPicker.value = rgbToHex(c);
  if (source !== "hex") hexValue.value = rgbaToHex(c);
  if (source !== "rgb") rgbValue.value = formatRgba(c);
  if (source !== "hsl") hslValue.value = formatHsla({ ...hsl, a: c.a });
  if (source !== "alpha") alphaSlider.value = Math.round(c.a * 100);

  alphaOutput.textContent = Math.round(c.a * 100) + " %";
  colorPreview.style.setProperty("--preview-color", formatRgba(c));
}

colorPicker.addEventListener("input", () => {
  const rgb = hexToRgba(colorPicker.value);
  if (rgb) {
    currentColor = { ...rgb, a: currentColor.a };
    renderColor("picker");
  }
});
hexValue.addEventListener("input", () => {
  const rgba = hexToRgba(hexValue.value);
  if (rgba) {
    currentColor = rgba;
    renderColor("hex");
  }
});
rgbValue.addEventListener("input", () => {
  const rgba = parseRgbaString(rgbValue.value);
  if (rgba) {
    currentColor = rgba;
    renderColor("rgb");
  }
});
hslValue.addEventListener("input", () => {
  const hsla = parseHslaString(hslValue.value);
  if (hsla) {
    currentColor = { ...hslToRgb(hsla), a: hsla.a };
    renderColor("hsl");
  }
});
alphaSlider.addEventListener("input", () => {
  currentColor = { ...currentColor, a: Number(alphaSlider.value) / 100 };
  renderColor("alpha");
});

// --- Zapojení kategorií -------------------------------------------------

for (const [key, category] of Object.entries(CATEGORIES)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = category.label;
  categorySelect.append(option);
}
const colorsOption = document.createElement("option");
colorsOption.value = "colors";
colorsOption.textContent = "Barvy (HEX/RGB/HSL)";
categorySelect.append(colorsOption);

categorySelect.addEventListener("change", () => {
  const isColors = categorySelect.value === "colors";
  convertRow.hidden = isColors;
  colorRow.hidden = !isColors;
  if (!isColors) {
    populateCategoryUnits(categorySelect.value);
    recompute();
  }
});
fromSelect.addEventListener("change", recompute);
toSelect.addEventListener("change", recompute);
valueInput.addEventListener("input", recompute);
swapButton.addEventListener("click", () => {
  const from = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = from;
  recompute();
});

populateCategoryUnits(categorySelect.value);
recompute();
renderColor(null);
