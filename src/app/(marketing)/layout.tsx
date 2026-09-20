import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

// Marketing copy is static. Weekly ISR keeps it inexpensive at the edge while
// deployments still publish corrections immediately.
export const revalidate = 604800;

// Marketing pages are statically rendered (no cookies read here) so they stay
// fast + cacheable for SEO. Auth-aware UI lives behind /dashboard.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
