import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitFilter from "@/components/UnitFilter";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

export const metadata: Metadata = {
    title: "Agendamento",
    description: "Selecione sua unidade para agendar.",
    alternates: { canonical: `${siteUrl}/agendamento` },
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
