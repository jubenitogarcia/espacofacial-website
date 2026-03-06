import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import HeroMedia from "@/components/HeroMedia";
import AboutUsSection from "@/components/AboutUsSection";
import ExperienceTracker from "@/components/ExperienceTracker";
import TrackedBookingLink from "@/components/TrackedBookingLink";
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
            <ExperienceTracker page="/" experience="home_value_hero_v2" variant="value-led" />
            <Header />

      <section className="hero" aria-label="Destaque">
        <HeroMedia initialItems={heroItems} initialVariant={variant} />
        <div className="heroOverlay" />
        <div className="container heroContent">
          <div className="heroContent__copy">
            <span className="heroContent__eyebrow">Harmonização facial e corporal</span>
            <h1>Resultados elegantes, conduta responsável e acompanhamento real.</h1>
            <p>
              A Espaço Facial combina avaliação criteriosa, equipe especializada e plano de cuidado
              individual para quem quer melhorar a aparência sem cair em excessos.
            </p>
            <div className="heroContent__actions">
              <TrackedBookingLink href="/agendamento" className="heroContent__primary" placement="home_hero">
                Agendar avaliação
              </TrackedBookingLink>
              <a href="#doutores" className="heroContent__secondary">
                Ver especialistas
              </a>
            </div>
            <div className="heroContent__proof">
              <div className="heroContent__proofItem">
                <strong>2 unidades</strong>
                <span>BarraShoppingSul e Novo Hamburgo</span>
              </div>
              <div className="heroContent__proofItem">
                <strong>Equipe especializada</strong>
                <span>Atendimento conduzido por doutores e time clínico</span>
              </div>
              <div className="heroContent__proofItem">
                <strong>Jornada integrada</strong>
                <span>Da avaliação ao retorno, com agenda e confirmação digital</span>
              </div>
            </div>
          </div>

          <div className="heroContent__panel" role="group" aria-label="Motivos para escolher a Espaço Facial">
            <div className="heroContent__panelCard">
              <span className="heroContent__panelLabel">Nossa proposta</span>
              <ul className="heroContent__panelList">
                <li>Diagnóstico estético com foco em equilíbrio, não exagero.</li>
                <li>Plano de tratamento pensado para rotina, segurança e previsibilidade.</li>
                <li>Agendamento online com acompanhamento por canais diretos.</li>
              </ul>
            </div>

            <div className="heroContent__panelCard heroContent__panelCard--soft">
              <span className="heroContent__panelLabel">Próximo passo</span>
              <p>
                Comece pela avaliação para entender o que faz sentido para o seu caso antes de escolher
                o procedimento.
              </p>
              <TrackedBookingLink href="/agendamento" className="heroContent__panelCta" placement="home_panel">
                Iniciar agendamento
              </TrackedBookingLink>
            </div>
          </div>
        </div>
      </section>

      <main className="container">
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
