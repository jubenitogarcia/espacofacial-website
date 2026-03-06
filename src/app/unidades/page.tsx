import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";
import ExperienceTracker from "@/components/ExperienceTracker";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import { units } from "@/data/units";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

const featuredUnits = units.filter((unit) => ["barrashoppingsul", "novo-hamburgo"].includes(unit.slug));
const unitsByState = new Set(units.map((unit) => unit.state).filter(Boolean)).size;
const cityBySlug: Record<string, string> = {
  barrashoppingsul: "Porto Alegre",
  "novo-hamburgo": "Novo Hamburgo",
};

export const metadata: Metadata = {
  title: "Unidades e Endereços",
  description:
    "Confira endereços, contatos e mapa das unidades Espaço Facial para escolher a clínica mais próxima de você.",
  alternates: { canonical: `${siteUrl}/unidades` },
  openGraph: {
    title: "Unidades e Endereços | Espaço Facial",
    description:
      "Confira endereços, contatos e mapa das unidades Espaço Facial para escolher a clínica mais próxima de você.",
    url: `${siteUrl}/unidades`,
    type: "website",
  },
};

export default function UnitsIndex() {
  return (
    <>
      <ExperienceTracker page="/unidades" experience="local_landing_v2" variant="featured-units" />
      <Header />
      <main className="container">
        <section className="pageSection pageNarrative" style={{ marginTop: 40 }}>
          <div className="pageNarrative__intro">
            <span className="pageNarrative__eyebrow">Escolha a unidade com mais contexto</span>
            <h1 className="sectionTitle">Nossas Unidades</h1>
            <p className="sectionSub pageNarrative__sub">
              Use as unidades destacadas para abrir endereço, equipe e agendamento em poucos cliques. O mapa completo permanece disponível para navegação geográfica.
            </p>
          </div>

          <div className="pageNarrative__stats" role="group" aria-label="Panorama das unidades">
            <div className="pageNarrative__stat">
              <strong>{featuredUnits.length}</strong>
              <span>unidades com jornada digital destacada</span>
            </div>
            <div className="pageNarrative__stat">
              <strong>{unitsByState}</strong>
              <span>estados representados no mapa</span>
            </div>
            <div className="pageNarrative__stat">
              <strong>Mapa + contato</strong>
              <span>decisão rápida por proximidade, rota e agenda</span>
            </div>
          </div>
        </section>

        <section className="pageSection decisionCardsSection" aria-label="Unidades destacadas para decisão rápida">
          <div className="decisionCards">
            {featuredUnits.map((unit) => (
              <article key={unit.slug} className="decisionCard decisionCard--unit">
                <div className="decisionCard__eyebrow">{cityBySlug[unit.slug] ?? unit.state ?? "Unidade"}</div>
                <h2>{unit.name}</h2>
                <p>{unit.addressLine ? unit.addressLine : "Abra a unidade para ver detalhes e contato direto."}</p>

                <div className="decisionCard__meta">
                  <span className="decisionCard__metaItem">Página local dedicada</span>
                  <span className="decisionCard__metaItem">Contato direto da unidade</span>
                  <span className="decisionCard__metaItem">Entrada imediata no agendamento</span>
                </div>

                <div className="decisionCard__actions">
                  <Link href={`/${unit.slug}`} className="decisionCard__primary">
                    Ver unidade
                  </Link>
                  <TrackedBookingLink
                    href={`/agendamento?unit=${encodeURIComponent(unit.slug)}`}
                    className="decisionCard__secondary"
                    placement="units_page"
                    unitSlug={unit.slug}
                  >
                    Agendar nesta unidade
                  </TrackedBookingLink>
                </div>

                {unit.maps ? (
                  <a href={unit.maps} className="decisionCard__link" target="_blank" rel="noreferrer">
                    Abrir rota no mapa
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="pageSection pageNarrative pageNarrative--compact">
          <div className="pageNarrative__intro">
            <h2 className="sectionTitle">Mapa completo de unidades</h2>
            <p className="sectionSub pageNarrative__sub">Clique no ponto no mapa ou no nome da unidade para abrir a página correspondente.</p>
          </div>
          <UnitsMapSection />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
