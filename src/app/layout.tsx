import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "customer feedback tool",
    "feedback board",
    "public roadmap",
    "changelog tool",
    "Canny alternative",
    "Featurebase alternative",
    "feature request tool",
  ],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
