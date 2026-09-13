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
- **Písma:** [Manrope](https://fonts.google.com/specimen/Manrope) (nadpisy),
  [Inter](https://fonts.google.com/specimen/Inter) (text),
  [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (kód) — z Google Fonts.
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
| `npm run new -- "Název článku"` | Založí rozepsaný článek v `src/posts/` (s dnešním datem a `draft: true`). |

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
| `src/_data/site.yaml` | **Konfigurace webu:** název, tagline, jazyk, adresa, téma kódu, menu, sociální sítě. |
| `src/_data/fonts.yaml` | **Písma** (Google Fonts + CSS rodiny). |
| `src/_includes/base.njk` | **Hlavní šablona** — mobilní lišta, boční panel (logo, menu, patička), obsah, přepínač den/noc. |
| `src/_includes/post.njk` | Šablona jednoho článku na blogu. |
| `src/_includes/poznamka.njk` | Šablona jedné poznámky (zápisku). |
| `src/index.njk` | **Úvodní stránka** (s fotkou lesa na pozadí). |
| `src/about.md` | Stránka **O mně** (v Markdownu). |
| `src/nyni.md` | Stránka **Nyní** — čím se právě zabýváš (v Markdownu). |
| `src/blog.njk` | **Výpis článků** + filtr podle štítků. |
| `src/posts/*.md` | Jednotlivé **články** (jeden soubor = jeden článek). |
| `src/posts/posts.json` | Nastavuje článkům šablonu a adresu `/blog/{nazev}/`. Neměň. |
| `src/poznamky.njk` | **Výpis poznámek** (ukazuje je celé pod sebou). |
| `src/poznamky/*.md` | Jednotlivé **poznámky** (jeden soubor = jeden zápisek). |
| `src/poznamky/poznamky.json` | Nastavuje poznámkám šablonu a adresu `/poznamky/{nazev}/`. Neměň. |
| `src/sitemap.njk`, `src/robots.njk` | Mapa webu a pokyny pro vyhledávače. Generují se samy, neměň. |
| `src/css/site.css` | **Vzhled a barvy.** |
| `src/img/` | Logo (`logo.svg`, `logo.png`) a fotky pozadí `background_*.jpg`. |
| `src/favicon.svg`, `src/favicon.ico` | Ikona webu v záložce prohlížeče. |
| `src/apps/` | Statické mini-aplikace (kopírují se 1:1), např. `/apps/timer/`, `/apps/password/`, `/apps/qr/`, `/apps/units/`, `/apps/wheel/` (kostky d4/d6/d8/d12/d20 jako 3D tělesa přes vendorovanou knihovnu three.js). |
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

### Přidat poznámku

Poznámka je **krátký zápisek** — pár vět. Je tu proto, aby přibývání obsahu neznamenalo
vždycky psát celý článek. Vytvoř soubor v `src/poznamky/`, třeba
`2026-09-03-o-mlze.md`, a do hlavičky stačí datum:

```yaml
---
date: 2026-09-03
---
```

Pak rovnou piš text. Čím se poznámka liší od článku:

| | Článek (`src/posts/`) | Poznámka (`src/poznamky/`) |
| --- | --- | --- |
| Titulek | povinný | **žádný** (hlavičkou je datum) |
| Excerpt, štítky | ano | ne |
| Kde se ukáže | `/blog/` jako odkaz | `/poznamky/` **celá**, pod sebou |
| Vlastní adresa | `/blog/{nazev}/` | `/poznamky/{nazev}/` |

Do RSS kanálu jdou obojí dohromady, seřazené podle data — čtenář má jednu adresu
`/feed.xml`. `draft: true` funguje u poznámek stejně jako u článků.

Chceš-li poznámce přece jen nadpis, napiš ho normálně do textu jako `## Nadpis`.

### Upravit stránku „O mně"

Uprav `src/about.md` (běžný Markdown).

Stránka je zatím **skrytá** — má v hlavičce `hidden: true`, takže není v menu,
nedostane se do `/sitemap.xml` a vyhledávačům říká `noindex`. Adresa `/o-mne/`
funguje (dá se poslat komu chceš), ale sama se nikde nenabízí. Až ji budeš chtít
zveřejnit:

1. smaž řádek `hidden: true` z `src/about.md`,
2. přidej do `nav` v `src/_data/site.yaml` položku `{ text: O mně, url: /o-mne/ }`.

`hidden: true` funguje na kterékoli stránce, ne jen na téhle.

### Upravit stránku „Nyní"

Uprav `src/nyni.md`. Je to krátká zpráva o tom, co je teď — čemu se věnuješ, co čteš.
Nemá to být seznam úkolů; klidně jen pár odstavců. **Datum poslední úpravy si přepiš
sám** v hlavičce (`updated: 2026-09-03`) — schválně se nedopočítává z data souboru,
aby se neměnilo při opravě překlepu.

Stránka je zatím **skrytá** (`hidden: true`), stejně jako „O mně". Zveřejni ji, až
budeš mít co napsat: smaž ten řádek a přidej do `nav` `{ text: Nyní, url: /nyni/ }`.

> **Čím se liší od poznámek.** „Nyní" se **přepisuje** — je tam vždycky jen současný
> stav, historie žádná. Poznámky se **vrší** a zůstávají. Zápisek „teď se učím Rust"
> je za rok pořád v pořádku, protože tehdy platil; na „Nyní" bys ho přepsal.
> Nevýhoda: stránka datem sama přiznává, když zestárne. Když ji nebudeš aspoň
> párkrát do roka přepisovat, je lepší ji nezveřejňovat a psát jen poznámky.

### Konfigurace webu — `src/_data/site.yaml`

Soubor `site.yaml` řídí název, adresu, menu, sociální sítě i téma kódu (písma jsou
zvlášť v `fonts.yaml` — viz níže). Píše se v **YAML**: jsou povolené komentáře `#`,
bez uvozovek a čárek.

```yaml
title: Ryutaro.cz
tagline: Osobní web
lang: cs-CZ
url: https://ryutaro.cz
codeTheme: gruvbox-dark-medium
codeThemeLight: gruvbox-light-medium
nav:
  - text: Domů
    url: /
  - text: Blog
    url: /blog/
social:
  - label: GitHub
    url: https://github.com/ritrik
    enabled: true
    icon: github
```

- **Menu (`nav`):**
  - běžná položka: `- text: Blog` + odsazené `url: /blog/`;
  - **nové okno / externí web:** přidej `newTab: true` — u takové položky se navíc
    ukáže ikonka „otevře se jinde";
  - **jen ikona** (bez textu): místo `text` dej `icon` (název Bootstrap Icons) a `label`,
    např. RSS: `url: /feed.xml`, `icon: rss-fill`, `label: RSS`, `newTab: true`;
  - **podmenu:** místo `url` dej `children:` s dalšími položkami — v panelu se z položky
    stane rozbalovací skupina (stav otevřeno/zavřeno se pamatuje mezi stránkami).

#### Sociální sítě (`social`)

Seznam `social`; zobrazí se jen položky s `enabled: true`. `icon` je **název ikony
z [Bootstrap Icons](https://icons.getbootstrap.com/)** (např. `github`, `linkedin`,
`mastodon`, `envelope`):

```yaml
social:
  - label: GitHub
    url: https://github.com/ritrik
    enabled: true
    icon: github
  - label: E-mail
    url: mailto:ahoj@ryutaro.cz
    enabled: false
    icon: envelope
```

Externí odkazy (`http…`) se otevřou v novém okně samy. U **interní** adresy (např. RSS
`url: /feed.xml`) přidej `newTab: true`, ať se taky otevře v nové záložce. U Mastodonu
lze přidat `rel: me noopener`.

#### Písma — `src/_data/fonts.yaml`

Písma jsou ve vlastním souboru `fonts.yaml` (v šablonách dostupná jako `fonts.*`). Na
jednom místě se řídí načtení z Google Fonts i dosazení do CSS:

```yaml
google:
  - name: Manrope
    spec: "Manrope:wght@400;500;600;700"
  - name: Inter
    spec: "Inter:ital,wght@0,400;0,600;0,700;1,400"
  - name: JetBrains Mono
    spec: "JetBrains+Mono:ital,wght@0,400;0,700;1,400"
headings: '"Manrope", -apple-system, sans-serif'  # nadpisy
text: '"Inter", -apple-system, sans-serif'        # běžný text
mono: '"JetBrains Mono", monospace'               # kód
```

Swap písma = uprav `spec` (dotaz [Google Fonts](https://fonts.google.com/); kvůli `:` a `@`
musí být v uvozovkách) a odpovídající rodinu (`headings`/`text`/`mono` — v jednoduchých
uvozovkách). Šablona z toho sama poskládá `<link>` i CSS proměnné
`--font-headings`/`--font-text`/`--font-mono`. (Role nadpisu/navigace lze doladit
proměnnými `--font-brand`/`--font-nav` v `site.css`.)

### Barvy a vzhled

Barevných **palet** je několik; vybíráš ji jedním slovem v `site.yaml`:

```yaml
palette: kamen
```

Na výběr (soubory v `src/css/palettes/`): `kamen`, `rez-a-orech`, `espresso-a-med`,
`indigo`, `mlzna-modra`. Každá paleta drží barvy pro noční i denní režim (CSS proměnné `--ground`,
`--content-*`, `--accent`, `--side-*`) a taky barvy **calloutů** `--callout-note` /
`--callout-tip` / `--callout-warning` (odstíny note/tip/warning, laděné ke každé paletě).
Vlastní paleta = zkopíruj soubor, uprav proměnné, nastav `palette` na jeho název.

Zbytek stylu (rozvržení, mezery, komponenty) je v `src/css/site.css`; callout pravidla tam
jen čtou proměnné z palety. Boční panel zůstává tmavý v **obou** režimech (signatura Hyde).

### Téma zvýraznění kódu

Zvýraznění kódu obstarává **Shiki** — obarvení se spočítá při buildu a zapíše rovnou
do stránky, takže se do prohlížeče neposílá žádný JavaScript navíc.

Bloky kódu se přepínají **spolu se zbytkem webu**, proto se v `site.yaml` nastavují
dva motivy:

```yaml
codeTheme: gruvbox-dark-medium        # noční režim
codeThemeLight: gruvbox-light-medium  # denní režim
```

Na výběr je **65 vestavěných motivů** (seznam na <https://shiki.style/themes>), mimo jiné
`dracula`, `monokai`, `nord`, `one-dark-pro`, `night-owl`, `material-theme-palenight`,
`dark-plus`. Nic se nekopíruje ani neupravuje — stačí přepsat název.

Bloky kódu mají i **čísla řádků** a **tlačítko Kopírovat** (ikonka vpravo nahoře po
najetí myší).

> Nový jazyk (```` ```kotlin ````) je potřeba doplnit do seznamu `langs`
> v `eleventy.config.js`. Neznámý jazyk se vypíše jako obyčejný text — build kvůli
> němu nespadne.

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

- **Responzivní obrázky:** při **produkčním** buildu se obrázky v článcích samy zmenší do více
  velikostí, převedou na `webp` a načítají se „líně" (rychlejší web). Stačí psát běžný Markdown
  `![popis](/img/soubor.jpg)` — o zbytek se postará plugin. (Logo je z toho vyňaté; v `npm run
  serve` se pro rychlost obrázky nezpracovávají a ukáže se originál.)
- **Popisek pod obrázkem (`<figure>`):** každý samostatný obrázek se automaticky obalí do
  `<figure>` — **HTML psát netřeba**. Popisek přidáš titulkem v uvozovkách za adresou:
  `![alt text](/img/foto.jpg "Tohle je popisek")` → popisek se zobrazí pod obrázkem
  (text v `alt` zůstává zvlášť, kvůli přístupnosti). Zarovnání obrázku zůstává přes třídy
  `img-left` / `img-right` / `img-center`.
- **RSS kanál:** web má feed na `/feed.xml` (odkaz je i v hlavičce stránky), takže se
  dá odebírat ve čtečkách. Generuje se sám z **článků i poznámek** dohromady, seřazených
  podle data. Otevřený přímo v prohlížeči se zobrazí **ostylovaný** (ne holé XML) díky
  XSLT stylu `src/feed.xsl`; čtečky styl ignorují.
- **Náhled při sdílení:** když někam pošleš odkaz na stránku, ukáže se název, popisek
  a obrázek. Popisek se bere z `description` v hlavičce stránky, obrázek je ve výchozím
  stavu fotka lesa. U konkrétní stránky se dá přebít klíčem `image` v hlavičce:
  ```yaml
  image: /img/jina-fotka.jpg
  ```
- **Vyhledávače:** `/sitemap.xml` (seznam stránek) a `/robots.txt` se generují samy,
  nic se v nich neudržuje ručně. Chybová stránka 404 se do mapy záměrně nedává.

---

## 8. Nasazení na web

1. Pošli změny do větve `main` (`git push`).
2. Workflow `.github/workflows/deploy.yml` web sestaví a nahraje na **GitHub Pages**.

**Jednorázové nastavení:** Settings → Pages → Source: **„GitHub Actions"**.
Doména `ryutaro.cz` přes `src/CNAME`. Pro projektovou adresu (`uzivatel.github.io/repo/`)
je potřeba `pathPrefix` v `eleventy.config.js`.

---

## 9. Dobré vědět

- **Z internetu (CDN)** se načítají Bootstrap Reboot, Bootstrap Icons a Google Fonts.
  Bootstrap Reboot a Icons mají **ověřovací SRI hash** (`integrity`) — když u nich zvýšíš verzi,
  vezmi nový hash z jsDelivr, jinak je prohlížeč přestane načítat. Google Fonts hash nemají
  (jejich CSS se generuje pokaždé jinak). Z Bootstrapu se bere jen **Reboot** (drobný reset
  stylů), ne celý framework — rozvržení i vzhled jsou vlastní v `src/css/site.css`. Bootstrap
  **JavaScript** se nenačítá vůbec, veškerá interaktivita je vlastní `src/js/site.js` — ten
  navíc dostává v produkci **automaticky generovaný** SRI hash (o hlídání verze se starat nemusíš).
- **Produkční build vs náhled:** `npm run build` (a nasazení) **minifikuje** HTML, CSS i JS
  a zpracuje obrázky. `npm run serve` je naopak **rychlý** — neminifikuje ani nezpracovává
  obrázky a servíruje čitelné zdroje (hodí se pro ladění). Interaktivita webu je v jednom souboru
  `src/js/site.js` (načítá se zvlášť, aby se cachoval napříč stránkami).
- **Ukázkové texty a články** jsou jen výplň — klidně je přepiš nebo smaž.
- **Každý článek** má nahoře i dole odkaz „← Zpět na blog" — přidává ho šablona
  `post.njk` automaticky, nemusíš ho psát.
- **Logo a favicon** je písmeno „R" na tmavém pozadí; logo je vektorové (`logo.svg`,
  písmeno převedené na křivky) s `logo.png` jako zálohou.
- Soubor `CLAUDE.md` jsou stručné instrukce pro AI asistenta; tahle příručka (`HELP.md`)
  je psaná pro člověka.
