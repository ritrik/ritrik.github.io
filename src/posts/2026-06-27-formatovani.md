---
title: Možnosti formátování
date: 2026-06-27
excerpt: Přehled toho, co se dá v článcích použít — text, nadpisy, seznamy, citace, obrázky (i se zarovnáním a popiskem), tabulky a zvýrazněný zdrojový kód.
tags:
  - návod
  - formátování
  - obrázky
  - kód
---

Tenhle článek je živá ukázka formátování, které tu máš k dispozici. Píše se vše
v **Markdownu**, u obrázků a složitějších věcí se dá použít i kousek HTML.

[[toc]]

## Text

Běžný odstavec může být **tučný**, *kurzíva*, `vsazený kód` nebo
[odkaz](/blog/). Pomlčky, uvozovky „a podobné" se sázejí normálně.

> Citace vypadá takhle — odsazená barevným proužkem.
> Hodí se na zvýraznění myšlenky nebo úryvku.

## Seznamy

Odrážkový seznam:

- první položka
- druhá položka
  - vnořená položka
- třetí položka

Číslovaný seznam:

1. připrav text
2. ulož soubor
  a. ulož ho správně
3. hotovo

## Obrázky

Každý samostatný obrázek se vloží běžným zápisem a automaticky se obalí do `<figure>`:

```markdown
![Mlžný les](/img/background_768.jpg)
```

![Mlžný les](/img/background_768.jpg)

**Popisek pod obrázkem** přidáš titulkem v uvozovkách za adresou — HTML netřeba:

```markdown
![Mlžný les za úsvitu](/img/background_768.jpg "Les v ranní mlze — popisek z titulku.")
```

![Mlžný les za úsvitu](/img/background_768.jpg "Les v ranní mlze — popisek z titulku obrázku.")

Obrázek lze i **obtékat textem** pomocí třídy `img-left` / `img-right` / `img-center`
(kousek HTML přímo v Markdownu):

```html
<img class="img-left" src="/img/background_768.jpg" alt="Náhled lesa" width="320" />
```

<img class="img-left" src="/img/background_768.jpg" alt="Náhled lesa" width="320" />

Lorem i běžný text může pokračovat vedle obrázku — odstavec je dost dlouhý na to,
aby bylo obtékání vidět. Když potřebuješ obrázek na střed, použij třídu
`img-center`; pro obtékání zprava `img-right`. Po obtékaném obrázku stačí
pokračovat dalším odstavcem a layout se srovná.

## Zdrojový kód

Krátký kód v textu se píše do zpětných apostrofů: `npm run serve`. Delší ukázky
do bloku se zapíšou mezi tři zpětné apostrofy s názvem jazyka:

````markdown
```javascript
console.log("Ahoj, světe!");
```
````

Blok se sám obarví, dostane **čísla řádků** a po najetí myší ikonku pro
**zkopírování** vpravo nahoře:

```javascript
// Pozdrav podle denní doby
function pozdrav(hodina) {
  if (hodina < 12) return "Dobré ráno";
  if (hodina < 18) return "Dobrý den";
  return "Dobrý večer";
}

console.log(pozdrav(9)); // → "Dobré ráno"
```

Funguje to pro spoustu jazyků — třeba Python:

```python
# Druhé mocniny sudých čísel
squares = [n * n for n in range(10) if n % 2 == 0]
print(squares)  # [0, 4, 16, 36, 64]
```

…nebo CSS:

```css
.tlacitko {
  color: var(--accent);
  border-radius: 0.5rem;
}
```

## Tabulky

Tabulky se zapisují svislítky; na úzkém displeji jdou vodorovně posouvat:

<div class="table-wrap">

| Formát | Zápis | Výsledek |
| --- | --- | --- |
| Tučně | `**text**` | **text** |
| Kurzíva | `*text*` | *text* |
| Kód | `` `kód` `` | `kód` |
| Odkaz | `[text](url)` | [text](/) |

</div>

## Pokročilejší prvky

Přes markdown-it pluginy jdou i věci nad rámec běžného Markdownu. U každé je nejprve
**zápis**, pod ním **výsledek**.

**Zvýraznění**

```markdown
==takhle==
```

==takhle==

**Třída / id k prvku** (ve složených závorkách za prvkem — `Pár slov {.page-meta}`
udělá z odstavce `<p class="page-meta">`):

```markdown
Pár slov {.page-meta}
```

**Callouty** (`note` / `tip` / `warning`)

```markdown
:::note
Poznámka — užitečný dovětek k textu.
:::
```

:::note
Poznámka — užitečný dovětek k textu.
:::

:::tip
Tip — drobná rada navíc.
:::

:::warning
Varování — na tohle si dej pozor.
:::

**Poznámka pod čarou**

```markdown
…odkaz v textu[^1]

[^1]: Text poznámky.
```

…ukázka odkazu v textu.[^1]

**Obsah a kotvy nadpisů:** zápisem `[[toc]]` vložíš obsah složený z nadpisů; každý
nadpis navíc sám dostane kotvu s ikonkou odkazu (objeví se po najetí myší).

**Zaškrtávací seznam**

```markdown
- [x] hotová položka
- [ ] nehotová položka
```

- [x] hotová položka
- [ ] nehotová položka

**Definiční seznam**

```markdown
Eleventy
: generátor statického webu
```

Eleventy
: generátor statického webu

**Dolní/horní index, zkratky a emoji**

```markdown
voda je H~2~O, plocha je x^2^, zkratka HTML

*[HTML]: HyperText Markup Language
```

Voda je H~2~O, plocha je x^2^, u zkratky HTML se po najetí myší ukáže význam
a emoji fungují taky :tada: :coffee:.

**Matematika** (mezi dolary)

```markdown
v textu $E = mc^2$, nebo na samostatný řádek:

$$
\int_0^1 x^2 \,dx = \frac{1}{3}
$$
```

V textu $E = mc^2$, nebo blokově:

$$
\int_0^1 x^2 \,dx = \frac{1}{3}
$$

*[HTML]: HyperText Markup Language

[^1]: A takhle vypadá poznámka pod čarou — odkaz zpět vede šipkou na konci.

---

To je v kostce vše. Tenhle článek klidně smaž — slouží jen jako přehled
možností a vzor, ze kterého se dá kopírovat.
