import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { doctors } from "@/data/doctors";
import DoctorAgendarPill from "@/components/DoctorAgendarPill";

export default function DoctorPage({ params }: { params: { slug: string } }) {
  const doc = doctors.find((d) => d.slug === params.slug);
  if (!doc) return notFound();

  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: 26 }}>
        <h1 style={{ marginBottom: 6 }}>{doc.name}</h1>
        <p style={{ color: "#6b6b6b", marginTop: 0 }}>{doc.days}</p>
        <div className="pillRow">
          <DoctorAgendarPill doctorName={doc.name} />
        </div>

        <div style={{ marginTop: 26 }} className="card">
          <h3>Bio / Procedimentos</h3>
          <p>
            Coloque aqui a biografia, especialidades, fotos e agenda. Este arquivo já está pronto para isso.
          </p>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
