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
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Free customer feedback boards, public roadmap & changelog. No growth tax.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold text-ink">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-muted hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} Feedlark. Built for teams who actually ship.
      </div>
    </footer>
  );
}
