import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import AboutUsSection from "@/components/AboutUsSection";
import HomeHeroExperience from "@/components/HomeHeroExperience";
import { getHeroMediaItems, heroVariantFromUserAgent } from "@/lib/heroMedia.server";
import type { Metadata } from "next";
import { headers } from "next/headers";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Clínica de Harmonização Facial e Corporal",
  description:
    "Espaço Facial: harmonização facial e corporal com equipe especializada. Escolha sua unidade e agende seu atendimento com segurança.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Espaço Facial | Clínica de Harmonização Facial e Corporal",
    description:
      "Espaço Facial: harmonização facial e corporal com equipe especializada. Escolha sua unidade e agende seu atendimento com segurança.",
    url: `${siteUrl}/`,
    type: "website",
  },
};

export default async function HomePage() {
  const requestHeaders = await headers();
  const ua = requestHeaders.get("user-agent");
  const variant = heroVariantFromUserAgent(ua);
  const { items: heroItems } = await getHeroMediaItems({ variant });

    return (
        <>
            <Header />
            <HomeHeroExperience heroItems={heroItems} initialMediaVariant={variant} />

      <main className="container">
        <section className="homeEditorialRail" aria-label="Teses da marca">
          <article className="homeEditorialRail__card">
            <span className="homeEditorialRail__eyebrow">Tese 01</span>
            <h2>Harmonização não precisa parecer procedimento.</h2>
            <p>O projeto clínico parte da leitura do rosto e do corpo, não do cardápio de técnicas.</p>
          </article>

          <article className="homeEditorialRail__card homeEditorialRail__card--accent">
            <span className="homeEditorialRail__eyebrow">Tese 02</span>
            <h2>Boa estética combina repertório visual com disciplina de indicação.</h2>
            <p>Decisão forte é saber o que fazer, em que ritmo fazer e o que não precisa entrar no plano.</p>
          </article>

          <article className="homeEditorialRail__card">
            <span className="homeEditorialRail__eyebrow">Tese 03</span>
            <h2>O site já deve funcionar como triagem inteligente.</h2>
            <p>Unidade, especialista e agenda aparecem como uma mesma conversa, não como páginas soltas.</p>
          </article>
        </section>

        <AboutUsSection />

        <section id="doutores" className="pageSection" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossos Doutores</h2>
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
