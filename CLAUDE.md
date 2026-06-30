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

## Spuštění
```bash
npm install     # jednou
npm run serve   # dev server (http://localhost:8080, případně další volný port)
npm run build   # build do _site/
```

## Kde co je
- `eleventy.config.js` — vstup `src/`, výstup `_site/`. Registruje:
  - **syntax highlight** (Prism, build-time; `alwaysWrapLineHighlights` kvůli číslům řádků),
  - **RSS/Atom** kanál `@11ty/eleventy-plugin-rss` → `/feed.xml` (z kolekce `posts`),
  - **responzivní obrázky** `@11ty/eleventy-img` (HTML transform: webp + `srcset` + lazy),
  - **rozšíření Markdownu** přes `amendLibrary("md", …)` — markdown-it: attrs, anchor
    (kotva = ikonka odkazu za nadpisem, `linkInsideHeader`), container (callouty
    note/tip/warning), mark, footnote, deflist, abbr, sub, sup, ins, emoji, task-lists,
    table-of-contents, mathjax3 (vzorce `$…$`/`$$…$$` → SVG), image-figures
    (samostatný obrázek → `<figure>`; titulek → `<figcaption>`).
  - **preprocessor `drafts`** — článek s `draft: true` se vyřadí z produkčního buildu
    (`ELEVENTY_RUN_MODE === "build"`), v dev (`serve`) je vidět s odznakem „Koncept".
  - kolekce `posts` a `tagList`, filtr `datumCZ`, bezdiakritický `slugify` pro kotvy nadpisů,
    transform `strip-eleventy-ignore` (úklid atributu po eleventy-img).
- `src/_includes/base.njk` — **jediná hlavní šablona**: mobilní lišta s burgerem, boční
  panel (logo → název → tagline → nav → patička: sociální sítě + kredity), obsah. Přepínač
  den/noc (ukládá do `localStorage`). Rodiny písem se dosazují z `fonts.yaml` přes inline
  `<style>`. Logo je `<picture>` (SVG + PNG fallback) s `eleventy:ignore`, aby ho
  eleventy-img nepřepsal. Front-matter `cover: true` zapne fotku lesa na pozadí (úvod).
- `src/_includes/post.njk` — šablona článku (odkaz „← Zpět na blog" nahoře i dole,
  titulek, datum, štítky, odznak „Koncept" u draftů).
- `src/css/site.css` — veškerý styl. Barvy jsou CSS proměnné pro `[data-bs-theme="dark"]`
  a `[data-bs-theme="light"]` (pozadí teple laděné). Boční panel zůstává tmavý v obou
  režimech. **Rodiny písem (`--serif/--sans/--cascadia`) se sem nepíšou** — jsou v `fonts.yaml`.
- `src/css/code-themes/*.css` — tmavá témata zvýraznění kódu; aktivní vybírá
  `site.yaml → codeTheme` (výchozí `vsdark`).
- `src/index.njk` (cover), `src/about.md` (O mně — **Markdown**), `src/blog.njk` (výpis +
  filtr štítků), `src/posts/*.md` (články; `posts/posts.json` → šablona + URL `/blog/{slug}/`).
- `src/_data/site.yaml` — název, tagline, jazyk, `url`, `codeTheme`, `nav`, `social` (YAML;
  zapnuto přes `addDataExtension` + `js-yaml`). `src/_data/fonts.yaml` — písma (`fonts.*`).
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
  (bez `text`); podmenu = `"children": [ … ]`.
- **Barvy / vzhled:** proměnné v `src/css/site.css`.
- **Text úvodní stránky:** `src/index.njk`.

## Nasazení
GitHub Actions workflow `.github/workflows/deploy.yml` (build na push do `main`).
V repu nastav **Settings → Pages → Source: GitHub Actions**. Staví se pro kořenovou
doménu (`src/CNAME` = `ryutaro.cz`). Pro projektovou stránku
(`uzivatel.github.io/repo/`) je potřeba `pathPrefix` v `eleventy.config.js`.

## Pozn.
- Z CDN bez SRI hashů se načítají **Bootstrap, Bootstrap Icons** a **Google Fonts**
  (Fraunces + PT Sans + Cascadia Code). Když je budeš chtít ověřené, doplň `integrity`.
- Lidsky psaná příručka pro autora je `HELP.md`.
- Sesterská složka `../ritrik-bootstrap5/` = původní jednostránkový web povýšený na
  Bootstrap 5.3 (bez buildu). `../ritrik.github.io/` = původní živý web (needitovat).
