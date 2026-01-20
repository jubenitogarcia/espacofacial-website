import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import HeroMedia from "@/components/HeroMedia";
import AboutUsSection from "@/components/AboutUsSection";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Espaço Facial",
  description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Espaço Facial",
    description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
    url: `${siteUrl}/`,
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Header />

      <h1 className="srOnly">Espaço Facial</h1>

      <section className="hero" aria-label="Destaque">
        <HeroMedia />
        <div className="heroOverlay" />
      </section>

      <main className="container">
        <AboutUsSection />

        <section id="doutores" className="pageSection" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossos Doutores</h2>
          <p className="sectionSub">
            Selecione uma unidade no cabeçalho para ver a equipe.
          </p>
          <UnitDoctorsGrid />
        </section>

        <section id="unidades" className="pageSection" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossas Unidades</h2>
          <p className="sectionSub">
            Clique no ponto no mapa ou no nome da unidade para abrir.
          </p>
          <UnitsMapSection />
        </section>
      </main>

      <Footer />
      <FloatingContact />
    </>
  );
}
