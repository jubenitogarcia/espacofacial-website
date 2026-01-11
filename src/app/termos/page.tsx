import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export const metadata = {
  title: "Termos | Espaço Facial",
  description: "Termos de uso, privacidade e políticas.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>Termos</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>
          Esta página pode conter: Termos de Uso, Política de Privacidade, Política de Devolução e Código de Conduta.
        </p>

        <div className="card" style={{ marginTop: 18 }}>
          <h3>Conteúdo</h3>
          <p>
            No Wix, o conteúdo está em Rich Text. Para manter 1:1, basta copiar o texto completo dos termos e colar aqui
            (ou carregar via CMS/Markdown). Eu deixei o template pronto para você inserir.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
