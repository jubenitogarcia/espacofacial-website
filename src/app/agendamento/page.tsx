import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import BookingFlow from "@/components/BookingFlow";
import BookingHeroExperience from "@/components/BookingHeroExperience";

export const metadata = {
    title: "Agendamento de Procedimentos",
    description:
        "Agende online seu atendimento na Espaço Facial escolhendo unidade, profissional, procedimento e horário.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "/agendamento",
    },
};

export default function AgendamentoPage() {
    return (
        <>
            <Header />
            <main className="bookingPage">
                <BookingHeroExperience />

                <section className="bookingPrep" aria-label="Preparação para o agendamento">
                    <div className="container bookingPrep__grid">
                        <article className="bookingPrep__card">
                            <span className="bookingPrep__eyebrow">Entrada 01</span>
                            <h2>Escolha a unidade primeiro.</h2>
                            <p>Ela libera equipe, procedimento e horários reais. Sem isso, o fluxo fica propositalmente travado para evitar erro de contexto.</p>
                        </article>

                        <article className="bookingPrep__card bookingPrep__card--accent">
                            <span className="bookingPrep__eyebrow">Entrada 02</span>
                            <h2>Sem preferência acelera.</h2>
                            <p>Se a prioridade é encaixe, use a opção sem doutor definido e deixe o sistema abrir a grade mais ampla da unidade.</p>
                        </article>

                        <article className="bookingPrep__card">
                            <span className="bookingPrep__eyebrow">Entrada 03</span>
                            <h2>“Quero orientação” é um atalho, não um impasse.</h2>
                            <p>Quando o procedimento ainda não está claro, vale mais avançar com o fluxo correto do que travar a decisão cedo demais.</p>
                        </article>
                    </div>
                </section>

                <section id="booking-flow" className="bookingFlowSection">
                    <BookingFlow />
                </section>
            </main>
            <Footer />
            <FloatingContact />
        </>
    );
}
