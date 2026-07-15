// Interaktivita webu Ryutaro (den/noc, rok v patičce, mobilní burger menu s focus-trapem,
// tlačítko Kopírovat u kódu, rozbalovací podmenu vč. zapamatování stavu).
// Externí soubor (cachovatelný napříč stránkami). No-flash skript zůstává inline v <head>.
// Bootstrap JS se nenačítá — podmenu je vlastní náhrada Collapse (viz níže).
(function () {
  var root = document.documentElement;

  var btn = document.getElementById("theme-toggle");
  if (btn) {
    var ico = btn.querySelector(".theme-ico");
    var render = function () {
      var dark = root.getAttribute("data-bs-theme") === "dark";
      ico.className = "theme-ico bi " + (dark ? "bi-sun-fill" : "bi-moon-stars-fill");
    };
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-bs-theme", next);
      localStorage.setItem("theme", next);
      render();
    });
    render();
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var burger = document.getElementById("nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var sidebar = document.getElementById("sidebar");

  var focusablesInSidebar = function () {
    if (!sidebar) return [];
    var sel = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(sidebar.querySelectorAll(sel), function (el) {
      return el.offsetParent !== null;
    });
  };
  var openNav = function () {
    document.body.classList.add("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    var f = focusablesInSidebar();
    if (f.length) f[0].focus();
  };
  var closeNav = function () {
    var wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.remove("nav-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      if (wasOpen) burger.focus();
    }
  };
  if (burger) {
    burger.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) closeNav();
      else openNav();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);
  document.querySelectorAll("a.sidebar-nav-item").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (!document.body.classList.contains("nav-open")) return;
    if (e.key === "Escape") { closeNav(); return; }
    if (e.key === "Tab") {
      var f = focusablesInSidebar();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll(".content pre").forEach(function (pre) {
    var code = pre.querySelector("code");
    if (!code) return;
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "code-copy";
    copyBtn.innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i>';
    copyBtn.setAttribute("aria-label", "Kopírovat kód");
    copyBtn.setAttribute("title", "Kopírovat kód");
    copyBtn.addEventListener("click", function () {
      var done = function (ok) {
        copyBtn.innerHTML = ok
          ? '<i class="bi bi-check-lg" aria-hidden="true"></i>'
          : '<i class="bi bi-x-lg" aria-hidden="true"></i>';
        copyBtn.classList.toggle("copied", ok);
        setTimeout(function () {
          copyBtn.innerHTML = '<i class="bi bi-copy" aria-hidden="true"></i>';
          copyBtn.classList.remove("copied");
        }, 1500);
      };
      var text = code.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });
    pre.appendChild(copyBtn);
  });

  // Rozbalovací podmenu v panelu — vlastní náhrada Bootstrap Collapse (jediné, co se
  // z Bootstrap JS používalo; bundle se proto už nenačítá). Vzhled i animaci dělají
  // hotové třídy z Bootstrap CSS: .collapse (sbaleno, display:none) / .collapsing
  // (přechod výšky) / .collapse.show (rozbaleno). Pořadí kroků odpovídá originálu.
  document.querySelectorAll(".sidebar-nav-group").forEach(function (group) {
    var key = group.getAttribute("data-nav-key");
    var panel = group.querySelector(".sidebar-subnav");
    var btn = group.querySelector(".sidebar-nav-toggle");
    if (!panel || !btn) return;

    // Obnovit zapamatovaný stav (bez animace); skupinu s aktivní stránkou otevírá šablona
    if (key && localStorage.getItem("nav-open:" + key) === "1" && !panel.classList.contains("show")) {
      panel.classList.add("show");
      btn.classList.remove("collapsed");
      btn.setAttribute("aria-expanded", "true");
    }

    // Po doběhnutí přechodu uklidit třídy; setTimeout je pojistka pro případ,
    // že přechod neproběhne (prefers-reduced-motion vypíná animace v Bootstrap CSS)
    var afterTransition = function (fn) {
      var ms = (parseFloat(getComputedStyle(panel).transitionDuration) || 0) * 1000;
      var done = false;
      var finish = function () { if (!done) { done = true; fn(); } };
      panel.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, ms + 50);
    };

    var animating = false;
    btn.addEventListener("click", function () {
      if (animating) return;
      animating = true;
      var open = panel.classList.contains("show");
      if (open) {
        // Sbalit: zafixovat aktuální výšku, reflow, pak přechod na 0 (výška z .collapsing)
        panel.style.height = panel.getBoundingClientRect().height + "px";
        void panel.offsetHeight;
        panel.classList.add("collapsing");
        panel.classList.remove("collapse", "show");
        panel.style.height = "";
        afterTransition(function () {
          panel.classList.remove("collapsing");
          panel.classList.add("collapse");
          animating = false;
        });
      } else {
        // Rozbalit: z 0 na výšku obsahu
        panel.classList.remove("collapse");
        panel.classList.add("collapsing");
        panel.style.height = panel.scrollHeight + "px";
        afterTransition(function () {
          panel.classList.remove("collapsing");
          panel.classList.add("collapse", "show");
          panel.style.height = "";
          animating = false;
        });
      }
      btn.classList.toggle("collapsed", open);
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      if (key) localStorage.setItem("nav-open:" + key, open ? "0" : "1");
    });
  });
})();
