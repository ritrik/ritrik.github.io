// Generátor hesel — čistě klientský, žádné odesílání hesel nikam.

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}",
};

const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("length-value");
const countInput = document.getElementById("count");
const generateButton = document.getElementById("generate");
const resultsList = document.getElementById("results");
const errorEl = document.getElementById("error");
const charsetsField = document.getElementById("charsets-field");
const algoInfo = document.getElementById("algo-info");
const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
const checkboxes = Object.fromEntries(
  Object.keys(CHARSETS).map((key) => [key, document.getElementById(key)])
);

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

// Vyslovitelné algoritmy portované z autorova WinForms generátoru
// (github.com/ritrik/PasswordGeneratorWinforms, PasswordGenerator.cs).
// Tvar hesel je stejný jako v originále, ale všude se používá stejné
// kryptograficky bezpečné náhodné číslo (randomIndex) jako u "Náhodných znaků" —
// originální "klasický" mód tam používal System.Random, což pro skutečná hesla
// nedává smysl nabízet jako volbu.
const ALGO_INFO = {
  random: "Náhodná kombinace vybraných znaků.",
  classic:
    "Souhláska+samohláska dokola, na konci dvě číslice, jedno velké písmeno. Délka musí být sudá.",
  secure:
    "Skládá se z bloků po 12 znacích (5× souhláska+samohláska, 2 číslice), velká písmena na pevných pozicích.",
  long: "Delší tvar s bloky čísel a jedním velkým písmenem uprostřed — vhodné i pro dlouhá hesla.",
};

const CLASSIC_CONSONANTS = "bcdfghjkmnprstvwxz";
const CLASSIC_VOWELS = "aeuy";

const CONSONANTS = "bdfghjklmnprstvz";
const VOWELS = "aeiou";
const DIGITS = "23456789";
const LETTERS = CONSONANTS + VOWELS;

// Aspoň jedna znaková sada musí zůstat zaškrtnutá — odškrtnutí poslední se vrátí zpět.
Object.values(checkboxes).forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const anyChecked = Object.values(checkboxes).some((c) => c.checked);
    if (!anyChecked) {
      checkbox.checked = true;
    }
  });
});

// Náhodný index 0..max-1 bez modulo zkreslení (rejection sampling nad crypto.getRandomValues).
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

function generatePassword(alphabet, length) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += alphabet[randomIndex(alphabet.length)];
  }
  return password;
}

function randomChar(chars) {
  return chars[randomIndex(chars.length)];
}

// "Klasické" — souhláska+samohláska dokola, 2 číslice na konci, 1 velké písmeno.
// Vyžaduje sudou délku aspoň 4 (jako originál); lichá se zaokrouhlí nahoru.
function generatePronounceableClassic(length) {
  if (length < 4) length = 4;
  if (length % 2 !== 0) length += 1;

  const halfLength = length / 2;
  const upperIndex = randomIndex(length - 3);

  let letters = "";
  for (let i = 1; i < halfLength; i++) {
    letters += randomChar(CLASSIC_CONSONANTS) + randomChar(CLASSIC_VOWELS);
  }
  const digits = randomChar(DIGITS.slice(0, 7)) + randomChar(DIGITS.slice(0, 7));

  const chars = (letters + digits).split("");
  chars[upperIndex] = chars[upperIndex].toUpperCase();
  return chars.join("");
}

function syllable() {
  return randomChar(CONSONANTS) + randomChar(VOWELS);
}

// Blok o 12 znacích: 5 slabik + 2 číslice, velká písmena na pozicích 0, 6, 10.
function generateBase12() {
  const s = [syllable(), syllable(), syllable(), syllable(), syllable()];
  const d1 = randomChar(DIGITS);
  const d2 = randomChar(DIGITS);
  s[0] = s[0][0].toUpperCase() + s[0][1];
  s[2] = s[2][0].toUpperCase() + s[2][1];
  s[4] = s[4][0].toUpperCase() + s[4][1];
  return s[0] + s[1] + d1 + d2 + s[2] + s[3] + s[4];
}

// "Bloky po 12" — skládá bloky za sebe a ořízne na požadovanou délku,
// velká písmena vynutí na pozicích 0, 6, 10 (stejně jako originál).
function generatePronounceableSecure(length) {
  let password = "";
  while (password.length < length) {
    password += generateBase12();
  }
  password = password.slice(0, length);

  const chars = password.split("");
  for (const pos of [0, 6, 10]) {
    if (pos < chars.length) chars[pos] = chars[pos].toUpperCase();
  }
  return chars.join("");
}

// "Dlouhé" — blok o 24 znacích (7 písmen + 4 číslice + malé/VELKÉ písmeno + 4 číslice + 7 písmen),
// pro delší hesla se prodlužuje po čtveřicích (slabika + číslice + písmeno).
function generatePronounceableLong(length) {
  const left = syllable() + syllable() + syllable() + randomChar(LETTERS);
  const midDigits1 = randomChar(DIGITS) + randomChar(DIGITS) + randomChar(DIGITS) + randomChar(DIGITS);
  const midLower = randomChar(LETTERS);
  const midUpper = randomChar(LETTERS).toUpperCase();
  const midDigits2 = randomChar(DIGITS) + randomChar(DIGITS) + randomChar(DIGITS) + randomChar(DIGITS);
  const right = syllable() + syllable() + syllable() + randomChar(LETTERS);
  const base = left + midDigits1 + midLower + midUpper + midDigits2 + right;

  if (length <= 24) {
    return base.slice(0, length);
  }

  let password = base;
  while (password.length < length) {
    password += syllable();
    if (password.length < length) password += randomChar(DIGITS);
    if (password.length < length) password += randomChar(LETTERS);
  }
  return password.slice(0, length);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  button.textContent = "Zkopírováno";
  button.classList.add("copied");
  setTimeout(() => {
    button.textContent = "Kopírovat";
    button.classList.remove("copied");
  }, 1500);
}

function renderResults(passwords) {
  resultsList.innerHTML = "";
  for (const password of passwords) {
    const li = document.createElement("li");

    const code = document.createElement("code");
    code.textContent = password;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Kopírovat";
    button.addEventListener("click", () => copyToClipboard(password, button));

    li.append(code, button);
    resultsList.append(li);
  }
}

function selectedAlgorithm() {
  return document.querySelector('input[name="algorithm"]:checked').value;
}

function updateAlgorithmUI() {
  const algorithm = selectedAlgorithm();
  algoInfo.textContent = ALGO_INFO[algorithm];
  charsetsField.hidden = algorithm !== "random";

  // Klasický mód vyžaduje sudou délku — posuvník se tomu přizpůsobí.
  lengthInput.step = algorithm === "classic" ? 2 : 1;
  if (algorithm === "classic" && Number(lengthInput.value) % 2 !== 0) {
    lengthInput.value = Number(lengthInput.value) + 1;
    lengthValue.textContent = lengthInput.value;
  }
}

algorithmRadios.forEach((radio) => {
  radio.addEventListener("change", updateAlgorithmUI);
});
updateAlgorithmUI();

generateButton.addEventListener("click", () => {
  const algorithm = selectedAlgorithm();
  const length = Number(lengthInput.value);
  const count = Math.min(20, Math.max(1, Number(countInput.value) || 1));
  countInput.value = count;

  let generate;
  if (algorithm === "random") {
    const alphabet = Object.entries(CHARSETS)
      .filter(([key]) => checkboxes[key].checked)
      .map(([, chars]) => chars)
      .join("");
    if (!alphabet) {
      showError("Vyber aspoň jednu sadu znaků.");
      return;
    }
    generate = () => generatePassword(alphabet, length);
  } else if (algorithm === "classic") {
    generate = () => generatePronounceableClassic(length);
  } else if (algorithm === "secure") {
    generate = () => generatePronounceableSecure(length);
  } else {
    generate = () => generatePronounceableLong(length);
  }

  showError("");
  const passwords = Array.from({ length: count }, generate);
  renderResults(passwords);
});

generateButton.click();
