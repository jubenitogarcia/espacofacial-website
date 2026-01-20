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

function canonicalUnitPath(unitSlug: string): string {
    // Canonicalize Novo Hamburgo without hyphen as requested.
    if (normalizeSlug(unitSlug) === "novohamburgo") return "novohamburgo";
    return unitSlug;
}

function isIndexableUnitPath(path: string): boolean {
    const normalized = normalizeSlug(path);
    return normalized === "novohamburgo" || normalized === "barrashoppingsul";
}

export function generateMetadata({ params }: { params: { unit: string } }): Metadata {
    const unit = resolveUnitFromParam(params.unit);
    if (!unit) {
        return {
            title: "Espaço Facial",
            robots: { index: false, follow: false },
            alternates: { canonical: `${siteUrl}/` },
        };
    }

    const canonicalPath = canonicalUnitPath(unit.slug);
    const canonicalUrl = `${siteUrl}/${canonicalPath}`;

    return {
        title: `Espaço Facial — ${unit.name}`,
        description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
        robots: {
            index: isIndexableUnitPath(canonicalPath),
            follow: isIndexableUnitPath(canonicalPath),
        },
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: `Espaço Facial — ${unit.name}`,
            description: "Harmonização facial e corporal. Selecione sua unidade e agende.",
            url: canonicalUrl,
            type: "website",
        },
    };
}

export default function UnitHomePage({
    params,
    searchParams,
}: {
    params: { unit: string };
    searchParams?: Record<string, string | string[] | undefined>;
}) {
    const unit = resolveUnitFromParam(params.unit);
    if (!unit) {
        redirect("/");
    }

    const canonicalPath = canonicalUnitPath(unit.slug);
    if (normalizeSlug(params.unit) !== normalizeSlug(canonicalPath)) {
        const qs = new URLSearchParams();
        for (const [key, raw] of Object.entries(searchParams ?? {})) {
            if (typeof raw === "string") qs.set(key, raw);
            else if (Array.isArray(raw)) raw.forEach((v) => typeof v === "string" && qs.append(key, v));
        }
        const suffix = qs.toString();
        redirect(suffix ? `/${canonicalPath}?${suffix}` : `/${canonicalPath}`);
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
