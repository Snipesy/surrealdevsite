# surrealdev.com

Source for [surrealdev.com](https://surrealdev.com), Snipesy's blog. A static [Astro](https://astro.build) site on Cloudflare Pages, with media in R2 and one Pages Function for the forms.

```
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/ (+ search index)
```

Node 22+ recommended.

## 1. Where things live

| What | Where |
| --- | --- |
| Posts | `src/content/posts/<year>/<slug>.md` |
| Pages | `src/content/pages/<slug>.md` |
| Categories | `src/data/categories.json` |
| Images, videos, downloads | R2 bucket, served at `media.surrealdev.com`; local copies in `media/` (not in git). See "Media" below |
| Logos, favicon | `public/logo-white.svg`, `public/logo-black.svg`, `public/favicon.png` |
| Form handler | `functions/api/form.js` (Cloudflare Pages Function) |

## 2. Writing posts

Add a Markdown file to `src/content/posts/<year>/`, named in lowercase-with-hyphens. The file name (not the folder) is the URL: `posts/2026/my-post.md` → `/my-post/`.

~~~md
---
title: "An awesome post about cars"
date: 2026-11-01
categories: ["automotive-ramblings"]
excerpt: "Optional; otherwise the first lines are used."
cover: "/images/part3.jpg"   # optional
draft: true                  # optional, hides it
---

Text, `code`, images: ![alt](/images/part3-board.jpg)

```java
public final void onCreate(Bundle b) { ... }
```
~~~

Put new images in `media/images/` and link them as `/images/...`; run `npm run media -- --yes` before deploying (see "Media"). Raw HTML works anywhere in Markdown.

Categories are slugs from `src/data/categories.json`; add a new entry there for a new category (`path` is its URL under `/category/`).

## 3. URLs

| URL | Source |
| --- | --- |
| `/<post-slug>/`, `/<page-slug>/` | `src/pages/[...slug].astro` |
| `/page/2/` | `src/pages/page/[page].astro` |
| `/category/software/gretio/` | `src/pages/category/[...path].astro` |
| `/2026/08/` | `src/pages/[year]/[month].astro` |
| `/feed/` → `/rss.xml` | `public/_redirects` |
| `/archive/`, `/search/` | new |

A page whose slug matches a category (e.g. `/gretio/`) automatically lists the latest posts from it.

Site name, nav and social links live in `src/site.ts`. Styles are in `src/styles/global.css` (colours are variables at the top; light and dark themes follow the visitor's system with a toggle).

## 4. Deploy

The site is built for Cloudflare Pages: `functions/` (the form handler) and `public/_redirects` are Pages features. Connect the GitHub repo to a Pages project and every push redeploys.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22
- Variables: see "Forms" (the build fails without `PUBLIC_TURNSTILE_SITE_KEY`)

Upload new media with `npm run media -- --yes` before pushing posts that use it.

### Staging

The `staging` branch deploys to `staging.surrealdev.com`, a full copy of the site with working forms, for testing before `main`.

- Try changes: `git push origin <your-branch>:staging` (or merge into `staging`), then check `staging.surrealdev.com`.
- `public/_headers` keeps it out of search engines; form emails from it say `(staging.surrealdev.com)` in the subject.

One-time setup in Cloudflare:
1. DNS for surrealdev.com: add a CNAME `staging` → `staging.<pages-project>.pages.dev` (proxied).
2. Pages project → Settings → Variables and Secrets: set the form variables for the **Preview** environment too.
3. Turnstile widget → Hostnames: add `staging.surrealdev.com`.
4. Optional: Zero Trust → Access → protect `staging.surrealdev.com` so only you can open it (free for up to 50 users).

## 5. Forms

A page gets a form by adding `form:` to its frontmatter (see `contact.md`; fields are checked by `src/content.config.ts`):

~~~yaml
form:
  fields:
    - { name: email, label: "Your email", type: email, required: true }
    - { name: message, label: "Message", type: textarea, help: "Optional hint under the field" }
  note: "Shown above the submit button."
~~~

Types: `text`, `email`, `textarea`, `select` (with `options`), `checkbox`. File uploads aren't supported; ask for documents by email instead. A field named `email` becomes the reply-to; `subject` becomes the email subject.

`src/components/Form.astro` renders it with a Cloudflare Turnstile check. On submit it posts to `functions/api/form.js`, which verifies Turnstile, rejects bots that fill a hidden field, accepts only the forms and fields listed in `/form-manifest.json` (built from the frontmatter by `src/pages/form-manifest.json.ts`), and emails the submission via [Resend](https://resend.com).

**Setup (once):**

1. Cloudflare dashboard → Turnstile → add a widget for `surrealdev.com`. Copy the keys.
2. Resend → verify the `surrealdev.com` domain and create an API key.
3. Pages project → Settings → Variables and Secrets:
   - `PUBLIC_TURNSTILE_SITE_KEY`: site key (used at build time)
   - `TURNSTILE_SECRET_KEY`: secret key (encrypt)
   - `RESEND_API_KEY`: API key (encrypt)
   - `FORM_TO`: where submissions go (comma-separate several)
   - `FORM_FROM`: e.g. `surrealdev.com <forms@surrealdev.com>`

A Cloudflare Pages build fails if `PUBLIC_TURNSTILE_SITE_KEY` isn't set. Off localhost the function also refuses Turnstile test secrets and `FORM_DRY_RUN`.

**Rate limit (recommended):** Cloudflare dashboard → surrealdev.com → Security → WAF → Rate limiting rules → create a rule: URI Path equals `/api/form`, 5 requests per 1 minute per IP, action Block. Turnstile stops bots, but a rate limit keeps someone with cheap captcha solves from using up the Resend quota.


**Testing locally:** `npm run dev` doesn't run functions. Use `cp .dev.vars.example .dev.vars`, `npm run build`, then `npx wrangler pages dev dist`. With `FORM_DRY_RUN=1` the email is printed to the terminal instead of sent.

## 6. Media

Images, videos and downloads aren't in git. They're in a Cloudflare R2 bucket with its own domain, `media.surrealdev.com`.

- **In content**, link them by path: `/images/part3.jpg`, with the file at `media/images/part3.jpg`. Imported images are named by a hash of their contents (`/images/3f9a1c2b7e40.png`) so original filenames (camera numbers, screenshot timestamps) aren't published; new ones can be named anything.
- **`npm run build`** rewrites those paths in the built HTML to `https://media.surrealdev.com/...` (`src/integrations/media.mjs`; override with the `MEDIA_URL` env var). `dist/` contains no media.
- **`npm run dev`** serves files from `media/` if they're there, otherwise redirects to the bucket. A fresh clone works without downloading anything.
- **Post thumbnails** are generated into `media/thumbs/` by `scripts/thumbs.mjs` and uploaded with everything else.

**Uploading:** `npm run media` shows what's new or changed compared with the bucket. `npm run media -- --yes` uploads it. It never deletes from the bucket. It refuses to upload photos that contain GPS coordinates; `npm run media -- strip <files>` removes their metadata.

**Setup (once):**

1. Cloudflare → R2 → create bucket `surrealdevcom`.
2. Bucket → Settings → Custom Domains → connect `media.surrealdev.com`. Use this instead of the `r2.dev` URL, which is rate-limited and not meant for production.
3. R2 → Manage API tokens → create a token with **Object Read & Write** limited to **that bucket only**.
4. `cp .env.example .env` and fill in the account ID and token keys. `.env` is git-ignored; never commit it.
5. `npm run media -- --yes` to upload everything the first time.

Contributors don't need any of this to run the site. Since `media/` is git-ignored, a pull request can't carry images: attach them to the PR and the maintainer uploads them.

## 7. Pre-commit hook

`npm install` sets git to use `.githooks/`, whose pre-commit hook (`scripts/pre-commit.mjs`) checks the staged files and blocks the commit if any of these turn up:

- `.env`, `.dev.vars`, private keys, or anything in `media/`
- something that looks like a Resend key, Turnstile secret, AWS/R2 key or private key, or a filled-in secret variable
- a photo or video with location data (the same check as `npm run media`)
- a file over 2 MB (put it in the bucket)
- a post or page with broken frontmatter, or an accessibility problem: an image without alt text, a `#` heading in the body (the title is the page's only h1), a skipped heading level, an image inside a heading, a link without text, or an `<iframe>` without a title

Mark a purely decorative image with `<img src="..." alt="" role="presentation">`.

The same content checks run on their own with `npm run check`, and before every `npm run build`, so a Cloudflare build fails rather than publishing a broken page.

Skip it for one commit with `git commit --no-verify`.

## 8. Analytics, comments, search

- **Analytics.** None. Add a script tag (Plausible, Cloudflare Web Analytics) in `src/layouts/Base.astro`.
- **Comments.** None. If you want them, [Giscus](https://giscus.app) (GitHub Discussions) is a one-script addition to `src/pages/[...slug].astro`.
- **Search** is [Pagefind](https://pagefind.app), built by `npm run build`; it doesn't work in `npm run dev`.

## License

The source code is licensed under the [Apache License 2.0](LICENSE).

The content isn't: posts, pages, images, videos and other media are copyright their writer or creator, all rights reserved unless a post says otherwise. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
