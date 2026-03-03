import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import AboutUsSection from "@/components/AboutUsSection";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Sobre Nós",
  description: "Conheça a Espaço Facial, nossa equipe e abordagem em harmonização.",
  alternates: { canonical: `${siteUrl}/sobre` },
  openGraph: {
    title: "Sobre Nós | Espaço Facial",
    description: "Conheça a Espaço Facial, nossa equipe e abordagem em harmonização.",
    url: `${siteUrl}/sobre`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container">
        <section className="pageSection" style={{ marginTop: 40 }}>
          <h1 className="sectionTitle">Sobre Nós</h1>
          <AboutUsSection />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
