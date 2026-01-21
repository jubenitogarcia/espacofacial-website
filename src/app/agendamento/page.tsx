import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import BookingFlow from "@/components/BookingFlow";

export const metadata = {
    title: "Agendamento",
};

export default function AgendamentoPage() {
    return (
        <>
            <Header />
            <main>
                <BookingFlow />
            </main>
            <Footer />
            <FloatingContact />
        </>
    );
}
