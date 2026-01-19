"use client";

import { useMemo, useRef, useState } from "react";
import { units } from "@/data/units";
import { trackEvent } from "@/lib/analytics";

type ProjectedPoint = {
    x: number;
    y: number;
};

function projectLatLngToBrazilSvg(lat: number, lng: number): ProjectedPoint {
    // Approximate bounds for Brazil (equirectangular projection)
    const minLng = -74;
    const maxLng = -34;
    const minLat = -34;
    const maxLat = 6;

    const nx = (lng - minLng) / (maxLng - minLng);
    const ny = (maxLat - lat) / (maxLat - minLat);

    // Place points inside our stylized silhouette area (viewBox 0..1000)
    const x = 180 + nx * 640;
    const y = 120 + ny * 780;

    return {
        x: Math.max(0, Math.min(1000, x)),
        y: Math.max(0, Math.min(1000, y)),
    };
}

const CENTRAL_SITE_URL = "https://espacofacial.com.br";

function getUnitDestination(unit: (typeof units)[number]): string {
    const whatsappSlugs = new Set(["barrashoppingsul", "porto-alegre", "novo-hamburgo"]);
    if (whatsappSlugs.has(unit.slug)) {
        // Prefer our existing internal redirect (already configured for BSS/NH).
        if (unit.contactUrl) return unit.contactUrl;
        // Fallback: until we have the Porto Alegre WhatsApp destination.
        return CENTRAL_SITE_URL;
    }

    return CENTRAL_SITE_URL;
}

function computeStatePoint(stateUnits: (typeof units)[number][]): { x: number; y: number } {
    const withCoords = stateUnits.filter((u) => typeof u.lat === "number" && typeof u.lng === "number");
    if (withCoords.length === 0) return { x: 500, y: 500 };
    const avgLat = withCoords.reduce((acc, u) => acc + (u.lat as number), 0) / withCoords.length;
    const avgLng = withCoords.reduce((acc, u) => acc + (u.lng as number), 0) / withCoords.length;
    return projectLatLngToBrazilSvg(avgLat, avgLng);
}

function Pin({ x, y, onEnter, onLeave, onToggle }: { x: number; y: number; onEnter: () => void; onLeave: () => void; onToggle: () => void }) {
    // Balloon marker similar to the provided reference (simplified, original SVG).
    const w = 86;
    const h = 112;
    const left = x - w / 2;
    const top = y - h;

    return (
        <g
            transform={`translate(${left} ${top})`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={onToggle}
            style={{ cursor: "pointer" }}
            role="button"
            aria-label="Ver unidades"
        >
            <path
                d="M43 0C19.3 0 0 19.3 0 43c0 27.6 28.4 52.1 37.9 60.1 3 2.5 7.3 2.5 10.3 0C57.6 95.1 86 70.6 86 43 86 19.3 66.7 0 43 0z"
                fill="rgba(255,255,255,0.92)"
                stroke="rgba(0,0,0,0.20)"
                strokeWidth="2"
            />
            <circle cx="43" cy="40" r="24" fill="#111111" />
            <text
                x="43"
                y="44"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                fontSize="18"
                fontWeight="900"
                fill="#ffffff"
            >
                EF
            </text>
        </g>
    );
}

export default function UnitsMapSection() {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const [openState, setOpenState] = useState<
        | {
              uf: string;
              left: number;
              top: number;
          }
        | null
    >(null);

    const stateGroups = useMemo(() => {
        const map = new Map<string, (typeof units)[number][]>();
        for (const u of units) {
            if (!u.state) continue;
            const arr = map.get(u.state) ?? [];
            arr.push(u);
            map.set(u.state, arr);
        }

        const groups = Array.from(map.entries())
            .map(([uf, list]) => ({
                uf,
                units: list,
                point: computeStatePoint(list),
            }))
            .sort((a, b) => a.uf.localeCompare(b.uf));

        return groups;
    }, []);

    function openTooltipAt(uf: string, x: number, y: number) {
        const wrap = wrapRef.current;
        const svg = svgRef.current;
        if (!wrap || !svg) return;

        const wrapRect = wrap.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        const px = (x / 1000) * svgRect.width + (svgRect.left - wrapRect.left);
        const py = (y / 1000) * svgRect.height + (svgRect.top - wrapRect.top);

        setOpenState({ uf, left: px, top: py });
    }

    const activeGroup = openState ? stateGroups.find((g) => g.uf === openState.uf) ?? null : null;

    return (
        <div className="unitsMapLayout" ref={wrapRef}>
            <div className="brMap" aria-label="Mapa do Brasil com unidades">
                <svg ref={svgRef} viewBox="0 0 1000 1000" role="img" aria-label="Brasil">
                    <path
                        d="M160 160 C210 110 280 90 350 120 C390 65 470 55 520 95 C590 80 655 110 700 165 C770 175 835 230 850 310 C900 370 905 470 870 540 C885 635 850 725 780 795 C745 870 655 910 560 890 C500 935 410 945 350 900 C280 905 235 860 220 820 C165 770 135 700 145 615 C110 545 105 455 140 390 C125 315 130 235 160 160 Z"
                        fill="#111111"
                        opacity="0.85"
                    />

                    {stateGroups.map((g) => (
                        <Pin
                            key={g.uf}
                            x={g.point.x}
                            y={g.point.y}
                            onEnter={() => openTooltipAt(g.uf, g.point.x, g.point.y)}
                            onLeave={() => {
                                // allow moving into tooltip without immediate close
                                setTimeout(() => {
                                    setOpenState((s) => (s && s.uf === g.uf ? s : s));
                                }, 0);
                            }}
                            onToggle={() => {
                                setOpenState((prev) => {
                                    if (prev?.uf === g.uf) return null;
                                    openTooltipAt(g.uf, g.point.x, g.point.y);
                                    return prev;
                                });
                            }}
                        />
                    ))}
                </svg>

                <div className="brMapHint">
                    Passe o mouse no balão para ver as unidades do estado.
                </div>

                {openState && activeGroup ? (
                    <div
                        className="brTooltip"
                        style={{ left: openState.left, top: openState.top }}
                        onMouseLeave={() => setOpenState(null)}
                    >
                        <div className="brTooltipTitle">Unidades — {activeGroup.uf}</div>
                        <div className="brTooltipList">
                            {activeGroup.units
                                .slice()
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((u) => (
                                    <button
                                        key={u.slug}
                                        className="brTooltipItem"
                                        onClick={() => {
                                            const dest = getUnitDestination(u);
                                            trackEvent("unit_map_click", { unitSlug: u.slug, placement: "state_tooltip", destination: dest });
                                            window.location.href = dest;
                                        }}
                                    >
                                        {u.name}
                                    </button>
                                ))}
                        </div>
                        <div className="brTooltipNote">
                            RS abre WhatsApp para BarraShoppingSul e Novo Hamburgo.
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
