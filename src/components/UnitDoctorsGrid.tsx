"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCurrentUnit } from "@/hooks/useCurrentUnit";
import { trackDoctorInstagramClick, trackDoctorWhatsappClick } from "@/lib/leadTracking";

type TeamMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

function instagramIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm5.25-.9a1.15 1.15 0 1 1 0 2.3a1.15 1.15 0 0 1 0-2.3Z"
            />
        </svg>
    );
}

function whatsappIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
                fill="currentColor"
                d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.92.55 3.78 1.6 5.38L2 22l4.86-1.67a9.77 9.77 0 0 0 5.18 1.45h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 17.98h-.01a8.06 8.06 0 0 1-4.11-1.12l-.3-.18-2.88.99.97-2.8-.2-.3a8.05 8.05 0 1 1 6.53 3.41Zm4.65-6.03c-.26-.13-1.53-.76-1.77-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27-.76-.67-1.27-1.5-1.42-1.76-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.39-.8-1.91-.21-.5-.42-.43-.58-.44h-.5c-.17 0-.45.06-.68.32-.24.26-.89.87-.89 2.12 0 1.25.91 2.46 1.04 2.63.13.17 1.79 2.73 4.34 3.83.61.26 1.08.42 1.45.54.61.19 1.16.16 1.6.1.49-.07 1.53-.62 1.74-1.22.22-.6.22-1.12.15-1.22-.06-.1-.24-.16-.5-.29Z"
            />
        </svg>
    );
}

function unitLabelFromSlug(slug: string | null | undefined): string | null {
    if (!slug) return null;
    if (slug === "barrashoppingsul") return "BarraShoppingSul";
    if (slug === "novo-hamburgo") return "Novo Hamburgo";
    return null;
}

function avatarUrl(handle: string, name: string) {
    const h = encodeURIComponent(handle);
    const n = encodeURIComponent(name);
    return `/api/instagram-avatar?handle=${h}&name=${n}`;
}

function whatsappUrl(sigla: "bss" | "nh", handle: string) {
    return `https://esfa.co/${sigla}/${encodeURIComponent(handle)}`;
}

function unitSiglaFromSlug(slug: string | null | undefined): "bss" | "nh" | null {
    if (slug === "barrashoppingsul") return "bss";
    if (slug === "novo-hamburgo") return "nh";
    return null;
}

export default function UnitDoctorsGrid() {
    const unit = useCurrentUnit();
    const unitLabel = unitLabelFromSlug(unit?.slug);

    const [members, setMembers] = useState<TeamMember[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/equipe", { cache: "no-store" });
                const json = (await res.json()) as { members: TeamMember[] };
                if (cancelled) return;
                setMembers(Array.isArray(json.members) ? json.members : []);
            } catch {
                if (cancelled) return;
                setMembers([]);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        if (!members) return null;
        if (!unitLabel) return [];

        return members.filter((m) => m.units.map((u) => u.toLowerCase()).includes(unitLabel.toLowerCase()));
    }, [members, unitLabel]);

    if (!unitLabel) {
        return <div className="card">Selecione a unidade (BarraShoppingSul ou Novo Hamburgo) para ver os doutores.</div>;
    }

    if (filtered === null) {
        return <div className="card">Carregando equipe…</div>;
    }

    if (filtered.length === 0) {
        return <div className="card">Nenhum doutor encontrado para {unitLabel}.</div>;
    }

    return (
        <div className="grid">
            {filtered.map((d) => {
                const fullName = d.name;
                const nickname = d.nickname;
                const handle = d.instagramHandle;
                const href = d.instagramUrl;
                const selectedSigla = unitSiglaFromSlug(unit?.slug);
                const selectedCode = selectedSigla === "bss" ? "BSS" : selectedSigla === "nh" ? "NH" : null;
                const waHref = handle && selectedSigla ? whatsappUrl(selectedSigla, handle) : null;

                return (
                    <div
                        key={`${fullName}-${href ?? "noinsta"}`}
                        className="card"
                        onClick={() => {
                            if (!href) return;
                            trackDoctorInstagramClick({
                                unitSlug: unit?.slug ?? null,
                                doctorName: fullName,
                                instagramUrl: href,
                            });
                            window.open(href, "_blank", "noopener,noreferrer");
                        }}
                        style={{ display: "block", cursor: href ? "pointer" : "default" }}
                    >
                        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "white" }}>
                                {handle ? (
                                    <Image src={avatarUrl(handle, nickname ?? fullName)} alt={nickname ?? fullName} width={56} height={56} unoptimized />
                                ) : null}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</h3>
                                <p style={{ margin: 0, color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {nickname || unitLabel}
                                </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                {href ? (
                                    <a
                                        className="iconBtn"
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            trackDoctorInstagramClick({
                                                unitSlug: unit?.slug ?? null,
                                                doctorName: fullName,
                                                instagramUrl: href,
                                            });
                                        }}
                                        aria-label="Instagram"
                                        title="Instagram"
                                    >
                                        {instagramIcon()}
                                    </a>
                                ) : null}

                                {waHref && selectedSigla && selectedCode ? (
                                    <a
                                        className="iconBtn"
                                        href={waHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            trackDoctorWhatsappClick({
                                                unitSlug: unit?.slug ?? null,
                                                doctorName: fullName,
                                                unitSigla: selectedSigla,
                                                whatsappUrl: waHref,
                                            });
                                        }}
                                        aria-label={`WhatsApp ${selectedCode}`}
                                        title={`WhatsApp ${selectedCode}`}
                                    >
                                        {whatsappIcon()}
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
