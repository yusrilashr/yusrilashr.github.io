# yusrilashr.github.io

Personal CV site — one hand-built static page. No framework, no build step, no dependencies
beyond a Google Fonts stylesheet.

**Live:** https://yusrilashr.github.io

## Files

```
index.html      the whole page — all content lives here
css/tokens.css  design tokens (colour, type, space, motion). Change the look from here.
css/style.css   page styles. References tokens by name only — no raw colour values.
js/main.js      scroll reveal, nav frost-on-scroll, email assembly
assets/         the downloadable CV PDF
favicon.svg     YA monogram
.nojekyll       tells GitHub Pages to serve the files as-is (skip Jekyll)
```

## Editing content

All copy is in `index.html`. The sections, in order:

| Section | Where |
|---|---|
| Name, role line, summary | `<section class="hero">` |
| Experience | `<ol class="roles">` — one `<li class="role">` per job |
| Projects | `<div class="projects">` — one `<article class="project">` each |
| Technical expertise | `<dl class="spec">` — one `.spec__row` per domain |
| Education | `<div class="edu">` |
| Contact | `<footer class="foot">` |

**Adding a job:** copy an existing `<li class="role">` block, change the period, title, org, and
bullets. Keep the `reveal` class — that's what fades it in on scroll.

**Changing the accent colour:** edit `--color-accent` in `css/tokens.css`. If you pick something
lighter, also lower the lightness on `--color-accent-text` — that token is the one used for
accent-coloured *text*, and it needs to stay at 4.5:1 against the paper.

**Replacing the PDF:** drop the new file at `assets/Yusril_Sabilla_Ashar_CV.pdf` (same name) and
the two download links keep working.

## Deploying an update

```bash
git add -A && git commit -m "Update CV" && git push
```

GitHub Pages rebuilds automatically — live in about a minute.

## Design system

Built with the Hallmark design skill — theme **Cobalt**, macrostructure **Marquee Hero**,
nav **N1b**, footer **Ft5**. The stamp at the top of `css/style.css` is the durable record of
those choices; `.hallmark/log.json` is what a future run reads so it doesn't repeat itself.
