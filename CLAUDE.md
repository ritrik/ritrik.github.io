# CLAUDE.md — ritrik-eleventy

Osobní web **Ryutaro** (doména `ryutaro.cz`). Statický web generovaný
**Eleventy v3** (ESM config) + **Bootstrap 5.3**, vzhled inspirovaný tématem **Hyde**:
pevný tmavý boční panel vlevo, obsah vpravo, přepínač **den/noc**. Na úzkých displejích
se panel schová do **burger menu** (horní lišta).

## Tón webu — důležité
Text na úvodní stránce **„Je tu tichá prázdnota / Možná jednou…"** je osobní
(pochází z autorova období deprese). Drž tón webu tichý a nezdobený — žádný
marketingový jazyk ani veselé ozdoby kolem této věty. Neber ji jako výplň k
„vylepšení". Zdrojový kód drž čistý a okomentovaný, ať si ho autor může sám upravovat.

## Konvence
Platí napříč stroji — autor pracuje na projektu z více počítačů, a tenhle soubor je
jediné, co se mezi nimi synchronizuje (přes git). Co má platit všude, patří sem,
ne do lokální paměti agenta.

- **Jazyk:** commit messages, komentáře ve zdrojácích, obsah webu i dokumentace jsou
  **česky**. Nový text piš česky, pokud si autor neřekne jinak.
- **Dvě dokumentace, obě aktuální:** `CLAUDE.md` je technická mapa pro agenta, `HELP.md`
  lidsky psaná příručka pro autora. Konfigurační údaje (písma, paleta, npm skripty) jsou
  opsané v obou → změna v `src/_data/*.yaml`, `src/css/palettes/` nebo v npm skriptech
  znamená úpravu **tří** souborů: config + `CLAUDE.md` + `HELP.md`. (Obojí se už jednou
  rozešlo se skutečností — rozešlá dokumentace je horší než žádná.)
- **Zdroje pravdy pro vzhled:** `src/_data/site.yaml` (paleta, témata Shiki, menu, sociální
  sítě) a `src/_data/fonts.yaml` (písma). Aktuální hodnoty čti odtud, ne ze šablon,
  ne ze `site.css` a ne z popisů v dokumentaci.

## Spuštění
```bash
npm install     # jednou
npm run serve   # dev server (http://localhost:8080, případně další volný port)
npm run build   # build do _site/
npm run clean   # smaže _site/
npm run new -- "Název článku"   # založí rozepsaný článek v src/posts/ (scripts/new-post.mjs)
```

## Kde co je
- `eleventy.config.js` — vstup `src/`, výstup `_site/`. Registruje:
  - **zvýraznění kódu** (Shiki, build-time; highlighter se vytváří jednou nahoře v configu
    a věší se na markdown-it přes `fromHighlighter` — obarvování je synchronní. Dvě témata
    naráz (`site.yaml → codeTheme` / `codeThemeLight`), jazyky se vyjmenovávají v `langs`,
    neznámý jazyk spadne na `fallbackLanguage: "text"`),
  - **RSS/Atom** kanál `@11ty/eleventy-plugin-rss` → `/feed.xml` (z kolekce `posts`;
    XSLT styl `src/feed.xsl` pro zobrazení v prohlížeči přes volbu `stylesheet`),
  - **responzivní obrázky** `@11ty/eleventy-img` (HTML transform: webp + `srcset` + lazy) — jen v produkci,
  - **rozšíření Markdownu** přes `amendLibrary("md", …)` — markdown-it: attrs, anchor
    (kotva = ikonka odkazu za nadpisem, `linkInsideHeader`), container (callouty
    note/tip/warning), mark, footnote, deflist, abbr, sub, sup, ins, emoji, task-lists,
    table-of-contents, mathjax3 (vzorce `$…$`/`$$…$$` → SVG), image-figures
    (samostatný obrázek → `<figure>`; titulek → `<figcaption>`).
  - **preprocessor `drafts`** — článek s `draft: true` se vyřadí z produkčního buildu
    (`ELEVENTY_RUN_MODE === "build"`), v dev (`serve`) je vidět s odznakem „Koncept".
  - kolekce `posts` a `tagList`, filtr `datumCZ`, bezdiakritický `slugify` pro kotvy nadpisů,
    transform `strip-eleventy-ignore` (úklid atributu po eleventy-img, vždy).
  - **produkce vs vývoj** (proměnná `isProd = ELEVENTY_RUN_MODE === "build"`, jedna sekce
    v configu): v **produkci** minifikace HTML (`html-minifier-terser`, i inline CSS/JS),
    CSS (`lightningcss`) a JS (`terser`) přes `addExtension` + zpracování obrázků; ve **vývoji**
    (`serve`/`watch`) se CSS/JS jen kopírují (passthrough) a obrázky se nezpracovávají → rychlejší serve.
- `src/_includes/base.njk` — **jediná hlavní šablona**: mobilní lišta s burgerem, boční
  panel (logo → název → tagline → nav → patička: sociální sítě + kredity), obsah. Přepínač
  den/noc (ukládá do `localStorage`). Rodiny písem se dosazují z `fonts.yaml` přes inline
  `<style>`. Interaktivita (den/noc, burger menu, kopírování kódu, submenu) je v externím
  `src/js/site.js`; inline v `<head>` zůstává jen krátký „no-flash" skript. Logo je `<picture>`
  (SVG + PNG fallback) s `eleventy:ignore`, aby ho eleventy-img nepřepsal. Front-matter
  `cover: true` zapne fotku lesa na pozadí (úvod).
- `src/_includes/post.njk` — šablona článku (odkaz „← Zpět na blog" nahoře i dole,
  titulek, datum, štítky, odznak „Koncept" u draftů).
- `src/css/site.css` — veškerý styl. Barvy jsou CSS proměnné pro `[data-bs-theme="dark"]`
  a `[data-bs-theme="light"]` (pozadí teple laděné). Boční panel zůstává tmavý v obou
  režimech. **Barvy palety** (`--ground/--content-*/--accent/--side-*` + barvy calloutů
  `--callout-note/tip/warning`) se sem nepíšou — jsou v `src/css/palettes/*.css`
  (vybírá `site.yaml → palette`). Callout pravidla v `site.css` čtou jen tyhle proměnné
  (s fallbackem). **Rodiny písem** (`--font-headings/--font-text/--font-mono`) taky ne —
  jsou v `fonts.yaml`.
- `src/css/palettes/*.css` — barevné palety (rez-a-orech, espresso-a-med, indigo, mlzna-modra, kamen),
  včetně barev calloutů note/tip/warning (laděné ke každé paletě);
  aktivní vybírá `site.yaml → palette`. Témata zvýraznění kódu **nemají vlastní soubory** —
  jsou vestavěná v Shiki (65 kusů), vybírají se názvem v `site.yaml → codeTheme`
  (tmavý režim) a `codeThemeLight` (světlý); bloky kódu se přepínají spolu s webem.
- `src/js/site.js` — interaktivita webu (den/noc, burger + focus-trap, kopírování kódu, submenu).
- `src/index.njk` (cover), `src/about.md` (O mně — **Markdown**), `src/blog.njk` (výpis +
  filtr štítků), `src/posts/*.md` (články; `posts/posts.json` → šablona + URL `/blog/{slug}/`).
- `src/_data/site.yaml` — název, tagline, jazyk, `url`, `palette`, `codeTheme`, `nav`, `social`
  (YAML; zapnuto přes `addDataExtension` + `js-yaml`). `src/_data/fonts.yaml` — písma (`fonts.*`).
- `src/img/` — logo (`logo.svg` + `logo.png`) a responzivní fotky `background_*.jpg`.
  Favicon: `src/favicon.svg` (+ `favicon.ico` jako záloha) a apple-touch icon.
- `src/apps/` — statické mini-aplikace (kopírují se 1:1), např. `/apps/timer/`.

## Časté úpravy
- **Nový článek:** `src/posts/RRRR-MM-DD-nazev.md` s hlavičkou `title`, `date`, `excerpt`,
  volitelně `tags`; `draft: true` = koncept (jen v dev). Objeví se automaticky ve výpisu
  blogu (od nejnovějšího), URL `/blog/{slug}/`.
- **Menu, sociální sítě, téma kódu:** v `src/_data/site.yaml`; **písma** v `src/_data/fonts.yaml`
  (detaily v `HELP.md`).
  Položka v `nav`: nové okno/externí = `"newTab": true`; jen ikona = `"icon"` + `"label"`
  (bez `text`); podmenu = `"children": [ … ]`. Položka v `social` se otevře v novém okně
  u externích (`http…`) adres, nebo přes `newTab: true` (kvůli interním jako `/feed.xml`).
- **Barvy / vzhled:** proměnné v `src/css/site.css`.
- **Text úvodní stránky:** `src/index.njk`.

## Nasazení
GitHub Actions workflow `.github/workflows/deploy.yml` (build na push do `main`).
V repu nastav **Settings → Pages → Source: GitHub Actions**. Staví se pro kořenovou
doménu (`src/CNAME` = `ryutaro.cz`). Pro projektovou stránku
(`uzivatel.github.io/repo/`) je potřeba `pathPrefix` v `eleventy.config.js`.

## Pozn.
- Z CDN se načítají **Bootstrap Reboot, Bootstrap Icons** (obojí s ručním `integrity`/SRI
  hashem z jsDelivr) a **Google Fonts** (aktuálně Manrope + Inter + JetBrains Mono, seznam
  drží `fonts.yaml`; bez SRI — ta CSS je generovaná per-request, hash by neseděl).
  Vlastní `/js/site.js` dostává v **produkci**
  automaticky generovaný SRI `integrity` (globální data `sriSiteJs` v configu, počítá se
  z minifikovaného výstupu → nikdy nezastará; v dev se atribut nevkládá, JS je nezminifikovaný).
  Z Bootstrapu se bere jen **Reboot** (`bootstrap-reboot.min.css` — reset: box-sizing,
  dědění fontu u tlačítek…), ne celý framework (grid/utility/komponenty nepoužíváme, vlastní
  CSS nestojí na `--bs-*`). Bootstrap **JS** se nenačítá vůbec — podmenu v panelu obsluhuje
  vlastní náhrada Collapse v `src/js/site.js`; její pár řádků CSS (`.collapse/.collapsing/.show`)
  je v `src/css/site.css`.
- Lidsky psaná příručka pro autora je `HELP.md`.
- Sesterská složka `../ritrik-bootstrap5/` = původní jednostránkový web povýšený na
  Bootstrap 5.3 (bez buildu). `../ritrik.github.io/` = původní živý web (needitovat).
