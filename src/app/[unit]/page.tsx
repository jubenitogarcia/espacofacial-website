import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import UnitsMapSection from "@/components/UnitsMapSection";
import UnitDoctorsGrid from "@/components/UnitDoctorsGrid";
import HeroMedia from "@/components/HeroMedia";
import UnitSelectionSync from "@/components/UnitSelectionSync";
import AboutUsSection from "@/components/AboutUsSection";
import { units } from "@/data/units";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://espacofacial.com").replace(/\/$/, "");

function normalizeSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveUnitFromParam(param: string) {
    const direct = units.find((u) => u.slug === param);
    if (direct) return direct;

    const normalizedParam = normalizeSlug(param);
    return units.find((u) => normalizeSlug(u.slug) === normalizedParam) ?? null;
}

export function generateMetadata({ params }: { params: { unit: string } }): Metadata {
    const unit = resolveUnitFromParam(params.unit);
    if (!unit) {
        return {
            title: "Espaço Facial",
            alternates: { canonical: `${siteUrl}/` },
        };
    }

    return {
        title: `Espaço Facial — ${unit.name}`,
        description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
        alternates: { canonical: `${siteUrl}/${params.unit}` },
        openGraph: {
            title: `Espaço Facial — ${unit.name}`,
            description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
            url: `${siteUrl}/${params.unit}`,
            type: "website",
        },
    };
}

export default function UnitHomePage({ params }: { params: { unit: string } }) {
    const unit = resolveUnitFromParam(params.unit);
    if (!unit) {
        redirect("/");
    }

    return (
        <>
            <UnitSelectionSync slug={unit.slug} />
            <Header />

            <h1 className="srOnly">Espaço Facial</h1>

            <section className="hero" aria-label="Destaque">
                <HeroMedia />
                <div className="heroOverlay" />
            </section>

            <main className="container">
                <AboutUsSection />

                <section id="doutores" className="pageSection" style={{ marginTop: 50 }}>
                    <h2 className="sectionTitle">Nossos Doutores</h2>
                    <p className="sectionSub">Selecione uma unidade no cabeçalho para ver a equipe.</p>
                    <UnitDoctorsGrid />
                </section>

                <section id="unidades" className="pageSection" style={{ marginTop: 50 }}>
                    <h2 className="sectionTitle">Nossas Unidades</h2>
                    <p className="sectionSub">Clique no ponto no mapa ou no nome da unidade para abrir.</p>
                    <UnitsMapSection />
                </section>
            </main>

            <Footer />
            <FloatingContact />
        </>
    );
}
