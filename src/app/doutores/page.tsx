import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import ExperienceTracker from "@/components/ExperienceTracker";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import DoctorsDirectoryStats from "@/components/DoctorsDirectoryStats";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Equipe de Doutores",
  description:
    "Conheça os doutores da Espaço Facial, suas especialidades e agende seu atendimento na unidade escolhida.",
  alternates: { canonical: `${siteUrl}/doutores` },
  openGraph: {
    title: "Equipe de Doutores | Espaço Facial",
    description:
      "Conheça os doutores da Espaço Facial, suas especialidades e agende seu atendimento na unidade escolhida.",
    url: `${siteUrl}/doutores`,
    type: "website",
  },
};

export default function DoctorsIndex() {
  return (
    <>
      <ExperienceTracker page="/doutores" experience="authority_directory_v2" variant="open-directory" />
      <Header />
      <main className="container">
        <section className="pageSection pageNarrative" style={{ marginTop: 40 }}>
          <div className="pageNarrative__intro">
            <span className="pageNarrative__eyebrow">Especialistas e decisão assistida</span>
            <h1 className="sectionTitle">Nossos Doutores</h1>
            <p className="sectionSub pageNarrative__sub">
              Veja o diretório completo, compare os perfis com menos atrito e entre no agendamento já com o profissional escolhido quando fizer sentido.
            </p>
          </div>

          <DoctorsDirectoryStats />
        </section>

        <section className="pageSection decisionCardsSection" aria-label="Como escolher seu profissional">
          <div className="decisionCards">
            <article className="decisionCard">
              <div className="decisionCard__eyebrow">Critério 1</div>
              <h2>Escolha por unidade</h2>
              <p>Se a localização manda na decisão, selecione a unidade no topo e o diretório será filtrado automaticamente.</p>
              <div className="decisionCard__meta">
                <span className="decisionCard__metaItem">Menos opções irrelevantes</span>
                <span className="decisionCard__metaItem">Agenda mais rápida</span>
              </div>
            </article>

            <article className="decisionCard">
              <div className="decisionCard__eyebrow">Critério 2</div>
              <h2>Escolha por perfil</h2>
              <p>Abra o Instagram do doutor para entender linguagem visual, estilo de conteúdo e proximidade com o que você procura.</p>
              <div className="decisionCard__meta">
                <span className="decisionCard__metaItem">Autoridade percebida</span>
                <span className="decisionCard__metaItem">Comparação mais intuitiva</span>
              </div>
            </article>

            <article className="decisionCard">
              <div className="decisionCard__eyebrow">Critério 3</div>
              <h2>Escolha pela agenda</h2>
              <p>Se a prioridade é velocidade, entre direto no agendamento e use a opção sem preferência para ampliar a disponibilidade.</p>
              <div className="decisionCard__actions">
                <TrackedBookingLink href="/agendamento" className="decisionCard__primary" placement="doctors_page">
                  Ir para o agendamento
                </TrackedBookingLink>
              </div>
            </article>
          </div>
        </section>

        <section className="pageSection" style={{ marginTop: 40 }}>
          <UnitDoctorsGrid mode="directory" />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
