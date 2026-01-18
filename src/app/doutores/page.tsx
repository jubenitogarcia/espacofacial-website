import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import DoctorsGrid from "@/components/DoctorsGrid";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Doutores",
  description: "Conheça nossos profissionais e agende na unidade selecionada.",
  alternates: { canonical: `${siteUrl}/doutores` },
};

export default function DoctorsIndex() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>Nossos Doutores</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>
          Selecione um doutor(a) para agendar.
        </p>
        <DoctorsGrid />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
