"use client";

import { useEffect, useState } from "react";

export type TeamDirectoryMember = {
    name: string;
    nickname: string | null;
    units: string[];
    role: string;
    roles: string[];
    instagramHandle: string | null;
    instagramUrl: string | null;
};

type TeamDirectoryResponse =
    | { ok?: true; members?: TeamDirectoryMember[] }
    | { ok: false; members?: TeamDirectoryMember[]; error?: { code?: string; status?: number } };

type TeamDirectoryState = {
    members: TeamDirectoryMember[] | null;
    error: string | null;
    loading: boolean;
};

let cachedMembers: TeamDirectoryMember[] | null = null;
let cachedError: string | null = null;
let inflightLoad: Promise<void> | null = null;

const listeners = new Set<() => void>();

function snapshot(): TeamDirectoryState {
    const settled = cachedMembers !== null || cachedError !== null;
    return {
        members: cachedMembers,
        error: cachedError,
        loading: !settled,
    };
}

function notifyListeners() {
    for (const listener of listeners) listener();
}

async function loadTeamDirectory() {
    if (cachedMembers !== null || cachedError !== null) return;
    if (inflightLoad) return inflightLoad;

    inflightLoad = (async () => {
        try {
            const res = await fetch("/api/equipe", { cache: "no-store" });
            const json = (await res.json().catch(() => null)) as TeamDirectoryResponse | null;

            cachedMembers = Array.isArray(json?.members) ? json.members : [];
            cachedError = json && json.ok === false ? json.error?.code ?? "unknown" : null;
        } catch {
            cachedMembers = [];
            cachedError = "exception";
        } finally {
            inflightLoad = null;
            notifyListeners();
        }
    })();

    return inflightLoad;
}

export function useTeamDirectory(): TeamDirectoryState {
    const [state, setState] = useState<TeamDirectoryState>(() => snapshot());

    useEffect(() => {
        const sync = () => setState(snapshot());

        listeners.add(sync);
        sync();
        void loadTeamDirectory();

        return () => {
            listeners.delete(sync);
        };
    }, []);

    return state;
}
