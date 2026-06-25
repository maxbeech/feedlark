import Link from "next/link";
import { Logo } from "@/components/logo";

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/feedback", label: "Our roadmap" },
      { href: "/feedback/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Alternatives",
    links: [
      { href: "/alternatives/canny", label: "Canny alternative" },
      { href: "/alternatives/featurebase", label: "Featurebase alternative" },
      { href: "/alternatives/productboard", label: "Productboard alternative" },
      { href: "/alternatives/nolt", label: "Nolt alternative" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { href: "/use-cases/saas", label: "For SaaS" },
      { href: "/use-cases/indie-hackers", label: "For indie hackers" },
      { href: "/use-cases/startups", label: "For startups" },
      { href: "/use-cases/mobile-apps", label: "For mobile apps" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-cream/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Customer feedback boards, a public roadmap and a changelog. Unlimited users, no growth tax.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-spruce-50 px-2.5 py-1 text-[11px] font-medium text-spruce-700 ring-1 ring-inset ring-spruce-100">
            Free forever for unlimited voters
          </span>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold text-ink">{c.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-muted transition-colors hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sand-200 py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Feedlark. Built for teams who close the loop.
      </div>
    </footer>
  );
}
