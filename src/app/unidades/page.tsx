import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnitCards from "@/components/UnitCards";
import FloatingContact from "@/components/FloatingContact";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Unidades",
  description: "Veja as unidades e selecione a mais próxima para agendar.",
  alternates: { canonical: `${siteUrl}/unidades` },
};

export default function UnitsIndex() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>Unidades</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>
          Selecione sua unidade para ver contatos, redes e caminhos de agendamento.
        </p>
        <UnitCards />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
