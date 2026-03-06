import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import BookingFlow from "@/components/BookingFlow";
import ExperienceTracker from "@/components/ExperienceTracker";

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
            <ExperienceTracker page="/agendamento" experience="guided_booking_v2" variant="editorial-guided" />
            <Header />
            <main className="bookingPage">
                <section className="bookingHero">
                    <div className="container bookingHero__shell">
                        <div className="bookingHero__copy">
                            <span className="bookingHero__eyebrow">Agendamento online</span>
                            <h1>Agende sua avaliação com clareza, segurança e resposta rápida.</h1>
                            <p>
                                Escolha unidade, profissional, procedimento e horário em poucos passos. A confirmação segue por
                                e-mail e WhatsApp, sem depender de atendimento manual para iniciar o processo.
                            </p>

                            <div className="bookingHero__actions">
                                <a href="#booking-flow" className="bookingHero__primary">
                                    Começar agora
                                </a>
                                <Link href="/doutores" className="bookingHero__secondary">
                                    Conhecer a equipe
                                </Link>
                            </div>

                            <div className="bookingHero__trust" aria-label="Diferenciais do agendamento">
                                <div className="bookingHero__trustItem">
                                    <strong>Fluxo guiado</strong>
                                    <span>Você avança etapa por etapa sem perder contexto.</span>
                                </div>
                                <div className="bookingHero__trustItem">
                                    <strong>Confirmação multicanal</strong>
                                    <span>Atualização por e-mail e WhatsApp após o envio.</span>
                                </div>
                                <div className="bookingHero__trustItem">
                                    <strong>Janela real de agenda</strong>
                                    <span>Horários exibidos conforme disponibilidade do sistema.</span>
                                </div>
                            </div>
                        </div>

                        <div className="bookingHero__panel" role="group" aria-label="Como funciona">
                            <div className="bookingHero__panelCard">
                                <span className="bookingHero__panelLabel">Como funciona</span>
                                <ol className="bookingHero__steps">
                                    <li>Escolha a unidade no topo e defina o profissional.</li>
                                    <li>Selecione o procedimento e monte o tempo do atendimento.</li>
                                    <li>Reserve o horário e finalize com seus dados.</li>
                                </ol>
                            </div>

                            <div className="bookingHero__panelCard bookingHero__panelCard--soft">
                                <span className="bookingHero__panelLabel">Antes de começar</span>
                                <ul className="bookingHero__notes">
                                    <li>Separe seu WhatsApp, e-mail e CPF.</li>
                                    <li>Se tiver dúvida sobre o procedimento, use “Quero orientação”.</li>
                                    <li>Sem preferência de doutor mostra a opção mais flexível.</li>
                                </ul>
                            </div>
                        </div>
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
