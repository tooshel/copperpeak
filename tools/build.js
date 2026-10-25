#!/usr/bin/env node
// Copper Peak Heating & Cooling — static site generator (zero dependencies).
// Renders content/** into docs/ with the shared header, nav, and footer.
//
//   content/pages/*.html  one file per top-level page (home, heating, cooling, ...)
//   content/diy/*.html    DIY articles  -> /diy/<slug>/   (listed on /diy/)
//   content/fyi/*.html    FYI articles  -> /fyi/<slug>/   (listed on /fyi/)
//   static/               copied as-is (images, favicon)
//
// Each content file starts with front matter between --- lines (key: value).
// Run: node tools/build.js   then commit and push; GitHub Pages serves docs/.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs');
const SITE = {
  name: 'Copper Peak Heating & Cooling',
  url: 'https://www.copperpeakair.com',
  domain: 'www.copperpeakair.com',
  phone: '(480) 673-8311',
  tel: '+14806738311',
  email: 'service@copperpeakair.com',
  cities: ['Mesa', 'Apache Junction', 'Buckeye', 'Chandler', 'Gilbert', 'Glendale', 'Gold Canyon',
    'Peoria', 'Phoenix', 'Queen Creek', 'San Tan Valley', 'Scottsdale', 'Tempe'],
};

const NAV = [
  ['heating', 'Heating', '/heating/'],
  ['cooling', 'Cooling', '/cooling/'],
  ['air-quality', 'Air Quality', '/air-quality/'],
  ['pricing', 'Pricing', '/pricing/'],
  ['diy', 'DIY & Parts', '/diy/'],
  ['fyi', 'FYI', '/fyi/'],
  ['service-area', 'Service Area', '/service-area/'],
];

const LEVELS = ['Easy', 'Moderate', 'Advanced'];

// ---------- content loading ----------
function load(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter: ' + file);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { ...meta, body: m[2] };
}
const loadDir = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => ({ slug: f.replace(/\.html$/, ''), ...load(path.join(dir, f)) }))
  : [];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- styles ----------
const STYLE = `
:root {
  --copper:#c2561a; --copper-bright:#e8762b; --amber:#f5a623;
  --blue:#1769aa; --navy:#16365c; --ink:#22303f; --soft:#5d6b7a;
  --cream:#fdf7ef; --sand:#f7e9d7; --line:#ecdcc6;
  color-scheme: light;
}
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
[id] { scroll-margin-top:120px; }
body { margin:0; font:17px/1.6 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:var(--ink); background:var(--cream); }
img { max-width:100%; height:auto; }
a { color:var(--blue); }
a:hover { color:var(--copper); }
:focus-visible { outline:2px solid var(--copper); outline-offset:2px; }

/* header */
.site-head { position:sticky; top:0; z-index:10; }
.topbar { background:var(--navy); color:#fff; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between;
  gap:8px 16px; padding:10px clamp(16px,4vw,40px); }
.topbar .brand { font-weight:800; letter-spacing:.02em; font-size:1.02rem; color:#fff; text-decoration:none; }
.topbar .brand span { color:var(--amber); }
.topbar .reach { display:flex; flex-wrap:wrap; align-items:center; gap:6px 16px; }
.topbar a.mail { color:#dbe6f2; text-decoration:none; font-size:.95rem; }
.topbar a.mail:hover { color:#fff; text-decoration:underline; }
.topbar a.call { background:var(--copper); color:#fff; text-decoration:none; font-weight:700; padding:8px 18px;
  border-radius:999px; white-space:nowrap; transition:background .15s ease-out; }
.topbar a.call:hover { background:#a84512; color:#fff; }
nav.main { background:#fff; border-bottom:1px solid var(--line); padding:0 clamp(16px,4vw,40px);
  display:flex; gap:4px 22px; overflow-x:auto; white-space:nowrap; scrollbar-width:none; }
nav.main a { color:var(--navy); text-decoration:none; font-weight:600; font-size:.95rem; padding:11px 0;
  border-bottom:3px solid transparent; }
nav.main a:hover { color:var(--copper); }
nav.main a[aria-current] { border-bottom-color:var(--copper); color:var(--copper); }

/* home hero */
.hero { background:radial-gradient(900px 400px at 75% -80px, rgba(245,166,35,.35), transparent 70%),
    linear-gradient(180deg,#fbe8cd 0%,var(--cream) 78%);
  border-bottom:1px solid var(--line); padding:clamp(28px,6vw,64px) clamp(16px,4vw,40px) clamp(32px,5vw,56px); }
.hero-inner { max-width:1020px; margin:0 auto; display:grid; grid-template-columns:minmax(280px,460px) 1fr;
  gap:clamp(24px,4vw,56px); align-items:center; }
.hero img { width:100%; height:auto; mix-blend-mode:multiply; }
.hero h1 { font-size:clamp(1.7rem,3.6vw,2.5rem); line-height:1.15; margin:0 0 .5rem; color:var(--navy); letter-spacing:-0.015em; }
.hero h1 em { font-style:normal; color:var(--copper); }
.hero p.lead { font-size:1.08rem; color:#46535f; margin:0 0 1.6rem; max-width:46ch; }
.hero .assurance { margin:1.1rem 0 0; font-size:.92rem; color:#46535f; }

/* inner page band */
.page-head { background:linear-gradient(180deg,#fbe8cd 0%,var(--cream) 100%); border-bottom:1px solid var(--line);
  padding:clamp(28px,5vw,52px) clamp(16px,4vw,40px) clamp(24px,4vw,40px); }
.page-head h1 { color:var(--navy); font-size:clamp(1.7rem,3.4vw,2.4rem); line-height:1.15; margin:0 0 .5rem; letter-spacing:-0.015em; max-width:28ch; }
.page-head p.lead { margin:0; font-size:1.08rem; color:#46535f; max-width:60ch; }
.page-head .meta { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 .9rem; padding:0; list-style:none; }
.page-head .meta li, .card .level { font-size:.82rem; font-weight:700; color:var(--navy); background:#fff;
  border:1px solid var(--line); border-radius:999px; padding:3px 11px; }
.crumbs { font-size:.88rem; margin:0 0 .7rem; color:var(--soft); }
.crumbs a { color:var(--soft); }

.cta-row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
.btn { display:inline-block; text-decoration:none; font-weight:700; border-radius:10px; padding:14px 26px;
  transition:transform .12s ease-out, background .15s ease-out; }
.btn-primary { background:var(--copper); color:#fff; font-size:1.08rem; }
.btn-primary:hover { background:#a84512; color:#fff; transform:translateY(-1px); }
.btn-ghost { color:var(--blue); border:1.5px solid var(--blue); background:transparent; }
.btn-ghost:hover { background:rgba(23,105,170,.07); }

section { padding:clamp(36px,6vw,64px) clamp(16px,4vw,40px); }
.measure { max-width:1020px; margin:0 auto; }
h2 { color:var(--navy); font-size:clamp(1.35rem,2.6vw,1.7rem); letter-spacing:-0.01em; margin:0 0 1.1rem; }
h3 { color:var(--navy); }

/* prose for service pages and articles */
.prose { max-width:70ch; }
.prose h2 { margin-top:2.4rem; }
.prose h2:first-child { margin-top:0; }
.prose h3 { font-size:1.12rem; margin:1.8rem 0 .5rem; }
.prose p, .prose li { color:var(--ink); }
.prose ul, .prose ol { padding-left:1.3rem; }
.prose li { margin:.35rem 0; }
.prose ol.steps { counter-reset:step; list-style:none; padding-left:0; }
.prose ol.steps > li { counter-increment:step; position:relative; padding-left:2.6rem; margin:1rem 0; }
.prose ol.steps > li::before { content:counter(step); position:absolute; left:0; top:-.05rem; width:1.85rem; height:1.85rem;
  border-radius:50%; background:var(--navy); color:#fff; font-weight:700; font-size:.92rem; display:grid; place-items:center; }
.prose table { border-collapse:collapse; width:100%; font-size:.95rem; margin:1rem 0; }
.prose th, .prose td { border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }
.prose th { background:var(--sand); color:var(--navy); }
.table-wrap { overflow-x:auto; }
.price-table { border-collapse:collapse; width:100%; min-width:640px; background:#fff; font-size:.96rem;
  border:1px solid var(--line); border-radius:14px; overflow:hidden; margin:1rem 0; }
.price-table th, .price-table td { padding:12px 14px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top; }
.price-table thead th { background:var(--navy); color:#fff; font-size:.9rem; }
.price-table thead th.us { background:var(--copper); }
.price-table td.us { background:#fff4e3; color:var(--copper); font-weight:800; }
.price-table tbody tr:last-child td { border-bottom:0; }
.price-table .sub { font-size:.85rem; color:var(--soft); font-weight:400; }
.price-table td:nth-child(n+3) { color:var(--soft); }
.price-table td:last-child a { font-weight:600; white-space:nowrap; }

.callout { border-radius:12px; padding:16px 18px; margin:1.4rem 0; }
.callout > :first-child { margin-top:0; }
.callout > :last-child { margin-bottom:0; }
.callout .label { display:block; font-weight:800; font-size:.85rem; letter-spacing:.04em; margin-bottom:.35rem; }
.callout.safety { background:#fdecea; color:#6b1d14; }
.callout.safety .label { color:#a3261a; }
.callout.safety p, .callout.safety li { color:#6b1d14; }
.callout.pro { background:#e8f0f8; color:#14304f; }
.callout.pro .label { color:var(--navy); }
.callout.pro p, .callout.pro li { color:#14304f; }
.callout.tip { background:#fff4e3; color:#5a3a10; }
.callout.tip .label { color:#8a4e0c; }
.callout.tip p, .callout.tip li { color:#5a3a10; }

.two-col { display:grid; grid-template-columns:1fr minmax(240px,320px); gap:clamp(24px,4vw,48px); align-items:start; }
.side-card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; position:sticky; top:120px; }
.side-card h3 { margin:0 0 .5rem; font-size:1.05rem; }
.side-card p { margin:0 0 .8rem; font-size:.95rem; color:var(--soft); }
.side-card .btn { width:100%; text-align:center; margin-top:.4rem; padding:12px 16px; }

/* home cards */
.services { background:#fff; border-block:1px solid var(--line); }
.svc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:14px; }
.svc { display:block; border:1px solid var(--line); border-radius:14px; padding:18px 16px 16px; background:var(--cream);
  text-decoration:none; color:inherit; transition:border-color .15s ease-out, transform .12s ease-out; }
a.svc:hover { border-color:var(--copper-bright); transform:translateY(-2px); color:inherit; }
.svc svg { width:34px; height:34px; stroke:var(--copper-bright); fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.svc h3 { margin:.55rem 0 .25rem; font-size:1.02rem; }
.svc p { margin:0; font-size:.9rem; color:var(--soft); }

.about-wrap { display:grid; grid-template-columns:1.2fr .8fr; gap:clamp(24px,4vw,48px); align-items:start; }
.about p { margin:0 0 1rem; max-width:62ch; }
.trust, .parts-box { background:linear-gradient(135deg,var(--navy),#1f4a7a); color:#fff; border-radius:16px; padding:26px 26px 24px; }
.trust p { margin:0 0 .8rem; font-size:1.25rem; line-height:1.45; font-weight:600; }
.trust p strong { color:#f7b245; }
.trust .who { font-size:.9rem; color:#bcd2e6; font-weight:400; margin:0; }
.parts-box h2 { color:#fff; }
.parts-box p, .parts-box li { color:#dbe6f2; }
.parts-box strong { color:#fff; }
.parts-box a { color:#f7b245; }
.parts-box a.btn-primary { color:#fff; }
.parts-box ol { padding-left:1.2rem; }
.parts-box .fine { font-size:.88rem; color:#b9c8da; margin-bottom:0; }
.parts-box .btn-primary { margin-top:.6rem; }

.area { background:var(--sand); border-block:1px solid var(--line); }
.chips { display:flex; flex-wrap:wrap; gap:8px; padding:0; margin:0; list-style:none; }
.chips li { background:#fff; border:1px solid var(--line); border-radius:999px; padding:7px 15px; font-size:.92rem; }

.cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
.card { display:block; background:#fff; border:1px solid var(--line); border-radius:14px; padding:18px 18px 16px;
  text-decoration:none; color:inherit; transition:border-color .15s ease-out, transform .12s ease-out; }
.card:hover { border-color:var(--copper-bright); transform:translateY(-2px); color:inherit; }
.card h3 { margin:.6rem 0 .3rem; font-size:1.05rem; line-height:1.3; }
.card p { margin:0; font-size:.92rem; color:var(--soft); }
.level-group h2 { margin-top:2.2rem; }

.contact .cols { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:24px; }
.contact h3 { font-size:1.02rem; margin:0 0 .5rem; }
.contact a { text-decoration:none; border-bottom:1px solid #bcd3e4; }
.contact a:hover { border-color:var(--copper); }
.contact ul { list-style:none; margin:0; padding:0; color:var(--soft); font-size:.95rem; }
.contact li { padding:2px 0; }
.bignum { font-size:clamp(1.5rem,3vw,1.9rem); font-weight:800; margin:0; }
.bignum a { border:0; color:var(--copper); }

.cta-band { background:var(--navy); color:#fff; text-align:center; }
.cta-band h2 { color:#fff; }
.cta-band p { color:#dbe6f2; max-width:56ch; margin:0 auto 1.4rem; }
.cta-band .btn-ghost { color:#fff; border-color:#fff; }
.cta-band .btn-ghost:hover { background:rgba(255,255,255,.1); color:#fff; }
.cta-band .cta-row { justify-content:center; }

footer.site { background:#0f2742; color:#b9c8da; font-size:.88rem; padding:30px clamp(16px,4vw,40px); }
footer.site .measure { display:flex; flex-wrap:wrap; gap:10px 28px; justify-content:space-between; }
footer.site a { color:#e8eef5; text-decoration:none; border-bottom:1px solid #3c5a7d; }
footer.site .links { display:flex; flex-wrap:wrap; gap:6px 16px; }
::selection { background:var(--copper-bright); color:#fff; }

@media (max-width:760px) {
  .hero-inner, .about-wrap, .two-col { grid-template-columns:1fr; }
  .side-card { position:static; }
  .topbar .brand span { display:block; font-size:.85rem; }
  .topbar a.mail { font-size:.88rem; }
  .site-head { position:static; }
  nav.main { flex-wrap:wrap; white-space:normal; overflow:visible; gap:0 16px; }
  nav.main a { padding:9px 0; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto; }
  .btn, .svc, .card { transition:none; }
}
`;

// ---------- structured data ----------
const BUSINESS_LD = {
  '@context': 'https://schema.org',
  '@type': 'HVACBusiness',
  name: SITE.name,
  url: SITE.url + '/',
  telephone: '+1-480-673-8311',
  email: SITE.email,
  image: SITE.url + '/images/copper-peak-logo-2026.jpg',
  slogan: 'Your comfort. Our commitment.',
  description: 'Family-owned heating and air conditioning repair, installation, maintenance, and indoor air quality service in Mesa and the Phoenix East Valley, Arizona.',
  areaServed: SITE.cities.map((c) => ({ '@type': 'City', name: c + ', AZ' })),
  openingHours: 'Mo-Fr 07:00-17:00',
};

// ---------- layout ----------
function layout({ title, description, pathname, nav, body, extraLd = [] }) {
  const navHtml = NAV.map(([key, label, href]) =>
    `<a href="${href}"${key === nav ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const ld = [BUSINESS_LD, ...extraLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.url}${pathname}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.url}${pathname}">
<meta property="og:image" content="${SITE.url}/images/copper-peak-logo-2026.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${STYLE}</style>
${ld}
</head>
<body>
<header class="site-head">
  <div class="topbar">
    <a class="brand" href="/">COPPER PEAK <span>HEATING &amp; COOLING</span></a>
    <div class="reach">
      <a class="mail" href="mailto:${SITE.email}">${SITE.email}</a>
      <a class="call" href="tel:${SITE.tel}">Call ${SITE.phone}</a>
    </div>
  </div>
  <nav class="main" aria-label="Main">${navHtml}</nav>
</header>
<main>
${body}
</main>
<footer class="site">
  <div class="measure">
    <span>&copy; ${new Date().getFullYear()} ${esc(SITE.name)} &middot; Mesa, Arizona</span>
    <span class="links">
      <a href="tel:${SITE.tel}">${SITE.phone}</a>
      <a href="mailto:${SITE.email}">${SITE.email}</a>
      <a href="/service-area/">Service area</a>
      <a href="/pricing/">Pricing</a>
      <a href="/diy/">DIY &amp; Parts</a>
    </span>
    <span>Your comfort. Our commitment.</span>
  </div>
</footer>
</body>
</html>
`;
}

// shared bits content files can use via {{TOKENS}}
const CTA_BAND = `<section class="cta-band">
  <div class="measure">
    <h2>Rather have a pro handle it?</h2>
    <p>That's what we're here for. Call or text and you'll talk to a real person who knows your system.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="tel:${SITE.tel}">Call ${SITE.phone}</a>
      <a class="btn btn-ghost" href="mailto:${SITE.email}">Email us</a>
    </div>
  </div>
</section>`;

const SIDE_CARD = `<aside class="side-card">
  <h3>Need it fixed today?</h3>
  <p>Family owned, up-front pricing, and a one-year no-hassle guarantee on our work.</p>
  <a class="btn btn-primary" href="tel:${SITE.tel}">Call ${SITE.phone}</a>
  <a class="btn btn-ghost" href="mailto:${SITE.email}">Email us</a>
</aside>`;

const PARTS_MAILTO = `mailto:${SITE.email}?subject=${encodeURIComponent('Parts quote')}&body=${encodeURIComponent(
  'Name:\nPhone:\nCity:\n\nWhat\'s going on with the system:\n\nPhoto of the unit\'s label (model and serial) attached.\n')}`;

const CITY_CHIPS = `<ul class="chips">${SITE.cities.map((c) => `<li>${c}</li>`).join('')}</ul>`;

const fill = (html) => html
  .replace(/\{\{CTA_BAND\}\}/g, CTA_BAND)
  .replace(/\{\{SIDE_CARD\}\}/g, SIDE_CARD)
  .replace(/\{\{PARTS_MAILTO\}\}/g, PARTS_MAILTO)
  .replace(/\{\{CITY_CHIPS\}\}/g, CITY_CHIPS)
  .replace(/\{\{PHONE\}\}/g, SITE.phone)
  .replace(/\{\{TEL\}\}/g, SITE.tel)
  .replace(/\{\{EMAIL\}\}/g, SITE.email);

// ---------- render ----------
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });

const write = (pathname, html) => {
  const dir = path.join(OUT, pathname);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
};
const urls = [];

const diy = loadDir(path.join(ROOT, 'content/diy'));
const fyi = loadDir(path.join(ROOT, 'content/fyi'));

const card = (a, base) => `<a class="card" href="/${base}/${a.slug}/">
  ${a.level ? `<span class="level">${esc(a.level)}${a.time ? ' · ' + esc(a.time) : ''}</span>` : ''}
  <h3>${esc(a.title)}</h3>
  <p>${esc(a.summary || a.description)}</p>
</a>`;

const diyList = LEVELS.map((lvl) => {
  const items = diy.filter((a) => a.level === lvl).sort((x, y) => Number(x.order || 99) - Number(y.order || 99));
  if (!items.length) return '';
  return `<div class="level-group"><h2>${lvl}</h2><div class="cards">${items.map((a) => card(a, 'diy')).join('\n')}</div></div>`;
}).join('\n');
const fyiList = `<div class="cards">${fyi.map((a) => card(a, 'fyi')).join('\n')}</div>`;

// top-level pages
for (const p of loadDir(path.join(ROOT, 'content/pages'))) {
  const pathname = p.slug === 'home' ? '/' : `/${p.slug}/`;
  const body = fill(p.body).replace('{{DIY_LIST}}', diyList).replace('{{FYI_LIST}}', fyiList);
  write(pathname, layout({ title: p.title, description: p.description, pathname, nav: p.nav || p.slug, body }));
  urls.push(pathname);
}

// articles
const article = (a, base, sectionLabel, nav) => {
  const pathname = `/${base}/${a.slug}/`;
  const meta = [a.level, a.time, a.updated && `Updated ${a.updated}`].filter(Boolean);
  const body = `<div class="page-head">
  <div class="measure">
    <p class="crumbs"><a href="/${base}/">${sectionLabel}</a></p>
    ${meta.length ? `<ul class="meta">${meta.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
    <h1>${esc(a.title)}</h1>
    ${a.lead ? `<p class="lead">${a.lead}</p>` : ''}
  </div>
</div>
<section>
  <div class="measure two-col">
    <article class="prose">${fill(a.body)}</article>
    ${SIDE_CARD}
  </div>
</section>
${CTA_BAND}`;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
    datePublished: a.date, dateModified: a.updated || a.date, mainEntityOfPage: SITE.url + pathname,
    author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name } };
  write(pathname, layout({ title: `${a.title} | ${SITE.name}`, description: a.description, pathname, nav, body, extraLd: [ld] }));
  urls.push(pathname);
};
for (const a of diy) article(a, 'diy', 'DIY &amp; Parts', 'diy');
for (const a of fyi) article(a, 'fyi', 'FYI', 'fyi');

// 404
write('/404-tmp', layout({ title: `Page not found | ${SITE.name}`, description: 'That page is not here.', pathname: '/404', nav: '',
  body: `<div class="page-head"><div class="measure"><h1>That page isn't here.</h1>
  <p class="lead">Try the <a href="/">home page</a>, our <a href="/diy/">DIY guides</a>, or just call ${SITE.phone}.</p></div></div>` }));
fs.renameSync(path.join(OUT, '404-tmp', 'index.html'), path.join(OUT, '404.html'));
fs.rmSync(path.join(OUT, '404-tmp'), { recursive: true });

// static assets
const copyDir = (src, dst) => {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); } else fs.copyFileSync(s, d);
  }
};
copyDir(path.join(ROOT, 'static'), OUT);

// sitemap, robots, CNAME (Pages drops the custom domain if CNAME ever disappears)
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'CNAME'), SITE.domain + '\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`built ${urls.length} pages (${diy.length} DIY, ${fyi.length} FYI) + 404, sitemap, robots, CNAME`);
