"use client";

import { useEffect, useState } from "react";

type TeamMember = {
    units: string[];
    instagramUrl: string | null;
};

type DirectoryStats = {
    members: number | null;
    unitsRepresented: number | null;
    instagramProfiles: number | null;
};

const initialStats: DirectoryStats = {
    members: null,
    unitsRepresented: null,
    instagramProfiles: null,
};

export default function DoctorsDirectoryStats() {
    const [stats, setStats] = useState<DirectoryStats>(initialStats);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/equipe", { cache: "no-store" });
                const json = (await res.json().catch(() => null)) as { members?: TeamMember[] } | null;
                if (cancelled) return;

                const members = Array.isArray(json?.members) ? json.members : [];
                const unitsRepresented = new Set(
                    members.flatMap((member) => member.units.map((unit) => unit.trim()).filter(Boolean))
                ).size;
                const instagramProfiles = members.filter((member) => member.instagramUrl).length;

                setStats({
                    members: members.length,
                    unitsRepresented,
                    instagramProfiles,
                });
            } catch {
                if (cancelled) return;
                setStats({
                    members: 0,
                    unitsRepresented: 0,
                    instagramProfiles: 0,
                });
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const value = (input: number | null) => (input === null ? "..." : String(input));

    return (
        <div className="pageNarrative__stats" role="group" aria-label="Panorama da equipe">
            <div className="pageNarrative__stat">
                <strong>{value(stats.members)}</strong>
                <span>profissionais ativos no diretório</span>
            </div>
            <div className="pageNarrative__stat">
                <strong>{value(stats.unitsRepresented)}</strong>
                <span>unidades representadas na agenda</span>
            </div>
            <div className="pageNarrative__stat">
                <strong>{value(stats.instagramProfiles)}</strong>
                <span>perfis com conteúdo consultável</span>
            </div>
        </div>
    );
}
