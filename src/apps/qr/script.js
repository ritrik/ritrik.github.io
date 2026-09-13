// Generátor QR kódů — čistě klientský, žádné odesílání textu nikam.
// QR kódy počítá vendorovaná knihovna qrcode.js (kazuhikoarase/qrcode-generator, MIT);
// vykreslení do SVG je ale vlastní (přes isDark/getModuleCount), aby šly nastavit
// barvy a tvar bodů — knihovna sama kreslí jen pevně černou na bílé.

const textInput = document.getElementById("text");
const eclSelect = document.getElementById("ecl");
const sizeSelect = document.getElementById("size");
const styleSelect = document.getElementById("style");
const fgColorInput = document.getElementById("fg-color");
const bgColorInput = document.getElementById("bg-color");
const bgTransparentCheckbox = document.getElementById("bg-transparent");
const generateButton = document.getElementById("generate");
const errorEl = document.getElementById("error");
const outputEl = document.getElementById("output");
const qrHolder = document.getElementById("qr-holder");
const downloadLink = document.getElementById("download");

let lastQr = null;
let downloadUrl = null;

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

// qrcode.js vyžaduje typeNumber (1–40, určuje kapacitu) předem a při přetečení
// dat pro danou velikost vyhodí výjimku — zkoušíme od nejmenší, dokud to nesedí.
function buildQr(text, errorCorrectionLevel) {
  for (let typeNumber = 1; typeNumber <= 40; typeNumber++) {
    try {
      const qr = qrcode(typeNumber, errorCorrectionLevel);
      qr.addData(text);
      qr.make();
      return qr;
    } catch (err) {
      if (typeNumber === 40) throw err;
    }
  }
}

function renderQrSvg(qr, { cellSize, margin, fgColor, bgColor, transparentBg, dotStyle }) {
  const count = qr.getModuleCount();
  const size = count * cellSize + margin * 2;
  let shapes = "";

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue;
      const x = col * cellSize + margin;
      const y = row * cellSize + margin;
      if (dotStyle === "dots") {
        const r = cellSize / 2;
        shapes += `<circle cx="${x + r}" cy="${y + r}" r="${r * 0.85}"/>`;
      } else {
        shapes += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}"/>`;
      }
    }
  }

  const background = transparentBg
    ? ""
    : `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    background +
    `<g fill="${fgColor}">${shapes}</g>` +
    `</svg>`
  );
}

function render() {
  if (!lastQr) return;

  const cellSize = Number(sizeSelect.value);
  const svg = renderQrSvg(lastQr, {
    cellSize,
    margin: cellSize * 4,
    fgColor: fgColorInput.value,
    bgColor: bgColorInput.value,
    transparentBg: bgTransparentCheckbox.checked,
    dotStyle: styleSelect.value,
  });

  qrHolder.innerHTML = svg;

  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadUrl = URL.createObjectURL(blob);
  downloadLink.href = downloadUrl;
}

bgTransparentCheckbox.addEventListener("change", () => {
  bgColorInput.disabled = bgTransparentCheckbox.checked;
  render();
});
for (const control of [sizeSelect, styleSelect, fgColorInput, bgColorInput]) {
  control.addEventListener("input", render);
}

generateButton.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) {
    showError("Zadej text nebo odkaz.");
    outputEl.hidden = true;
    lastQr = null;
    return;
  }

  try {
    lastQr = buildQr(text, eclSelect.value);
  } catch {
    showError("Text je příliš dlouhý pro QR kód.");
    outputEl.hidden = true;
    lastQr = null;
    return;
  }

  showError("");
  outputEl.hidden = false;
  render();
});
