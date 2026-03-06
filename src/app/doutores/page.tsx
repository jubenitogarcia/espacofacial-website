import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import DoctorsLandingExperience from "@/components/DoctorsLandingExperience";

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
      <Header />
      <main className="container">
        <DoctorsLandingExperience />

        <section id="directory-grid" className="pageSection" style={{ marginTop: 40 }}>
          <UnitDoctorsGrid mode="directory" />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
