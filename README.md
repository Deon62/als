# als website

Nine static pages. No build step, no framework, no dependencies. That is
deliberate: the two pages Google Play checks (privacy, account deletion) have
to be reachable forever, and the surest way to keep a page alive for a decade
is for it to be a file.

```
website/
├── index.html            Hero · What it does · How · Get the app
├── about.html            Why it answers only from your library
├── pricing.html          The three plans, comparison table, FAQs
├── faq.html              The full FAQ, with FAQPage structured data
├── support.html          Where to write, what to include, response times
├── privacy.html          Privacy policy, required by Play
├── delete-account.html   Account deletion, required by Play
├── terms.html            Terms of service
├── 404.html              Not found, links to everything
├── robots.txt
├── sitemap.xml
├── vercel.json           Clean URLs on Vercel
├── netlify.toml          Clean URLs and cache headers on Netlify
├── assets/
│   ├── als.png           The logo, as supplied
│   ├── play.png          Google Play badge, as supplied
│   ├── app.png           App Store badge, as supplied
│   ├── badge-play.png    Play badge, cropped and normalised
│   ├── badge-app.png     App Store badge, cropped and normalised
│   ├── og.png            1200x630 link card, generated from the logo
│   ├── favicon-32.png    Tab icon
│   ├── favicon-180.png   Apple touch icon
│   ├── icon-512.png      Large icon
│   ├── styles.css        The whole design
│   └── main.js           The FAQ accordion, and the year in the footer
└── scripts/
    └── no-em-dash.mjs    Run before committing
```

---

## URLs have no extension

Every link, canonical, `og:url` and sitemap entry is extensionless:
`/privacy`, not `/privacy.html`. The files on disk keep their `.html` names;
the host maps one to the other.

- **Vercel** reads `vercel.json` (`cleanUrls: true`, `trailingSlash: false`).
- **Netlify** and **Cloudflare Pages** do this by default. `netlify.toml` makes
  it explicit and adds cache headers for `/assets/*`.
- **`npx serve .`** does it too, so local preview matches production.

All three also 301 `/privacy.html` to `/privacy`, so any URL already handed to
Google Play or printed somewhere keeps working.

Two consequences worth knowing:

1. **Opening `index.html` by double-clicking no longer works.** Asset paths are
   root-relative (`/assets/styles.css`) so that they resolve identically on
   `/privacy` and on `/`. Preview with `npx serve .` instead.
2. **If you deploy somewhere that does not strip extensions**, change the
   canonicals rather than the links, or Google indexes one URL while you point
   it at another.

---

## Before you publish, three find-and-replaces

### 1. The domain

Every canonical URL, Open Graph tag, `robots.txt` and `sitemap.xml` entry uses
the placeholder **`https://als.ardena.co.ke`**. Replace it everywhere:

```bash
grep -rl "als.ardena.co.ke" . | xargs sed -i 's|https://als.ardena.co.ke|https://YOUR-DOMAIN|g'
```

Getting this wrong is not cosmetic: a canonical pointing at a domain you do not
own tells Google to index that one instead of yours.

### 2. Check the Play Store link

Every button that goes to the listing carries `data-store-link` and points at
`https://play.google.com/store/apps/details?id=com.ardena.als`:

```bash
grep -rn "data-store-link" *.html
```

**If the package name is not `com.ardena.als`, change it here too.** The link
is live before the listing is, so it will show Play's "item not found" page
until the app is published. That is the right failure: it is one string to fix
on the day, rather than a dead `#` that never gets noticed.

The App Store buttons carry `aria-disabled="true"` and no `href`, so they read
as "coming soon" without being dead links. Give them an `href` when there is
something to link to.

### 3. The email addresses

Two role addresses are used. Create them, or change them:

| Address | Used on |
|---|---|
| `support@ardena.co.ke` | support, terms, refunds, privacy policy, deletion requests |
| `info@ardena.co.ke` | footers, and anything that is not a support request |

Role addresses on purpose, not a personal inbox: these go on a public page that
scrapers read, and a person's own address on it is a decision they cannot take
back.

### The contact form

Every contact section posts to Formspree at `https://formspree.io/f/xqpkkkjp`.
Change that `action` in all five pages if the endpoint changes: `privacy.html`,
`terms.html`, `delete-account.html`, `support.html`, `faq.html`.

It degrades properly. The `action` and `method` are real, so with JavaScript
blocked a submit posts straight to Formspree and lands on their thank-you page.
`assets/main.js` upgrades that to a background fetch and a line of confirmation
under the button, so nobody leaves the page they were reading. Each page sends
a different hidden `_subject` so you can tell from the inbox which page the
message came from, and a `_gotcha` honeypot field catches the simplest bots.

Formspree is listed as a processor in the privacy policy, section 06. If you
move to a different provider, that row and the processor count in the heading
above it both have to change.

**No address is ever written out as text.** Every route to an inbox on the site
is an `<a class="mail">` holding an envelope icon and a label saying which
inbox it is; the address itself exists only inside the `mailto:`. Two reasons:
a scraper reading the rendered page finds nothing to harvest, and a long role
address set in running text is the single most common thing that pushes a
phone layout sideways. If you add a contact route, copy an existing `.mail`
link rather than typing the address into a sentence.

### And read the legal pages

`privacy.html` and `terms.html` are drafted from how the app actually behaves:
one device per account, one trial per person, no auto-renewal, Kora for
payment, Supabase for files, coursework never used for training. They are a
solid starting point and they are **not legal advice.** Have someone qualified
read them before the app is public, and check every factual claim still holds
when the backend ships. In particular:

- the 30-day backup window in `delete-account.html`
- the 7-year payment retention in both
- the named processors in `privacy.html`, if any of them change
- the response targets in the table on `support.html`, which are promises

---

## Google Play checklist

The Play Console asks for these by URL. All of them exist here:

| Console field | Page |
|---|---|
| Privacy policy | `/privacy` |
| Account deletion URL (Data safety) | `/delete-account` |
| Support / website | `/support` |
| App website | `/` |

`delete-account.html` is written to Google's actual requirement, which is
stricter than "a page that mentions deletion". It names the app and its package
(in the stamp at the foot), gives an in-app route **and** a route for someone
who cannot open the app, and states what is deleted, what is kept, why, and for
how long. That last table is the part reviewers reject sites over.

Both required pages are linked from the footer of every page on the site, so a
reviewer following any link lands within one click of them.

Still outstanding before submission:

- **HTTPS.** Play will not accept a privacy policy URL that is not.
- **Submit the sitemap** in Google Search Console once the domain is live.

---

## The design

**Nothing is rounded, with two exceptions.** `border-radius: 0` is set once on
`*` in the reset, and the floating nav pill puts it back for itself. Cards,
buttons, tables and the plan grid are all square. A radius anywhere else is a
mistake rather than a variation.

The second exception is the store badges, and it is not negotiable: Google and
Apple both require their official artwork and forbid rebuilding the logo, so
their rounded corners are baked into the bitmaps. No radius in this stylesheet
is producing them and there is nothing to remove.

**The badges are normalised, not just dropped in.** Google ships its badge edge
to edge with real transparency; Apple ships its own inset inside an 800x800
opaque black square. Both are cropped to the button itself, the corners outside
the rounded rectangle are made transparent by flooding inwards from the four
corners (the grey outline is a closed curve, so the fill cannot leak into the
badge interior), and both are scaled to a common height of 160px. They land at
539px and 538px wide, so at any CSS height they match within a pixel.

If either badge is replaced, regenerate both together or they stop matching.
`play.png` and `app.png` are kept as the untouched sources.

**The App Store badge is dimmed and is not a link,** because it reads "Download
on the App Store" and there is no iOS app yet. It carries `aria-disabled`, alt
text that says "coming soon", and a visible line underneath, because opacity is
not information. When the app ships, make it an `<a>`, drop `.badge--soon`, and
delete the note.

**The nav floats.** It is a fixed, frosted pill centred over the page rather
than a bar spanning the window, which is why it is translucent: a solid white
bar would cut the top off every hero, and a solid dark one would vanish into
them. There is a `@supports not (backdrop-filter)` fallback that turns it
nearly opaque, because without one, a browser lacking blur shows dark text on a
near-transparent white over a near-black hero.

**One section at a time, on desktop.** CSS scroll snapping, not JavaScript:

```css
@media (min-width: 1024px) {
  html.snap    { scroll-snap-type: y mandatory; }
  html.snap .section { min-height: 100svh;
                       scroll-snap-align: start;
                       scroll-snap-stop: always; }
}
```

`scroll-snap-stop: always` is what makes it *one* at a time; without it a hard
flick sails past two sections and lands on the third.

Three things about it worth knowing before you change anything:

- It is off below 1024px on purpose. A phone has too little height for a full
  section to fit, and mandatory snapping on a section taller than the viewport
  traps the reader halfway down it.
- It is opt-in per page, via `class="snap"` on `<html>`. Only `index.html`,
  `about.html` and `pricing.html` have it.
- The footer lives *inside* the last section on those pages rather than after
  it. With mandatory snapping, anything following the final snap point is a
  place the scroll keeps sliding off.

**Every hero that is not the landing photograph is two colours.** Night, and
white. No gradient, no tint, no third value; what moves is the boundary between
them.

The white mass is two wave tiles drawn as inline SVG data URIs on the hero's
own `::before` and `::after`, so it costs nothing in markup and there is
nothing to repeat across seven pages. Both are solid white, which is the whole
trick: two same-coloured shapes sliding past each other read as one mass whose
silhouette keeps changing, rather than as two waves.

Two things about it that are load-bearing, and will look broken if changed
carelessly:

- **The frequencies differ.** The back wave has one period per 720px tile, the
  front one has two, and the front has more amplitude. Give them the same
  period and the taller one covers the other at every point, and the whole
  thing collapses into one wave sliding sideways.
- **Each tile is 720px and the element is `calc(100% + 720px)` wide,** so a
  translate of exactly one tile loops seamlessly at any viewport width. Only
  the transform is animated, so it stays on the compositor.

`prefers-reduced-motion` stops it outright rather than letting the sitewide
`animation-duration: 0.01ms` reset freeze it mid-flick.

**Document pages open on a full screen, then split in two.** `privacy`,
`terms`, `delete-account`, `faq` and `support` all use the same two-part shape:

- `.hero--doc`, a full-viewport title card: the page title and one line saying
  what the document is for, and nothing else. Its bottom padding is set to
  clear the swell, so type and white mass never touch however the type clamps.
- `.split` sections below it. Each is one idea: `.split__head` on one side
  (eyebrow, title, tagline) and `.split__body` on the other (the detail), with
  the sides alternating via `.split--alt`.

The "last updated" line and the package name live at the *foot* of each legal
page, in `.split__note--stamp`, not under the title. A policy with no effective
date is not much of a policy, and the package name is what a Play reviewer
checks `delete-account` for, so neither can simply be deleted; they just do not
belong in the first thing you read.

They deliberately do **not** get scroll snapping. The hero is a screen you pass
once; the detail underneath scrolls freely, because a legal page that moves a
screen at a time is a legal page nobody finishes.

Why two columns rather than one measure: a legal page read top to bottom in a
single column gives you no sense of where you are or how much is left. Here the
heading column is a standing summary of the section you are in, and it is
`position: sticky` above 900px so it rides down beside a long list rather than
leaving half a screen of white opposite it.

The alternation is `order`, not source order, so the DOM keeps
heading-then-detail on every section. A screen reader and a phone both get them
in that order regardless of which side they render on.

`.split__body` takes one of four shapes, and no more:

| Class | For |
|---|---|
| `.rows` | A list of statements, one per hairline row |
| `.keyrows` | A label and its definition, in two columns |
| `.prose` | Connected paragraphs that must be read in order |
| `.numsteps` | Steps somebody follows in sequence |

`.table-wrap`, `.callout` and `.faq` also drop into a `.split__body` unchanged.

`.doc` is the older single-column document treatment. Nothing uses it now; it
is kept for anything that turns out to be one continuous argument rather than a
set of sections.

**There is no photograph anywhere on the site.** `assets/land.jpg` used to be
the landing hero, as a `cover` background under a dark scrim. Both it and the
scrim are gone from the stylesheet, and nothing references the file. It can be
deleted whenever you like; it is only still on disk because it is in git
history and deleting somebody's asset is their call.

**The home hero is the same two colours, by a different mechanism.** The
document pages carry a wave drifting along the bottom edge; the landing page
carries a sculptural mass anchored off the bottom-right corner that *turns*
rather than travels. Two solid white organic forms, one clockwise at 120s, one
anticlockwise at 88s, at different sizes. Their union is one mass whose profile
never repeats, and because both are the same white there is no seam to give the
two shapes away.

The forms are radial harmonics, not circles, and that is load-bearing:
rotating a circle shows nothing at all. Each one is 14 samples of
`r(t) = R(1 + Σ aₖ cos(kt + φₖ))` joined into a closed Catmull-Rom spline, and
every degree of rotation presents a different edge.

Two things constrain the geometry, and both will break visibly if changed
without re-checking:

- **The mass must clear the type at every rotation.** It is placed by its
  circumscribed radius against the content box, which is why the home headline
  is held to `15ch` rather than the `24ch` every other hero uses. At 1440px the
  24ch measure is about 1135px wide and runs straight into the form.
- **Below 900px it moves to the bottom-right corner** and the hero takes
  bottom padding to clear it, the same arrangement the document pages use. The
  size is set on the viewport width but capped against the height
  (`min(110vw, 52vh)`), or a short phone gets a form taller than its own hero.

**The palette is the app's, to the hex**: `#007FFA` primary, `#09090B` ink,
`#71717A` muted, `#E4E4E7` lines. A site and an app that disagree about their
blue look like two products.

**Two typefaces, with a clear division of labour.** Jost is the display face,
matched to the wordmark in `assets/als.png`: a light geometric sans with a
single-storey circular `a`, a bare `l` and an open `s`. The logo is Century
Gothic lineage and Jost is Futura lineage, so it is a touch narrower than the
drawn mark, but it is the closest cut with a Light weight on Google Fonts, and
a matching Light is what the wordmark needs.

Headings and the wordmark take it. Running text, tables and the legal pages
stay on Plus Jakarta Sans, which is the app's typeface and is drawn for small
sizes. A light geometric set at 14px over twenty screens of policy is a page
nobody finishes.

Both come from one Google Fonts request, so this costs no extra round trip.

**The wordmark is always `als`, never `ALS`,** the way `ebay` and `adidas` are
set. It is lowercase in prose, in `<title>` tags, in meta descriptions and in
the JSON-LD. The one thing that can undo that is an uppercasing micro-label:
`.split__eyebrow`, `.footer__head`, `.keyrows__key`, `th` and the rest of the
`text-transform: uppercase` set will shout it back as ALS. Keep the wordmark
out of those. There is one place this already bit, and `terms.html` section 01
is called "What it is" rather than "What als is" because of it.

**The logo is the icon and the link card.** `favicon-32`, `favicon-180` and
`icon-512` are cropped from `als.png`; `og.png` is the wordmark set over the
site's own swell at 1200x630. All four are generated, so if the logo is
redrawn they need regenerating with it.

**Pricing is transcribed from `src/theme/plans.js`** in the app repo. If a limit
changes there, it has to change on `pricing.html` too; there is no shared
source between them.

**The FAQs are `<details>`**, not a JavaScript accordion. They open with the
script blocked, they are keyboard operable for free, and in most browsers
Ctrl+F finds text inside a closed one, which is what somebody hunting for
"refund" is actually doing. The script adds only the one thing CSS cannot:
closing the siblings when one opens.

---

## SEO

In place: unique title and meta description per page, extensionless canonical
URLs, Open Graph and Twitter cards, `MobileApplication` JSON-LD on the home
page, `Product` with an `AggregateOffer` on pricing, `FAQPage` on the FAQ,
semantic landmarks, one `<h1>` per page, a skip link, `robots.txt`,
`sitemap.xml` and a `404.html`.

The FAQ answers on `faq.html` are duplicated into the JSON-LD deliberately.
That is what can earn the expandable questions under a search result, and
Google requires the structured answer to match the visible one word for word.
**If you edit a question or an answer on the page, edit it in the `FAQPage`
block too**, or the markup is invalid and gets ignored.

---

## Checks

```bash
node scripts/no-em-dash.mjs   # no em or en dashes anywhere
npx serve .                   # preview, with clean URLs
```

---

## Deploying

Any static host. It is nine HTML files and four assets.

```bash
# Netlify
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# Cloudflare Pages
npx wrangler pages deploy .
```

GitHub Pages works too, but it does **not** strip `.html` extensions. If you
deploy there, either accept `/privacy.html` and change every canonical and link
back, or put Cloudflare in front of it. Whatever you choose, put it behind
HTTPS.
