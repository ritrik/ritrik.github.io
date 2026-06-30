---
title: Rozepsaný koncept
date: 2026-06-28
excerpt: Ukázkový rozepsaný článek (draft) — vidíš ho jen v lokálním náhledu, na web se nedostane.
draft: true
tags:
  - návod
---

Tenhle článek má v hlavičce `draft: true`, takže:

- v `npm run serve` (lokální náhled) je **vidět** — můžeš ho v klidu psát a prohlížet,
- v `npm run build` (produkce, i GitHub Actions) se **vyřadí** — na živý web se nedostane,
- díky tomu zmizí i z výpisu blogu, filtru štítků a z RSS.

Až bude hotový, smaž řádek `draft: true` z hlavičky a článek se publikuje. Tenhle
ukázkový soubor můžeš klidně smazat.
