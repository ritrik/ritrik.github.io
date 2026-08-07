// Časovač 2 — odpočet do konce směny, živé hodiny, počasí. Čistý vanilla JS, bez knihoven.
//
// Volitelné parametry v URL:
//   ?until=HH:MM     odpočítávat do vlastního času (dnes, nebo zítra pokud už minul)
//                    např. /apps/timer2/?until=22:30
//   ?label=text      vlastní popisek místo „do HH:MM"
//   ?lat=..&lon=..   souřadnice pro počasí (výchozí Praha); ?place=Název jen pro popisek
//
// Bez parametru se chová jako původní verze: do 18:00 (je-li den 6–18), jinak do 6:00.

(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const untilStr = params.get("until");
  const labelParam = params.get("label");
  const lat = params.get("lat") || "50.0755"; // Praha
  const lon = params.get("lon") || "14.4378";

  const elCountdown = document.getElementById("countdown");
  const elTarget = document.getElementById("target");
  const elWeather = document.getElementById("weather");
  const elClock = document.getElementById("clock");

  // ---- Cíl odpočtu ---------------------------------------------------------

  // "HH:MM" → dnešní datum v ten čas; pokud už minul, posune se na zítřek.
  function parseUntil(str) {
    const m = /^(\d{1,2}):(\d{2})$/.exec((str || "").trim());
    if (!m) return null;
    const h = +m[1], min = +m[2];
    if (h > 23 || min > 59) return null;
    const t = new Date();
    t.setHours(h, min, 0, 0);
    if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
    return t;
  }

  // Původní logika směn: 6–18 → dnes 18:00; jinak nejbližší 6:00.
  function shiftTarget() {
    const now = new Date();
    const h = now.getHours();
    const t = new Date();
    if (h >= 6 && h < 18) {
      t.setHours(18, 0, 0, 0); // ve dne → konec denní směny
    } else {
      t.setHours(6, 0, 0, 0); // v noci → ráno v 6:00
      if (h >= 18) t.setDate(t.getDate() + 1); // po 18. → 6:00 až zítra
    }
    return t;
  }

  // Vrátí aktuální cíl (přepočítává se, aby po doběhnutí navázal další).
  function getTarget() {
    return (untilStr && parseUntil(untilStr)) || shiftTarget();
  }

  // Popisek cíle: „do 18:00"
  function setTargetLabel(target) {
    if (labelParam) { elTarget.textContent = labelParam; return; }
    const hh = String(target.getHours()).padStart(2, "0");
    const mm = String(target.getMinutes()).padStart(2, "0");
    elTarget.textContent = "do " + hh + ":" + mm;
  }

  let target = getTarget();
  setTargetLabel(target);

  // ---- Formátování a tik ---------------------------------------------------

  const pad = (n) => String(n).padStart(2, "0");

  function fmt(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return hh + ":" + pad(mm) + ":" + pad(ss);
  }

  function tick() {
    const now = Date.now();
    let remaining = target.getTime() - now;
    if (remaining <= 0) {
      // Doběhlo → spočítat další cíl (další směna / stejný čas zítra).
      target = getTarget();
      setTargetLabel(target);
      remaining = target.getTime() - now;
    }
    elCountdown.textContent = fmt(remaining);

    const d = new Date();
    elClock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  tick();
  setInterval(tick, 1000);

  // ---- Počasí (Open-Meteo, zdarma, bez klíče) ------------------------------

  const WMO = {
    0: "Jasno", 1: "Skoro jasno", 2: "Polojasno", 3: "Zataženo",
    45: "Mlha", 48: "Námraza",
    51: "Mrholení", 53: "Mrholení", 55: "Mrholení",
    56: "Namrzající mrholení", 57: "Namrzající mrholení",
    61: "Slabý déšť", 63: "Déšť", 65: "Silný déšť",
    66: "Namrzající déšť", 67: "Namrzající déšť",
    71: "Slabé sněžení", 73: "Sněžení", 75: "Husté sněžení",
    77: "Sněhové krupky",
    80: "Přeháňky", 81: "Přeháňky", 82: "Silné přeháňky",
    85: "Sněhové přeháňky", 86: "Sněhové přeháňky",
    95: "Bouřka", 96: "Bouřka s kroupami", 99: "Bouřka s kroupami",
  };

  // WMO kód → ikona z Bootstrap Icons. U jasno/polojasno rozlišuje den a noc.
  function weatherIcon(code, isDay) {
    if (code === 0) return isDay ? "bi-sun-fill" : "bi-moon-stars-fill";
    if (code === 1 || code === 2) return isDay ? "bi-cloud-sun-fill" : "bi-cloud-moon-fill";
    if (code === 3) return "bi-clouds-fill";
    if (code === 45 || code === 48) return "bi-cloud-fog2-fill";
    if (code >= 51 && code <= 57) return "bi-cloud-drizzle-fill";
    if (code >= 61 && code <= 64) return "bi-cloud-rain-fill";
    if (code >= 65 && code <= 67) return "bi-cloud-rain-heavy-fill";
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "bi-cloud-snow-fill";
    if (code >= 80 && code <= 82) return "bi-cloud-rain-fill";
    if (code >= 95) return "bi-cloud-lightning-rain-fill";
    return "bi-cloud-fill";
  }

  async function loadWeather() {
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
        "&longitude=" + lon + "&current=temperature_2m,weather_code,is_day&timezone=auto";
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const code = data.current.weather_code;
      const temp = Math.round(data.current.temperature_2m);
      const desc = WMO[code] || "";
      elWeather.innerHTML =
        '<i class="bi ' + weatherIcon(code, data.current.is_day === 1) + ' wx" aria-hidden="true"></i>' +
        "<span>" + temp + "°</span>";
      elWeather.setAttribute("aria-label", (desc + " " + temp + "°").trim());
      elWeather.title = desc; // slovní popis zůstává v titulku (najetí myší / čtečky)
    } catch (e) {
      elWeather.textContent = ""; // tiše skryté, když počasí nejde načíst
    }
  }

  loadWeather();
  setInterval(loadWeather, 10 * 60 * 1000); // obnova každých 10 minut

  // ---- Celá obrazovka + skrytí kurzoru -------------------------------------

  document.addEventListener("dblclick", function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  });

  // Kurzor zmizí po 3 s klidu, po pohybu se zase objeví.
  let idleTimer;
  function poke() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { document.body.classList.add("idle"); }, 3000);
  }
  document.addEventListener("mousemove", poke);
  poke();
})();
