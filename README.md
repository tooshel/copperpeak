# copperpeakair.com

Copper Peak Heating & Cooling. Static site on GitHub Pages, served from `docs/`.

## Editing

- Pages: `content/pages/*.html` (home, heating, cooling, air-quality, service-area, diy, fyi)
- DIY articles: `content/diy/*.html` (front matter: title, description, summary, level Easy/Moderate/Advanced, time, order, date, lead)
- FYI articles: `content/fyi/*.html`
- Shared header, nav, footer, styles, phone/email, and city list: `tools/build.js` (the `SITE` object at the top)
- Images and favicon: `static/`

Then run `node tools/build.js`, commit, and push. The build writes `docs/CNAME`, a sitemap, and robots.txt itself.
Never edit `docs/` by hand.
