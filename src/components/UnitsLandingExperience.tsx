"use client";

import Link from "next/link";
import ExperienceTracker from "@/components/ExperienceTracker";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import { useExperienceVariant } from "@/hooks/useExperienceVariant";
import { trackExperienceShortcutClick } from "@/lib/leadTracking";

export type UnitsFeaturedCard = {
    slug: string;
    name: string;
    addressLine: string | null;
    maps: string | null;
    state: string | null;
    city: string;
};

type UnitsLandingExperienceProps = {
    featuredUnits: UnitsFeaturedCard[];
    unitsByState: number;
};

type UnitsUiVariant = "featured-units" | "concierge-local";

const UNITS_VARIANTS: Record<
    UnitsUiVariant,
    {
        eyebrow: string;
        title: string;
        description: string;
        panelTitle: string;
        panelItems: string[];
        manifestoTitle: string;
        manifestoBody: string;
    }
> = {
    "featured-units": {
        eyebrow: "Escolha local com contexto de agenda",
        title: "A unidade certa reduz friccao e acelera sua entrada no atendimento.",
        description:
            "Esta pagina combina mapa, paginas locais e atalho direto para o agendamento com unidade predefinida. O objetivo e tirar ambiguidades logo no inicio.",
        panelTitle: "Como decidir mais rapido",
        panelItems: [
            "Comece pela unidade mais facil para retorno e manutencao.",
            "Use a pagina local para validar equipe e contato.",
            "Entre no agendamento ja com unidade marcada para reduzir etapas.",
        ],
        manifestoTitle: "Logica da jornada local",
        manifestoBody:
            "Unidade nao e detalhe operacional. Ela define disponibilidade real, rota de deslocamento e continuidade de acompanhamento.",
    },
    "concierge-local": {
        eyebrow: "Atalho de proximidade",
        title: "Quando localizacao manda na decisao, o caminho para reservar precisa ser imediato.",
        description:
            "Esta variante prioriza velocidade: abrir unidade, validar rota e cair no fluxo de agendamento no menor numero de cliques.",
        panelTitle: "Modo concierge local",
        panelItems: [
            "Abra rota antes de comparar procedimentos.",
            "Use agendamento por unidade para ver janelas reais rapidamente.",
            "Se ainda houver duvida de especialista, ajuste depois no fluxo.",
        ],
        manifestoTitle: "Objetivo da variante",
        manifestoBody:
            "Converter intencao geografica em acao. Menos navegacao dispersa, mais contexto certo no ponto de decisao.",
    },
};

function pickUnitsUiVariant(input: string): UnitsUiVariant {
    if (input.includes("concierge") || input.includes("route") || input.includes("local")) {
        return "concierge-local";
    }
    return "featured-units";
}

export default function UnitsLandingExperience({ featuredUnits, unitsByState }: UnitsLandingExperienceProps) {
    const resolved = useExperienceVariant("/unidades", "featured-units");
    const uiVariant = pickUnitsUiVariant(resolved.variant);
    const content = UNITS_VARIANTS[uiVariant];

    return (
        <>
            <ExperienceTracker page="/unidades" experience="local_landing_v3" variant={resolved.variant} />

            <section className={`unitsHero unitsHero--${uiVariant}`.trim()} style={{ marginTop: 40 }}>
                <div className="unitsHero__shell">
                    <div className="unitsHero__copy">
                        <span className="unitsHero__capsule">{content.eyebrow}</span>
                        <h1 className="sectionTitle">{content.title}</h1>
                        <p className="sectionSub">{content.description}</p>

                        <div className="unitsHero__actions">
                            <a
                                href="#units-featured"
                                className="unitsHero__primary"
                                onClick={() =>
                                    trackExperienceShortcutClick({
                                        page: "/unidades",
                                        shortcut: "Ver unidades destacadas",
                                        destination: "#units-featured",
                                        placement: "units_page",
                                        experience: "local_landing_v3",
                                        variant: resolved.variant,
                                    })
                                }
                            >
                                Ver unidades destacadas
                            </a>
                            <a
                                href="#units-map"
                                className="unitsHero__secondary"
                                onClick={() =>
                                    trackExperienceShortcutClick({
                                        page: "/unidades",
                                        shortcut: "Abrir mapa completo",
                                        destination: "#units-map",
                                        placement: "units_page",
                                        experience: "local_landing_v3",
                                        variant: resolved.variant,
                                    })
                                }
                            >
                                Abrir mapa completo
                            </a>
                        </div>

                        <div className="unitsHero__stats" role="group" aria-label="Panorama das unidades">
                            <div className="unitsHero__stat">
                                <strong>{featuredUnits.length}</strong>
                                <span>unidades com jornada digital destacada</span>
                            </div>
                            <div className="unitsHero__stat">
                                <strong>{unitsByState}</strong>
                                <span>estados representados no mapa</span>
                            </div>
                            <div className="unitsHero__stat">
                                <strong>Mapa + contato</strong>
                                <span>decisao rapida por proximidade, rota e agenda</span>
                            </div>
                        </div>
                    </div>

                    <aside className="unitsHero__panel" aria-label="Guia de decisao local">
                        <div className="unitsHero__panelCard">
                            <span className="unitsHero__panelLabel">{content.panelTitle}</span>
                            <ul className="unitsHero__panelList">
                                {content.panelItems.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="unitsHero__panelCard unitsHero__panelCard--soft">
                            <span className="unitsHero__panelLabel">{content.manifestoTitle}</span>
                            <p>{content.manifestoBody}</p>
                        </div>
                    </aside>
                </div>
            </section>

            <section id="units-featured" className="pageSection decisionCardsSection" aria-label="Unidades destacadas para decisao rapida">
                <div className="decisionCards">
                    {featuredUnits.map((unit) => (
                        <article key={unit.slug} className="decisionCard decisionCard--unit">
                            <div className="decisionCard__eyebrow">{unit.city || unit.state || "Unidade"}</div>
                            <h2>{unit.name}</h2>
                            <p>{unit.addressLine ? unit.addressLine : "Abra a unidade para ver detalhes e contato direto."}</p>

                            <div className="decisionCard__meta">
                                <span className="decisionCard__metaItem">Pagina local dedicada</span>
                                <span className="decisionCard__metaItem">Contato direto da unidade</span>
                                <span className="decisionCard__metaItem">Entrada imediata no agendamento</span>
                            </div>

                            <div className="decisionCard__actions">
                                <Link
                                    href={`/${unit.slug}`}
                                    className="decisionCard__primary"
                                    onClick={() =>
                                        trackExperienceShortcutClick({
                                            page: "/unidades",
                                            shortcut: `Ver unidade ${unit.slug}`,
                                            destination: `/${unit.slug}`,
                                            placement: "units_page",
                                            unitSlug: unit.slug,
                                            experience: "local_landing_v3",
                                            variant: resolved.variant,
                                        })
                                    }
                                >
                                    Ver unidade
                                </Link>
                                <TrackedBookingLink
                                    href={`/agendamento?unit=${encodeURIComponent(unit.slug)}#booking-flow`}
                                    className="decisionCard__secondary"
                                    placement="units_page"
                                    unitSlug={unit.slug}
                                    experience="local_landing_v3"
                                    variant={resolved.variant}
                                >
                                    Agendar nesta unidade
                                </TrackedBookingLink>
                            </div>

                            {unit.maps ? (
                                <a
                                    href={unit.maps}
                                    className="decisionCard__link"
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() =>
                                        trackExperienceShortcutClick({
                                            page: "/unidades",
                                            shortcut: `Abrir rota ${unit.slug}`,
                                            destination: unit.maps ?? "maps",
                                            placement: "units_page",
                                            unitSlug: unit.slug,
                                            experience: "local_landing_v3",
                                            variant: resolved.variant,
                                        })
                                    }
                                >
                                    Abrir rota no mapa
                                </a>
                            ) : null}
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
