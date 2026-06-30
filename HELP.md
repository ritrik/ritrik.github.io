# Příručka k webu Ryutaro

Návod, jak web funguje a jak ho upravovat — i bez znalosti Eleventy.
Stačí umět editovat textové soubory a spustit pár příkazů v terminálu.

---

## 1. Co to je

Osobní statický web **Ryutaro** (doména `ryutaro.cz`). „Statický" znamená, že
neběží žádná databáze ani server — z textových souborů ve složce `src/` se vždy
předem vygenerují hotové HTML stránky do složky `_site/`, a ty se nahrají na web.

- **Generátor:** [Eleventy](https://www.11ty.dev/) v3 (poskládá stránky ze šablon).
- **Vzhled:** [Bootstrap 5.3](https://getbootstrap.com/) + vlastní styl ve stylu tématu
  **Hyde** — pevný **tmavý boční panel vlevo**, obsah vpravo, **přepínač den/noc**.
  Na mobilu se panel schová do **burger menu**.
- **Písma:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (nadpisy),
  [PT Sans](https://fonts.google.com/specimen/PT+Sans) (text),
  [Cascadia Code](https://fonts.google.com/specimen/Cascadia+Code) (kód) — z Google Fonts.
- **Ikony:** [Bootstrap Icons](https://icons.getbootstrap.com/) (sociální sítě, tlačítka).
- **Texty stránek:** Markdown (`.md`) a Nunjucks šablony (`.njk`), s rozšířeným
  Markdownem (callouty, obsah, zvýraznění… viz část 6).

---

## 2. Spuštění na vlastním počítači

Potřebuješ nainstalovaný [Node.js](https://nodejs.org/). Pak v terminálu ve složce
projektu:

| Příkaz | Co dělá |
| --- | --- |
| `npm install` | Stáhne závislosti. Stačí spustit **jednou** (a po změně `package.json`). |
| `npm run serve` | Spustí dev server na **http://localhost:8080** se živým náhledem. |
| `npm run build` | Sestaví hotový web do složky `_site/`. |
| `npm run clean` | Smaže složku `_site/`. |

Při `npm run serve` se každá uložená změna v `src/` hned promítne v prohlížeči.

### Spouštění z VS Code (bez psaní příkazů)

Ve složce `.vscode/tasks.json` jsou připravené úlohy napojené na npm skripty —
**Terminal → Run Task…** (nebo `⌘⇧P` → „Tasks: Run Task"): **Build** (`⌘⇧B`),
**Serve (watch + dev server)**, **Clean**, **Rebuild (clean + build)**.

---

## 3. Mapa souborů

Co kde najdeš (vše podstatné je ve složce `src/`):

| Soubor / složka | K čemu slouží |
| --- | --- |
| `eleventy.config.js` | Nastavení Eleventy a pluginů (kód, RSS, obrázky, rozšíření Markdownu). Sem většinou není potřeba sahat. |
| `src/_data/site.json` | **Konfigurace webu:** název, tagline, jazyk, adresa, téma kódu, písma, menu, sociální sítě. |
| `src/_includes/base.njk` | **Hlavní šablona** — mobilní lišta, boční panel (logo, menu, patička), obsah, přepínač den/noc. |
| `src/_includes/post.njk` | Šablona jednoho článku na blogu. |
| `src/index.njk` | **Úvodní stránka** (s fotkou lesa na pozadí). |
| `src/about.md` | Stránka **O mně** (v Markdownu). |
| `src/blog.njk` | **Výpis článků** + filtr podle štítků. |
| `src/posts/*.md` | Jednotlivé **články** (jeden soubor = jeden článek). |
| `src/posts/posts.json` | Nastavuje článkům šablonu a adresu `/blog/{nazev}/`. Neměň. |
| `src/css/site.css` | **Vzhled a barvy.** |
| `src/css/code-themes/*.css` | **Tmavá témata zvýraznění kódu** (přepínají se v `site.json`). |
| `src/img/` | Logo (`logo.svg`, `logo.png`) a fotky pozadí `background_*.jpg`. |
| `src/favicon.svg`, `src/favicon.ico` | Ikona webu v záložce prohlížeče. |
| `src/apps/` | Statické mini-aplikace (kopírují se 1:1), např. `/apps/timer/`. |
| `src/CNAME` | Doména webu (`ryutaro.cz`). |

---

## 4. Časté úpravy — krok za krokem

### Přidat nový článek na blog

1. Vytvoř soubor v `src/posts/` pojmenovaný `RRRR-MM-DD-nazev.md`,
   např. `2026-07-01-muj-clanek.md`.
2. Na začátek vlož hlavičku (front-matter) mezi `---`:

   ```yaml
   ---
   title: Název článku
   date: 2026-07-01
   excerpt: Krátké shrnutí, které se ukáže ve výpisu na blogu.
   tags:
     - rust
     - poznámka
   ---
   ```

   `tags` jsou nepovinné — slouží k filtrování blogu (viz „Štítky" níže).
3. Pod hlavičku piš text v **Markdownu** (možnosti viz část 6).
4. Po uložení se článek **sám** objeví na `/blog/` (od nejnovějšího), URL `/blog/muj-clanek/`.

> Hotové vzory: `src/posts/2026-06-27-vitejte.md` a `…-formatovani.md` (přehled formátování).

### Štítky a filtrování blogu

- Na stránce **Blog** se nahoře samy objeví tlačítka se všemi použitými štítky;
  kliknutím se výpis vyfiltruje (běží v prohlížeči). Tlačítko **„Vše"** filtr zruší.
- Štítky u článku odkazují na blog vyfiltrovaný daným štítkem (`/blog/?tag=nazev`) —
  takový odkaz se dá i nasdílet.
- Sbírají se automaticky (kolekce `tagList`); nic se neudržuje ručně. Služební štítek
  `posts` se nezobrazuje, neměň ho.

### Koncepty (rozepsané články)

Dáš-li článku do hlavičky `draft: true`, je vidět **jen v lokálním náhledu**
(`npm run serve`) s odznakem **„Koncept"**, ale z produkčního buildu — a tím i z webu,
výpisu blogu a RSS — se vyřadí. Až je článek hotový, řádek `draft: true` smaž a článek
se publikuje. (Vzor: `src/posts/2026-06-28-rozepsany-koncept.md`.)

### Změnit text úvodní stránky

Uprav `src/index.njk`.

> ⚠️ **Tón webu.** Věta „Je tu tichá prázdnota / Možná jednou…" je osobní a záměrně
> tichá. Drž ji nezdobenou — žádný marketingový jazyk ani veselé ozdoby. (Viz `CLAUDE.md`.)

### Upravit stránku „O mně"

Uprav `src/about.md` (běžný Markdown).

### Konfigurace webu — `src/_data/site.json`

Jeden soubor řídí název, menu, písma, sociální sítě i téma kódu:

```json
{
  "title": "Ryutaro.cz",
  "tagline": "Osobní web",
  "lang": "cs-CZ",
  "url": "https://ryutaro.cz",
  "codeTheme": "vsdark",
  "fonts": { },
  "nav": [
    { "text": "Domů", "url": "/" },
    { "text": "O mně", "url": "/o-mne/" },
    { "text": "Blog", "url": "/blog/" }
  ],
  "social": [ ]
}
```

(Bloky `fonts` a `social` jsou rozepsané níže.)

- **Menu (`nav`):**
  - běžná položka: `{ "text": "Blog", "url": "/blog/" }`;
  - **nové okno / externí web:** přidej `"newTab": true` — u takové položky se navíc
    ukáže ikonka „otevře se jinde";
  - **jen ikona** (bez textu): místo `text` dej `"icon"` (název Bootstrap Icons) a
    `"label"`, např. RSS: `{ "url": "/feed.xml", "icon": "rss-fill", "label": "RSS", "newTab": true }`;
  - **podmenu:** místo `url` dej `"children": [ … ]` s dalšími položkami — v panelu se
    z položky stane rozbalovací skupina (stav otevřeno/zavřeno se pamatuje mezi stránkami).

#### Sociální sítě (`social`)

Pole `social`; zobrazí se jen položky s `"enabled": true`. `icon` je **název ikony
z [Bootstrap Icons](https://icons.getbootstrap.com/)** (např. `github`, `linkedin`,
`mastodon`, `envelope`):

```json
"social": [
  { "label": "GitHub", "url": "https://github.com/ritrik", "enabled": true, "icon": "github" },
  { "label": "E-mail", "url": "mailto:ahoj@ryutaro.cz", "enabled": false, "icon": "envelope" }
]
```

Externí odkazy (`http…`) se otevřou v novém okně samy; u Mastodonu lze přidat
`"rel": "me noopener"`.

#### Písma (`fonts`)

Tady se mění písma — na jednom místě (načtení z Google Fonts i dosazení do CSS):

```json
"fonts": {
  "google": [
    { "name": "Fraunces", "spec": "Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900" },
    { "name": "PT Sans", "spec": "PT+Sans:ital,wght@0,400;0,700;1,400" }
  ],
  "serif": "\"Fraunces\", Georgia, serif",
  "sans": "\"PT Sans\", -apple-system, sans-serif",
  "mono": "\"Cascadia Code\", monospace"
}
```

Swap písma = uprav `spec` (dotaz [Google Fonts](https://fonts.google.com/)) a odpovídající
rodinu (`serif`/`sans`/`mono`). Šablona z toho sama poskládá `<link>` i CSS proměnné.
(Role nadpisu/navigace lze doladit proměnnými `--font-brand`/`--font-nav` v `site.css`.)

### Barvy a vzhled

V `src/css/site.css`. Barvy jsou **CSS proměnné** zvlášť pro oba režimy:

```css
[data-bs-theme="dark"]  { /* barvy pro noční režim */ }
[data-bs-theme="light"] { /* barvy pro denní režim */ }
```

Boční panel zůstává tmavý v **obou** režimech (signatura tématu Hyde).

### Téma zvýraznění kódu

Bloky kódu mají vlastní tmavé téma. Přepneš ho **jedním slovem** v `site.json`:

```json
"codeTheme": "vsdark"
```

Na výběr (soubory v `src/css/code-themes/`): `vsdark`, `monokai`, `gruvbox`, `dracula`,
`onedark`, `nightowl`, `nord`, `palenight`. Vlastní téma = zkopíruj soubor, uprav barvy,
nastav `codeTheme` na jeho název. Bloky kódu mají i **čísla řádků** a **tlačítko
Kopírovat** (ikonka vpravo nahoře po najetí myší).

---

## 5. Jak funguje přepínač den/noc

- Skript v `<head>` (`base.njk`) nastaví režim **před vykreslením** (bez probliknutí):
  1. uložená volba (`localStorage`), jinak 2. nastavení systému, jinak 3. výchozí **tmavý**.
- Tlačítko se sluníčkem / měsícem (ikona z Bootstrap Icons) vlevo nahoře přepíná
  `data-bs-theme` a volbu si pamatuje. Volba se ukládá **jen lokálně v prohlížeči**
  (žádné sledování — proto není potřeba cookie lišta). Výchozí režim změníš ve skriptu
  u slova `"dark"`.

---

## 6. Pokročilejší Markdown

Kromě běžného Markdownu (nadpisy, **tučně**, *kurzíva*, seznamy, odkazy, obrázky,
tabulky, ```` ```jazyk ```` bloky kódu) jsou zapnutá tato rozšíření:

| Prvek | Zápis | Výsledek |
| --- | --- | --- |
| Třída / id k prvku | `text {.page-meta}` | `<p class="page-meta">` |
| Kotvy nadpisů | `## Nadpis` | `id` + ikonka odkazu při najetí myší |
| Obsah článku | `[[toc]]` | seznam odkazů na nadpisy |
| Callout | `:::note … :::` | rámeček (`note` / `tip` / `warning`) |
| Zvýraznění | `==text==` | `<mark>` |
| Poznámka pod čarou | `text[^1]` + `[^1]: …` | footnote |
| Definiční seznam | `Pojem` / `: popis` | `<dl>` |
| Zkratka | `*[ZKR]: význam` | `<abbr>` s tooltipem |
| Dolní / horní index | `H~2~O`, `x^2^` | `<sub>` / `<sup>` |
| Vložený text | `++text++` | `<ins>` |
| Emoji | `:tada:` | 🎉 |
| Zaškrtávací seznam | `- [x] hotovo` | checkbox |
| Matematika | `$E=mc^2$` nebo `$$…$$` | vzorce (vykreslené jako SVG) |

Živá ukázka všeho je v článku **„Možnosti formátování"** (`src/posts/…-formatovani.md`).
Obrázky lze zarovnat třídami `img-left` / `img-right` / `img-center`.

---

## 7. Obrázky a RSS

- **Responzivní obrázky:** obrázky v článcích se při buildu samy zmenší do více velikostí,
  převedou na `webp` a načítají se „líně" (rychlejší web). Stačí psát běžný Markdown
  `![popis](/img/soubor.jpg)` — o zbytek se postará plugin. (Logo je z toho vyňaté.)
- **Popisek pod obrázkem (`<figure>`):** každý samostatný obrázek se automaticky obalí do
  `<figure>` — **HTML psát netřeba**. Popisek přidáš titulkem v uvozovkách za adresou:
  `![alt text](/img/foto.jpg "Tohle je popisek")` → popisek se zobrazí pod obrázkem
  (text v `alt` zůstává zvlášť, kvůli přístupnosti). Zarovnání obrázku zůstává přes třídy
  `img-left` / `img-right` / `img-center`.
- **RSS kanál:** blog má feed na `/feed.xml` (odkaz je i v hlavičce stránky), takže se
  dá odebírat ve čtečkách. Generuje se sám z článků.

---

## 8. Nasazení na web

1. Pošli změny do větve `main` (`git push`).
2. Workflow `.github/workflows/deploy.yml` web sestaví a nahraje na **GitHub Pages**.

**Jednorázové nastavení:** Settings → Pages → Source: **„GitHub Actions"**.
Doména `ryutaro.cz` přes `src/CNAME`. Pro projektovou adresu (`uzivatel.github.io/repo/`)
je potřeba `pathPrefix` v `eleventy.config.js`.

---

## 9. Dobré vědět

- **Z internetu (CDN) bez ověřovacích SRI hashů** se načítají Bootstrap, Bootstrap Icons
  a Google Fonts. Když je budeš chtít ověřené, doplň atribut `integrity`.
- **Ukázkové texty a články** jsou jen výplň — klidně je přepiš nebo smaž.
- **Každý článek** má nahoře i dole odkaz „← Zpět na blog" — přidává ho šablona
  `post.njk` automaticky, nemusíš ho psát.
- **Logo a favicon** je písmeno „R" v písmu Fraunces na tmavém pozadí; logo je vektorové
  (`logo.svg`) s `logo.png` jako zálohou.
- Soubor `CLAUDE.md` jsou stručné instrukce pro AI asistenta; tahle příručka (`HELP.md`)
  je psaná pro člověka.
