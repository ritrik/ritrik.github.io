// Konfigurace Eleventy (v3, ESM).
// Vstup: src/  →  výstup: _site/
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownItAttrs from "markdown-it-attrs";
import markdownItAnchor from "markdown-it-anchor";
import markdownItContainer from "markdown-it-container";
import markdownItMark from "markdown-it-mark";
import markdownItFootnote from "markdown-it-footnote";
import markdownItDeflist from "markdown-it-deflist";
import markdownItAbbr from "markdown-it-abbr";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import markdownItIns from "markdown-it-ins";
import { full as markdownItEmoji } from "markdown-it-emoji";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItToc from "markdown-it-table-of-contents";
import markdownItMathjax3 from "markdown-it-mathjax3";
import markdownItImageFigures from "markdown-it-image-figures";
import { load as yamlLoad } from "js-yaml";
import { minify } from "html-minifier-terser";
import { transform as lightningcss } from "lightningcss";
import { minify as minifyJs } from "terser";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Bezdiakritický slug pro id nadpisů (česky → hezké kotvy)
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // odstraní diakritická znaménka
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function (eleventyConfig) {
  // Produkční build (`npm run build`) vs vývoj (`npm run serve`/`--watch`).
  // V dev vynecháme drahé kroky (minifikace, zpracování obrázků) → rychlejší náhled.
  const isProd = process.env.ELEVENTY_RUN_MODE === "build";

  // Datové soubory v _data smí být i YAML (.yaml/.yml), nejen JSON.
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yamlLoad(contents));

  // Rozšíření Markdownu (markdown-it pluginy). Nemění výchozí parser, jen ho doplní:
  //  - attrs:     třídy/id/atributy   →  Pár slov {.page-meta}
  //  - anchor:    klikací kotvy u nadpisů (deep-linking)
  //  - container: bloky :::note / :::tip / :::warning  →  <div class="callout callout-…">
  //  - mark:      ==zvýraznění==      →  <mark>
  //  - footnote:  poznámky pod čarou  →  text[^1]
  //  - deflist:   definiční seznamy   →  <dl>
  //  - abbr:      zkratky             →  *[ZKR]: význam  →  <abbr>
  //  - sub/sup:   dolní/horní index   →  H~2~O, x^2^
  //  - ins:       vložený text        →  ++text++
  //  - emoji:     :tada: → 🎉
  //  - task-lists: - [x] hotovo
  //  - toc:       [[toc]] → obsah článku z nadpisů (využívá id z anchor)
  //  - mathjax3:  matematika $…$ / $$…$$ → SVG při buildu (soběstačné, bez CDN)
  eleventyConfig.amendLibrary("md", (md) => {
    md.use(markdownItAttrs);
    md.use(markdownItAnchor, {
      slugify,
      // Za text nadpisu vloží ikonku odkazu (Bootstrap Icons); zobrazí se až po najetí myší (CSS)
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: '<i class="bi bi-link-45deg" aria-hidden="true"></i>',
        placement: "after",
        class: "header-anchor",
        ariaHidden: true,
      }),
    });
    for (const name of ["note", "tip", "warning"]) {
      md.use(markdownItContainer, name, {
        render(tokens, idx) {
          return tokens[idx].nesting === 1
            ? `<div class="callout callout-${name}">\n`
            : "</div>\n";
        },
      });
    }
    md.use(markdownItMark);
    md.use(markdownItFootnote);
    md.use(markdownItDeflist);
    md.use(markdownItAbbr);
    md.use(markdownItSub);
    md.use(markdownItSup);
    md.use(markdownItIns);
    md.use(markdownItEmoji);
    md.use(markdownItTaskLists);
    md.use(markdownItToc, { includeLevel: [2, 3], containerClass: "toc" });
    md.use(markdownItMathjax3);
    // Samostatný obrázek obalí do <figure>; s titulkem `![alt](src "Popisek")`
    // přidá <figcaption> (alt zůstává pro přístupnost). Není potřeba psát HTML.
    md.use(markdownItImageFigures, { figcaption: true });
  });

  // Drafty (rozepsané články): článek s "draft: true" v hlavičce je vidět v dev
  // (npm run serve), ale vyřadí se z produkčního buildu (npm run build / GitHub Actions).
  // Protože se soubor odstraní, zmizí sám i z výpisu blogu, štítků a RSS.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // Zvýraznění syntaxe v blocích kódu (```jazyk … ```).
  // Obarvení se počítá při buildu (Prism). Barvy řeší zvolené téma v
  // src/css/code-themes/ (viz site.yaml → codeTheme), čísla řádků a tlačítko
  // Kopírovat jsou v src/css/site.css + base.njk.
  // alwaysWrapLineHighlights zabalí KAŽDÝ řádek do <span class="highlight-line">,
  // což využívají čísla řádků.
  eleventyConfig.addPlugin(syntaxHighlight, {
    alwaysWrapLineHighlights: true,
  });

  // RSS/Atom kanál blogu → /feed.xml (z kolekce „posts")
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 0 },
    // XSLT styl pro hezké zobrazení kanálu v prohlížeči (soubor viz src/feed.xsl)
    stylesheet: "/feed.xsl",
    metadata: {
      language: "cs",
      title: "Ryutaro.cz",
      subtitle: "Články a poznámky",
      base: "https://ryutaro.cz/",
      author: { name: "Ryutaro" },
    },
  });

  // Úklid: eleventy-img u <img> uvnitř <picture> nechává po sobě atribut
  // „eleventy:ignore" (slouží jen k přeskočení transformace). Odstraníme ho z HTML (vždy).
  eleventyConfig.addTransform("strip-eleventy-ignore", function (content) {
    if (this.page && this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return content.replace(/\s+eleventy:ignore(="")?/g, "");
    }
    return content;
  });

  // ===== Produkce vs vývoj =====
  // Produkce (`npm run build`): minifikace HTML/CSS/JS + zpracování obrázků (webp + srcset).
  // Vývoj (`npm run serve`/`--watch`): CSS/JS se jen kopírují (bez minifikace, čitelné zdroje)
  // a obrázky se nezpracovávají → rychlejší serve; v obsahu se ukáže originál z /img.
  if (isProd) {
    // Responzivní obrázky (logo má v base.njk eleventy:ignore, zůstává <picture> se SVG)
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
      formats: ["webp", "jpeg"],
      widths: [320, 640, 960, 1280],
      defaultAttributes: {
        loading: "lazy",
        decoding: "async",
        sizes: "(min-width: 48em) 38rem, 100vw",
      },
    });

    // Minifikace HTML (i inline CSS/JS). Kód v <pre> zůstává nedotčený.
    eleventyConfig.addTransform("html-minify", async function (content) {
      if (this.page && this.page.outputPath && this.page.outputPath.endsWith(".html")) {
        return await minify(content, { useShortDoctype: true, collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true });
      }
      return content;
    });

    // Minifikace CSS (lightningcss) a JS (terser) přes „addExtension" — výstupní cesty (/css, /js) zůstávají.
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", {
      outputFileExtension: "css",
      compile: async (content, inputPath) => {
        return async () => {
          const { code } = lightningcss({ filename: inputPath, code: Buffer.from(content), minify: true });
          return code.toString();
        };
      },
    });
    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", {
      outputFileExtension: "js",
      compile: async (content) => {
        return async () => {
          const { code } = await minifyJs(content); // výchozí volby (viz i sriSiteJs)
          return code;
        };
      },
    });
  } else {
    // Vývoj: CSS/JS jen zkopírovat 1:1 (bez minifikace)
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
  }

  // SRI hash vlastního /js/site.js → v šabloně jako {{ sriSiteJs }} (viz base.njk).
  // Jen v produkci: v dev se JS neminifikuje, měl by jiné bajty a prohlížeč by skript
  // s nesedícím hashem zablokoval → v dev vrací false a atribut se nevloží.
  // Počítá se z minifikovaného výstupu (stejné terser volání jako addExtension výše) při
  // každém buildu, takže hash nikdy nezastará. site.js je same-origin → crossorigin netřeba.
  eleventyConfig.addGlobalData("sriSiteJs", async () => {
    if (!isProd) return false;
    const raw = await readFile("src/js/site.js", "utf8");
    const { code } = await minifyJs(raw);
    return "sha384-" + createHash("sha384").update(code).digest("base64");
  });

  // Statické soubory kopírované 1:1 do _site
  eleventyConfig.addPassthroughCopy("src/feed.xsl");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/apps");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon-precomposed.png");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Kolekce článků (blog), seřazená od nejnovějšího
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date);
  });

  // Seznam unikátních štítků napříč články (bez služebního štítku "posts").
  // Použije ho filtr na stránce blogu. Řazeno abecedně (česky).
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    for (const post of collectionApi.getFilteredByTag("posts")) {
      for (const tag of post.data.tags || []) {
        if (tag !== "posts") tags.add(tag);
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b, "cs"));
  });

  // Formátování data článků pro češtinu (např. „27. června 2026").
  // Intl (cs-CZ) dá měsíc správně ve 2. pádě (genitiv); timeZone "UTC", aby se den
  // neposunul (data v hlavičce jsou půlnoc UTC).
  eleventyConfig.addFilter("datumCZ", (date) =>
    new Date(date).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
  );

  // Datum pro atribut <time datetime="…"> — články mají jen datum (bez času),
  // proto YYYY-MM-DD (plný timestamp s půlnocí UTC by byl jen artefakt).
  eleventyConfig.addFilter("datumISO", (date) =>
    new Date(date).toISOString().slice(0, 10)
  );
  // Původní řešení (ruční názvy měsíců) — nezávislé na ICU datech běhového prostředí.
  // Kdyby Intl/cs-CZ nebylo k dispozici, odkomentuj tohle a smaž verzi výše:
  // const MESICE = [
  //   "ledna", "února", "března", "dubna", "května", "června",
  //   "července", "srpna", "září", "října", "listopadu", "prosince",
  // ];
  // eleventyConfig.addFilter("datumCZ", (date) => {
  //   const d = new Date(date);
  //   return `${d.getDate()}. ${MESICE[d.getMonth()]} ${d.getFullYear()}`;
  // });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // .njk i .md se renderují přes Nunjucks
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
}
