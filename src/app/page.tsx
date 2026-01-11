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
            Há +6 anos no mercado, e +30 unidades por todo Brasil! Nosso crescimento meteórico reforça o óbvio:
            somos o melhor em auto-cuidado e bem-estar!
          </p>
          <UnitCards />
        </section>

        <section id="agende" style={{ marginTop: 50 }}>
          <h2 className="sectionTitle">Nossos Doutores</h2>
          <p className="sectionSub">
            Conheça nossos doutores altamente qualificados em harmonização facial e corporal e a qualidade de seus procedimentos!
            Selecione e agende o seu momento de auto-cuidado e bem-estar com o seu especialista!
          </p>
          <DoctorsGrid />
        </section>
      </main>

      <Footer />
      <FloatingContact />
    </>
  );
}
