import "@/styles/globals.css";
import type { Metadata } from "next";
import CookieBanner from "@/components/CookieBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Espaço Facial",
    template: "%s | Espaço Facial",
  },
  description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Espaço Facial",
    description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
    url: "/",
    siteName: "Espaço Facial",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
