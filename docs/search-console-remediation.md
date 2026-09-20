# Search Console remediation

Status updated 20 September 2026 from the production route audit and current official pricing research.

## Completed

- [x] The apex (`https://feedlark.com`) has been verified live as a permanent 308 redirect to `https://www.feedlark.com`.
- [x] The `www` origin is the source-of-truth fallback for canonical metadata, JSON-LD, email and feed links.
- [x] The sitemap contains only `www` URLs and now links directly to the public Feedlark board, roadmap and changelog instead of the redirect-only `/feedback` shortcut.
- [x] All navigation and the public badge now use final, non-redirecting public URLs.
- [x] Static marketing routes, `robots.txt` and `sitemap.xml` use a one-week revalidation interval. Dynamic public boards retain their existing one-hour ISR and mutation-triggered revalidation.
- [x] Comparison pages now include a product-specific evaluation note and a current official pricing source. These sources were checked on 20 September 2026.

## Intentional exclusions

`/privacy`, `/cookies` and `/terms` are legal/support documents, not acquisition pages. They remain accessible from the footer but are intentionally `noindex`. The Search Console noindex report for privacy and cookies is therefore expected, not a defect. `/terms` now follows the same explicit policy.

## Follow-up after release

- [ ] Submit the canonical `https://www.feedlark.com/sitemap.xml` in Search Console if the property has an older sitemap URL saved.
- [ ] Use Search Console's URL Inspection tool to request recrawls for the affected canonical URLs. Google controls crawl and indexing timing, so this cannot be forced by the application.
