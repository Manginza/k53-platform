# SEO audit fixes for skdriving.co.za (branch: seo/audit-fixes)

You are working in the k53-platform repo (Next.js 14 App Router, Supabase, Yoco payments), live at https://www.skdriving.co.za.
An SEO audit (Nov 14, 2026) found the problems below. Implement all of them. Investigate the code yourself and choose the best approach;
these describe outcomes, not line edits.

## Hard constraints
- Do NOT break: login/registration/auth flows, middleware auth gating, Yoco payments and webhooks, the paywall/entitlement checks for paid content
  (quiz tests beyond the free sample, live-notes, videos, resources stay gated), the WhatsApp webhook (`app/api/whatsapp/*`), cron routes.
- Do not change env vars, Supabase schema, or production data. Do not add new required env vars.
- `npm run build`, `npm run lint` and `npx tsc --noEmit` and `npm test` must pass at the end. The build environment may lack Supabase env vars;
  pages you make static must not crash the build if Supabase is unreachable (fall back gracefully, or use the repo's own static data).
- Do not commit or push; I will do that. Do not create new markdown docs except where useful (you may delete nothing unrelated).
- Use the brand name "SK Driving" consistently. Canonical site URL: https://www.skdriving.co.za.

## 1. Unique titles, meta descriptions and canonical tags on every public page
- /courses/2, /courses/3, /courses/4 (and any other /courses/[id]) currently use the home page's title and description. Give each its own,
  e.g. "Code 8 K53 Practice Tests (3 Timed Tests) | SK Driving", via generateMetadata.
- Quiz pages, /register, /login, /privacy-policy and others also inherit the generic home title. Give each public page its own title/description.
  Auth/account/quiz-in-progress pages should be noindex.
- Fix the doubled "| SK Driving | SK Driving" titles on /centers, /driving-schools, /whatsapp/link (check the root layout title template).
- Every public page gets a self-referencing canonical (alternates.canonical), including /courses/*, /centers and /driving-schools province pages.
- Keep meta descriptions to about 155 characters or less (home and centres currently 185–207).
- /pricing needs its own H1 (it currently repeats the home page H1). /resources needs an H1.

## 2. Members-only pages out of the sitemap, and noindexed
- /live-notes/rules and its 8 chapter pages (/live-notes/rules/*), and other gated pages (/live-notes, /videos, /resources, account/admin areas)
  show only a "for full-access members" message to crawlers. Remove them from app/sitemap.ts and mark them noindex (robots meta),
  unless you give them a genuine free public preview. Keep the gating itself intact.

## 3. Free, crawlable K53 questions and answers (biggest content win)
- Create /k53-questions-and-answers: 30–60 sample questions grouped into the three K53 test sections
  (vehicle controls, road signs, rules of the road), each with the options, the correct answer, and a one-line reason,
  all server-rendered in the HTML and visible without login. Use real questions already in the app's data where possible
  (`questions_dump.json` in the repo root has 327 questions with correct answers and image refs; see how the app resolves question images
  and explanations, e.g. lib/explanations.ts, lib/quiz-format.ts). Prefer a statically generated page built from repo data, not a runtime DB call.
  Pick questions that make sense without the image, or render the image if the app has a public URL for it.
- Do not claim these are the "real/official test questions"; say they are practice questions based on the official K53 manual.
- Add a printable version at /k53-questions-and-answers-pdf (print-friendly layout with a "Print / Save as PDF" button), linked from the main page.
- End each section with a CTA "Take the full timed test" linking to /register?trial=1.
- Link these pages from the home page, the study guide (/k53-learners-study-guide) and /courses. Add them to the sitemap.
- Add FAQPage (or Quiz) JSON-LD on the questions page.
- Make sure middleware does not block these routes for logged-out users.

## 4. Server-render the driving-centre and driving-school directories
- /centers and /driving-schools load the actual listings client-side after page load, so they aren't in the HTML, and province views use
  ?province= query URLs with no canonical.
- Render the listings server-side (in the initial HTML). Give each province its own path (e.g. /centers/gauteng, /driving-schools/gauteng)
  with its own title, description, H1, canonical and the listings in HTML; old ?province= URLs should redirect (308) to the new paths.
  Add the province pages to the sitemap. Keep any existing client-side filtering/search working as progressive enhancement.
  Data sources must degrade gracefully at build time (use ISR/revalidate or dynamic rendering if the data comes from Supabase).

## 5. Structured data
- Add Organization JSON-LD (name SK Driving, url, logo, contact phone/WhatsApp from lib/contact.ts) site-wide or on the home page.
- FAQPage/Quiz on the new question pages; BreadcrumbList on course and province pages where cheap. Keep existing valid schema.

## 6. Other quick wins
- Remove the public "Admin" link from the footer (admin routes stay reachable directly).
- One brand name: footer says "© 2026 K53 Learner's" — change to SK Driving.
- Add alt text to the image that has none on every page (likely in a shared header/footer/layout).
- Public marketing pages are rendered with cache-control no-store; where a public page doesn't depend on the user session, make it static or ISR
  (e.g. revalidate) so it can be cached. Don't do this for anything personalised or gated.
- Make sure robots.ts and sitemap.ts stay valid; sitemap lists only indexable public URLs with the canonical www host.

## Done when
- All the above are implemented, the paywall/auth/payments/WhatsApp webhook behave as before, and build, lint, typecheck and tests pass.
- Finish with a short summary of what you changed, file by file, and anything you could not do.
