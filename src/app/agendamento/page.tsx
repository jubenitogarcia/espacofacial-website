import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitFilter from "@/components/UnitFilter";

export const metadata = {
    title: "Agendamento | Espaço Facial",
    description: "Selecione sua unidade para agendar via WhatsApp.",
};

export default function AgendamentoPage() {
    return (
        <>
            <Header />
            <main className="container" style={{ paddingTop: 26 }}>
                <h1 style={{ marginBottom: 6 }}>Agendamento</h1>
                <p style={{ color: "#6b6b6b", marginTop: 0, lineHeight: 1.5 }}>
                    Selecione sua unidade para abrir o atendimento no WhatsApp.
                </p>

                <div className="card" style={{ marginTop: 16, background: "#0f0f10", color: "#fff" }}>
                    <UnitFilter />
                </div>
            </main>
            <Footer />
            <FloatingContact />
        </>
    );
}
