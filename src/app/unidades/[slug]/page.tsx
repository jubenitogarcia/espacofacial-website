import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitSelectionSync from "@/components/UnitSelectionSync";
import { units } from "@/data/units";

export default function UnitPage({ params }: { params: { slug: string } }) {
  const unit = units.find((u) => u.slug === params.slug);
  if (!unit) return notFound();

  const whatsHref = unit.contactUrl ?? null;

  return (
    <>
      <Header />
      <UnitSelectionSync slug={unit.slug} />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>{unit.name}</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>{unit.addressLine || "Endereço a preencher"}</p>

        <div className="pillRow">
          {whatsHref ? <a className="pill" href={whatsHref} target="_blank" rel="noreferrer">Agendar no WhatsApp</a> : null}
          {unit.contactUrl ? <a className="pill" href={unit.contactUrl} target="_blank" rel="noreferrer">Contatar Recepção</a> : null}
          {unit.phone ? <a className="pill" href={unit.phone}>Telefone</a> : null}
          {unit.email ? <a className="pill" href={unit.email}>E-mail</a> : null}
          {unit.maps ? <a className="pill" href={unit.maps} target="_blank" rel="noreferrer">Google Maps</a> : null}
          {unit.instagram ? <a className="pill" href={unit.instagram} target="_blank" rel="noreferrer">Instagram</a> : null}
          {unit.facebook ? <a className="pill" href={unit.facebook} target="_blank" rel="noreferrer">Facebook</a> : null}
        </div>

        <div style={{ marginTop: 26 }} className="card">
          <h3>Conteúdo da unidade</h3>
          <p>
            Aqui você pode adicionar horários, equipe da unidade, mapa embutido e botões de agendamento.
            Este template já está pronto para receber esses dados (via JSON, CMS ou banco).
          </p>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
