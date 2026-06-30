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

// Bezdiakritický slug pro id nadpisů (česky → hezké kotvy)
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // odstraní diakritická znaménka
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function (eleventyConfig) {
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
    metadata: {
      language: "cs",
      title: "Ryutaro.cz",
      subtitle: "Články a poznámky",
      base: "https://ryutaro.cz/",
      author: { name: "Ryutaro" },
    },
  });

  // Responzivní obrázky: transformace zpracuje <img> ve výstupu (resize + webp + srcset).
  // Logo má v base.njk atribut eleventy:ignore, aby zůstalo jako <picture> se SVG.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [320, 640, 960, 1280],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 48em) 38rem, 100vw",
    },
  });

  // Úklid: eleventy-img u <img> uvnitř <picture> nechává po sobě atribut
  // „eleventy:ignore" (slouží jen k přeskočení transformace). Odstraníme ho z HTML.
  eleventyConfig.addTransform("strip-eleventy-ignore", function (content) {
    if (this.page && this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return content.replace(/\s+eleventy:ignore(="")?/g, "");
    }
    return content;
  });

  // Statické soubory kopírované 1:1 do _site
  eleventyConfig.addPassthroughCopy("src/css");
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
