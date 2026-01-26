import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import BookingFlow from "@/components/BookingFlow";

export const metadata = {
    title: "Agendamento",
    description: "Agende seu atendimento escolhendo unidade, doutor, procedimento, data e horario.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AgendamentoPage() {
    return (
        <>
            <Header />
            <main className="bookingPage">
                <BookingFlow />
            </main>
            <Footer />
            <FloatingContact />
        </>
    );
}
