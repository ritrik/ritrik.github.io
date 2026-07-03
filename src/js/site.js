// Interaktivita webu Ryutaro (den/noc, rok v patičce, mobilní burger menu s focus-trapem,
// tlačítko Kopírovat u kódu, zapamatování rozbaleného submenu).
// Externí soubor (cachovatelný napříč stránkami). No-flash skript zůstává inline v <head>.
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

  document.querySelectorAll(".sidebar-nav-group").forEach(function (group) {
    var key = group.getAttribute("data-nav-key");
    var target = group.querySelector(".sidebar-subnav");
    var btn = group.querySelector(".sidebar-nav-toggle");
    if (!target) return;
    if (key && localStorage.getItem("nav-open:" + key) === "1" && !target.classList.contains("show")) {
      target.classList.add("show");
      if (btn) { btn.classList.remove("collapsed"); btn.setAttribute("aria-expanded", "true"); }
    }
    if (key) {
      target.addEventListener("shown.bs.collapse", function () { localStorage.setItem("nav-open:" + key, "1"); });
      target.addEventListener("hidden.bs.collapse", function () { localStorage.setItem("nav-open:" + key, "0"); });
    }
  });
})();
