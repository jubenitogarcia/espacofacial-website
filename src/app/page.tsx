import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitFilter from "@/components/UnitFilter";
import UnitCards from "@/components/UnitCards";
import DoctorsGrid from "@/components/DoctorsGrid";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <Header />

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
        <section id="unidades">
          <h2 className="sectionTitle">Nossas Unidades</h2>
          <p className="sectionSub">
            Selecione uma unidade para ver informações e agendar.
            {/* TODO: substituir este texto por copy oficial (sem números/claims não confirmados). */}
          </p>
          <UnitCards />
        </section>

        <section id="agende" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossos Doutores</h2>
          <p className="sectionSub">
            Conheça nossos profissionais e agende na unidade selecionada.
            {/* TODO: adicionar especialidades/CRMs e descrições reais por profissional. */}
          </p>
          <DoctorsGrid />
        </section>
      </main>

      <Footer />
      <FloatingContact />
    </>
  );
}
