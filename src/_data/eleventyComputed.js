// Dopočítaná data pro všechny stránky.
//
// summary: šablona kanálu v @11ty/eleventy-plugin-rss vypisuje <summary> jen
// tehdy, když má článek v hlavičce klíč `summary`. My ale v článcích píšeme
// `excerpt` (používá ho i výpis na /blog/). Tohle je přemostění — v článcích
// se nic přepisovat nemusí. Ručně napsané `summary` má přednost.
//
// Proč to je tady v _data a ne jako posts.11tydata.js: v produkčním buildu se
// přes addExtension("js") zpracovávají VŠECHNY .js soubory ve src/ jako
// šablony (kvůli minifikaci). Datový soubor s příponou .js by se tím pádem
// pokusil vygenerovat vlastní stránku. Složka _data se jako šablony nezpracovává.
export default {
  summary: (data) => data.summary || data.excerpt,
};
