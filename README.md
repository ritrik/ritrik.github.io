# Ryutaro web

Osobní web postavený na statickém generátoru [Eleventy](https://www.11ty.dev/)
s **Bootstrap 5.3** a vzhledem inspirovaným tématem [Hyde](https://github.com/poole/hyde):
pevný tmavý boční panel vlevo, klidná plocha na obsah vpravo a přepínač **den/noc**.

- **Domů** – fotka mlžného lesa s textem „Je tu tichá prázdnota / Možná jednou…"
- **O mně** – stránka o autorovi
- **Blog** – výpis článků (Markdown)

## Spuštění lokálně

```bash
npm install        # jednou na začátku
npm run serve      # vývojový server na http://localhost:8080
npm run build      # sestaví web do složky _site/
```

## Struktura

```
src/
├── _data/site.json     # název, tagline, jazyk, položky menu
├── _includes/
│   ├── base.njk        # hlavní šablona (boční panel + obsah + přepínač den/noc)
│   └── post.njk        # šablona jednoho článku
├── css/site.css        # veškerý vlastní styl (paleta, layout, cover, blog)
├── img/                # loga a responzivní fotky pozadí
├── index.njk           # úvodní stránka (cover s fotkou)
├── about.njk           # O mně
├── blog.njk            # výpis blogu
└── posts/              # jednotlivé články (.md)
    ├── posts.json      # společné nastavení článků (šablona, URL)
    └── 2026-06-27-vitejte.md
```

## Časté úpravy

- **Text úvodní stránky:** `src/index.njk`.
- **Menu / název / tagline:** `src/_data/site.json`.
- **Barvy a vzhled:** `src/css/site.css` (proměnné `--ground`, `--accent`, …
  zvlášť pro tmavý a světlý režim).
- **Nový článek:** přidej `.md` soubor do `src/posts/` s hlavičkou `title`,
  `date`, `excerpt` (viz ukázkový článek). Objeví se automaticky ve výpisu blogu.
- **Výměna fotek pozadí:** nahraď soubory `src/img/background_*.jpg`
  (stejné názvy a poměry stran).

## Den/noc

Přepínač v bočním panelu přepíná atribut `data-bs-theme` na `<html>`
(nativní barevné režimy Bootstrapu 5.3). Volba se ukládá do `localStorage`,
výchozí stav respektuje nastavení systému (`prefers-color-scheme`).
Boční panel zůstává tmavý v obou režimech – přepíná se hlavně plocha s obsahem.

## Nasazení na GitHub Pages

V repozitáři nastav **Settings → Pages → Source: GitHub Actions**.
Workflow `.github/workflows/deploy.yml` pak při každém pushi do `main` web
sestaví a nasadí.

Web se staví pro kořenovou doménu (custom doména `ryutaro.cz` přes soubor
`src/CNAME`). Pokud bys ho nasazoval jako *projektovou* stránku na adresu
`uzivatel.github.io/nazev-repa/`, je potřeba nastavit `pathPrefix` v
`eleventy.config.js` a předat ho i příkazu při buildu.

## Písma

Nadpisy používají **Abril Fatface**, text **PT Sans** (Google Fonts, jako v Hyde).
Pokud bys nechtěl závislost na Google Fonts, dají se písma stáhnout a hostovat
přímo z `src/`.
