# ALS website

Five static pages. No build step, no framework, no dependencies, open
`index.html` in a browser and it is the site. That is deliberate: the two pages
Google Play checks (privacy, account deletion) have to be reachable forever,
and the surest way to keep a page alive for a decade is for it to be a file.

```
website/
├── index.html            Hero · About · FAQs · Get the app + footer
├── pricing.html          The three plans
├── privacy.html          Privacy policy, required by Play
├── delete-account.html   Account deletion, required by Play
├── terms.html            Terms of service
├── robots.txt
├── sitemap.xml
└── assets/
    ├── land.jpg          The hero background
    ├── styles.css        The whole design
    ├── main.js           Nav highlighting, and the year in the footer
    └── favicon.svg
```

---

## Before you publish, four find-and-replaces

### 1. The domain

Every canonical URL, Open Graph tag, `robots.txt` and `sitemap.xml` entry uses
the placeholder **`https://als.ardena.co.ke`**. Replace it everywhere:

```bash
grep -rl "als.ardena.co.ke" . | xargs sed -i 's|https://als.ardena.co.ke|https://YOUR-DOMAIN|g'
```

Getting this wrong is not cosmetic, a canonical pointing at a domain you do
not own tells Google to index that one instead of yours.

### 2. The Play Store link

Every button that should go to the listing carries `data-store-link` and
currently points at `#get`, so nothing 404s before the listing exists:

```bash
grep -rn "data-store-link" *.html
```

Replace each `href` with
`https://play.google.com/store/apps/details?id=com.ardena.als`.

### 3. The email addresses

Three role addresses are used. Create them, or change them:

| Address | Used on |
|---|---|
| `support@ardena.co.ke` | footers, terms, refunds |
| `privacy@ardena.co.ke` | privacy policy, deletion requests |
| `hello@ardena.co.ke` | footers |

Role addresses on purpose, not a personal inbox, these go on a public page
that scrapers read, and a person's own address on it is a decision they cannot
take back.

### 4. Read the legal pages

`privacy.html` and `terms.html` are drafted from how the app actually behaves, one device per account, one trial per person, no auto-renewal, Paystack for
payment, Supabase for files, coursework never used for training. They are a
solid starting point and they are **not legal advice.** Have someone qualified
read them before the app is public, and check every factual claim still holds
when the backend ships. In particular:

- the 30-day backup window in `delete-account.html`
- the 7-year payment retention in both
- the named processors in `privacy.html`, if any of them change

---

## Google Play checklist

The Play Console asks for these by URL. All three exist here:

| Console field | Page |
|---|---|
| Privacy policy | `/privacy.html` |
| Account deletion URL (Data safety) | `/delete-account.html` |
| Support / website | `/` |

`delete-account.html` is written to Google's actual requirement, which is
stricter than "a page that mentions deletion", it names the app and its
package, gives an in-app route *and* a route for someone who cannot open the
app, and states what is deleted, what is kept, why, and for how long. That last
table is the part reviewers reject sites over.

Both pages are linked from the footer of every page on the site, so a reviewer
following any link lands within one click of them.

---

## The design

**Nothing is rounded, with one exception.** `border-radius: 0` is set once on
`*` in the reset, and the floating nav pill puts it back for itself. Cards,
buttons, tables and the plan grid are all square. A radius anywhere else is a
mistake rather than a variation.

**The nav floats.** It is a fixed, frosted pill centred over the page rather
than a bar spanning the window, which is why it is translucent: a solid white
bar would cut the hero image in half, and a solid dark one would vanish into
it. There is a `@supports not (backdrop-filter)` fallback that turns it nearly
opaque, because without one, a browser lacking blur shows dark text on a
near-transparent white over a dark photograph.

**One section at a time, on desktop.** CSS scroll snapping, not JavaScript:

```css
@media (min-width: 1024px) {
  html.snap    { scroll-snap-type: y mandatory; }
  html.snap .section { min-height: 100svh;
                       scroll-snap-align: start;
                       scroll-snap-stop: always; }
}
```

`scroll-snap-stop: always` is what makes it *one* at a time, without it a hard
flick sails past two sections and lands on the third.

Three things about it worth knowing before you change anything:

- It is off below 1024px on purpose. A phone has too little height for a full
  section to fit, and mandatory snapping on a section taller than the viewport
  traps the reader halfway down it.
- It is opt-in per page, via `class="snap"` on `<html>`. Only the home page has
  it. A legal page that moves a screen at a time is a legal page nobody
  finishes.
- The footer lives *inside* the last section rather than after it. With
  mandatory snapping, anything following the final snap point is a place the
  scroll keeps sliding off.

**The hero image is the section**, not a panel inside it, `assets/land.jpg` as
a `cover` background with a dark scrim over it. The scrim is not decoration:
white text on a photograph is unreadable the moment the photograph changes, and
it keeps the contrast whatever image is dropped in. To swap the image, replace
that file; nothing else changes.

**The palette is the app's, to the hex**, `#007FFA` primary, `#09090B` ink,
`#71717A` muted, `#E4E4E7` lines. Same typeface too: Plus Jakarta Sans. A site
and an app that disagree about their blue look like two products.

**Pricing is transcribed from `src/theme/plans.js`** in the app repo. If a limit
changes there, it has to change on `pricing.html` too, there is no shared
source between them.

**The FAQs are `<details>`**, not a JavaScript accordion. They open with the
script blocked, they are keyboard operable for free, and in most browsers
Ctrl+F finds text inside a closed one, which is what somebody hunting for
"refund" is actually doing.

---

## SEO

Already in place: unique title and meta description per page, canonical URLs,
Open Graph and Twitter cards, `MobileApplication` and `FAQPage` JSON-LD on the
home page, `Product` with an `AggregateOffer` on pricing, semantic landmarks,
one `<h1>` per page, a skip link, `robots.txt` and `sitemap.xml`.

The FAQ answers are duplicated into the JSON-LD deliberately, that is what can
earn the expandable questions under a search result, and Google requires the
structured answer to match the visible one word for word. **If you edit a
question on the page, edit it in the `FAQPage` block too**, or the markup is
invalid and gets ignored.

Worth doing once it is live:

1. Submit the sitemap in Google Search Console.
2. Add `assets/og.png` (1200 × 630), the social tags reference it, and a link
   shared to WhatsApp with no preview card gets far fewer taps.
3. Keep the `<h1>` as the sentence a student would actually search for.

---

## Deploying

Any static host. It is five HTML files and four assets.

```bash
# Netlify
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# Cloudflare Pages
npx wrangler pages deploy .
```

GitHub Pages works too: push the folder, then Settings → Pages → deploy from
branch. Whatever you choose, put it behind HTTPS, Play will not accept a
privacy policy URL that is not.

**One thing to check after deploying:** some hosts strip `.html` and serve
`/privacy` instead of `/privacy.html`, redirecting one to the other. If yours
does, update the `<link rel="canonical">` on each page to match what is
actually served, or Google indexes one URL while you point it at another.
Netlify and Vercel both do this by default; it can be turned off in their
settings if you would rather keep the extensions.

To preview locally:

```bash
npx serve .
```
