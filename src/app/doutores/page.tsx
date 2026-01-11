import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import DoctorsGrid from "@/components/DoctorsGrid";

export const metadata = {
  title: "Doutores | Espaço Facial",
  description: "Conheça nossos especialistas e agende seu atendimento.",
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
