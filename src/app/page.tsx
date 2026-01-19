import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitFilter from "@/components/UnitFilter";
import UnitsMapSection from "@/components/UnitsMapSection";
import DoctorsGrid from "@/components/DoctorsGrid";
import Image from "next/image";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Espaço Facial",
  description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
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
        <Image
          src="/images/hero.svg"
          alt="Espaço Facial"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="heroOverlay" />

        <div className="heroBox">
          <UnitFilter />
        </div>
      </section>

      <main className="container">
        <section id="unidades" className="pageSection">
          <h2 className="sectionTitle">Nossas Unidades</h2>
          <p className="sectionSub">
            Clique no ponto no mapa ou no nome da unidade para abrir.
            {/* TODO: substituir este texto por copy oficial. */}
          </p>
          <UnitsMapSection />
        </section>

        <section id="doutores" className="pageSection" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossos Doutores</h2>
          <p className="sectionSub">
            Conheça nossos profissionais e agende na unidade selecionada.
            {/* TODO: adicionar especialidades/CRMs e descrições reais por profissional. */}
          </p>
          <DoctorsGrid />
        </section>

        <section id="termos" className="pageSection" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Termos</h2>
          <p className="sectionSub">
            Termos de uso, privacidade e políticas. Todo o conteúdo pode ser colado aqui (texto do Wix) para manter 1:1.
          </p>

          <div className="card">
            <h3>Conteúdo</h3>
            <p>
              Cole aqui os Termos de Uso, Política de Privacidade e demais políticas. Se preferir, podemos carregar via CMS/Markdown.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingContact />
    </>
  );
}
