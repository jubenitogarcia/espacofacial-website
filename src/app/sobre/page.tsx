import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Sobre Nós",
  description: "Conheça a proposta da Espaço Facial.",
  alternates: { canonical: `${siteUrl}/sobre` },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>Sobre Nós</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>
          Página institucional (história, missão, visão, valores, embaixadores e diferenciais).
        </p>

        <div className="card" style={{ marginTop: 18 }}>
          <h3>Pronto para colar o conteúdo</h3>
          <p>
            Assim que você me passar o texto da página “Sobre Nós” do Wix (ou eu capturar no site), eu insiro aqui já com SEO.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
