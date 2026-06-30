// Vytvoří nový rozepsaný článek v src/posts/.
// Použití:  npm run new -- "Název článku"
// (z VS Code: Terminal → Run Task… → „Nový článek")
import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Použití: npm run new -- "Název článku"');
  process.exit(1);
}

// Bezdiakritický slug — stejná logika jako kotvy nadpisů v eleventy.config.js
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slug = slugify(title);
if (!slug) {
  console.error("Z názvu nešlo vytvořit slug — zkus jiný název.");
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const dir = path.join("src", "posts");
const file = path.join(dir, `${date}-${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`Soubor už existuje: ${file}`);
  process.exit(1);
}

// draft: true → článek je vidět jen v dev (npm run serve), na web se zatím nedostane.
const frontmatter = `---
title: ${title}
date: ${date}
excerpt:
draft: true
# tags:
#   - poznámka
---

`;

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, frontmatter, "utf8");
console.log(`Vytvořeno: ${file}`);
console.log("Je to koncept (draft: true) — po dopsání řádek draft smaž a článek se publikuje.");
