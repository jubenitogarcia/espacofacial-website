import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnitCards from "@/components/UnitCards";
import FloatingContact from "@/components/FloatingContact";

export const metadata = {
  title: "Unidades | Espaço Facial",
  description: "Veja todas as unidades da Espaço Facial e selecione a mais próxima.",
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
