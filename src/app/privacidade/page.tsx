import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade e Cookies",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ padding: "32px 0 60px", maxWidth: 860 }}>
      <h1 style={{ marginTop: 0 }}>Privacidade e Cookies</h1>

      <p style={{ color: "var(--muted)" }}>
        Este site usa cookies essenciais para funcionamento e, com seu consentimento, cookies de
        análise para entender o uso do site e melhorar a experiência.
      </p>

      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Cookies essenciais</h2>
        <p>
          Necessários para recursos como lembrar preferências básicas e manter o site operando
          corretamente. Eles não podem ser desativados.
        </p>

        <h2 style={{ fontSize: 18 }}>Cookies de análise (opcional)</h2>
        <p>
          Se você aceitar, podemos usar ferramentas como Google Tag Manager / Google Analytics para
          medir acesso e navegação (ex.: páginas visitadas e cliques).
        </p>

        <h2 style={{ fontSize: 18 }}>Dados enviados no agendamento</h2>
        <p>
          Ao solicitar um agendamento, você informa nome e WhatsApp para retorno da confirmação.
          Evite inserir informações sensíveis em “Observações”.
        </p>

        <h2 style={{ fontSize: 18 }}>Contato</h2>
        <p style={{ marginBottom: 0 }}>
          BarraShoppingSul: barrashoppingsul@espacofacial.com.br • +55 (51) 98088-2293
          <br />
          Novo Hamburgo: novohamburgo@espacofacial.com.br • +55 (51) 99581-1008
        </p>
      </div>

      <p className="small" style={{ marginTop: 14 }}>
        Nota: este texto e um resumo operacional e deve ser revisado/ajustado pelo responsavel
        juridico do projeto.
      </p>
    </main>
  );
}

