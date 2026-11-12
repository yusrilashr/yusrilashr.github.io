# yusrilashr.github.io

Personal portfolio and CV site — one hand-built static page. No framework, no build step, no
dependencies beyond a Google Fonts stylesheet.

**Live:** https://yusrilashr.github.io

## Files

```
index.html      the whole page — all content lives here
css/tokens.css  design tokens (colour, type, space, motion). Change the look from here.
css/style.css   page styles. References tokens by name only — no raw colour values.
js/main.js      portfolio filter, skills-to-work links, nav position, email assembly
assets/         the downloadable CV PDF and the masthead ribbon
favicon.svg     YA monogram
.nojekyll       tells GitHub Pages to serve the files as-is (skip Jekyll)
```

## Page order

| Section | Where in `index.html` |
|---|---|
| Name, role, summary, scroll cue | `<section class="hero">` |
| Portfolio | `<ul class="pieces">` — one `<li class="piece">` per piece |
| Skills, end to end | `<ol class="flow">` — one `<li class="flow__stage">` per stage |
| CV (experience, education, PDF) | `<section id="cv">` — one `<li class="cv__row">` per job |
| Contact | `<ul class="contact">` |

## Adding a portfolio piece

Copy one `<li class="piece">` block inside `<ul class="pieces">` and change four things:

1. **`data-stages`** — which stages of the data path the piece covers. One or more of
   `database`, `pipeline`, `processing`, `visualisation`, `analysis`, separated by spaces.
2. **The plate** — a screenshot, or the tools if there is no screenshot:

   ```html
   <!-- with a screenshot (save it in assets/work/) -->
   <span class="piece__plate">
     <img src="assets/work/my-project.png" alt="What the image shows." loading="lazy" decoding="async" />
   </span>

   <!-- without one -->
   <span class="piece__plate piece__plate--text">
     <span class="piece__format">SQL</span>
     <span class="piece__stack">PostgreSQL · dbt</span>
   </span>
   ```
3. **Title, link, and description.**
4. **The meta line** — repeat the stages in words, then where it lives: `Pipeline · GitHub · 2026`.

That is the only edit. The filter buttons, their counts, and the "n pieces in the portfolio" links
under each skill are all built from `data-stages` when the page loads. A stage that has no piece
yet simply has no filter button and no link; it appears the first time a piece uses it.

The grid is 3 columns on desktop, 2 on a tablet, 1 on a phone, and every piece is the same size,
so any number of pieces fits without re-arranging anything.

## Other edits

**Adding a job:** copy an existing `<li class="cv__row">` block, change the period, title, org,
and bullets.

**Changing a skill:** edit the `<ul class="flow__tools">` list inside the stage. Keep the stage's
`data-stage` value as it is — it is what links the stage to the portfolio.

**Changing the accent colour:** edit `--color-accent` in `css/tokens.css`. If you pick something
lighter, also lower the lightness on `--color-accent-text` — that token is the one used for
accent-coloured *text*, and it needs to stay at 4.5:1 against the paper.

**Replacing the PDF:** drop the new file at `assets/Yusril_Sabilla_Ashar_CV.pdf` (same name) and
both download buttons keep working. Update the CV section's text at the same time so the page and
the PDF say the same thing.

## Deploying an update

```bash
git add -A && git commit -m "Update site" && git push
```

GitHub Pages rebuilds automatically — live in about a minute.

## Design system

Built with the Hallmark design skill — theme **Cobalt**, macrostructure **Portfolio Grid**,
nav **N5**, footer **Ft2**. The stamp at the top of `css/style.css` is the durable record of
those choices; `.hallmark/log.json` is what a future run reads so it doesn't repeat itself.
