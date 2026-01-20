import "@/styles/globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import CampaignAttribution from "@/components/CampaignAttribution";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com";
const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "";
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: {
    index: false,
    follow: false,
  },
  title: {
    default: "Espaço Facial",
    template: "%s | Espaço Facial",
  },
  description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
  openGraph: {
    title: "Espaço Facial",
    description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
    url: siteUrl,
    siteName: "Espaço Facial",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/icon.svg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Espaço Facial",
  url: siteUrl,
  logo: `${siteUrl.replace(/\/$/, "")}/icon.svg`,
  // TODO: adicionar sameAs (Instagram/Facebook oficiais) e contato oficial.
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {buildSha ? <meta name="x-app-build" content={buildSha} /> : null}
        {buildTime ? <meta name="x-app-build-time" content={buildTime} /> : null}
      </head>
      <body>
        <Suspense fallback={null}>
          <CampaignAttribution />
        </Suspense>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
