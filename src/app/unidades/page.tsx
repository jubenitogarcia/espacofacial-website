import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Unidades",
  description: "Endereços e contatos das unidades Espaço Facial.",
  alternates: { canonical: `${siteUrl}/unidades` },
  openGraph: {
    title: "Unidades | Espaço Facial",
    description: "Endereços e contatos das unidades Espaço Facial.",
    url: `${siteUrl}/unidades`,
    type: "website",
  },
};

export default function UnitsIndex() {
  return (
    <>
      <Header />
      <main className="container">
        <section className="pageSection" style={{ marginTop: 40 }}>
          <h1 className="sectionTitle">Nossas Unidades</h1>
          <p className="sectionSub">Clique no ponto no mapa ou no nome da unidade para abrir.</p>
          <UnitsMapSection />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
