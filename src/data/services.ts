export type Service = {
    id: string;
    name: string;
    durationMinutes: number;
};

// MVP: catálogo base (pode evoluir por unidade/doutor depois)
export const services: Service[] = [
    { id: "avaliacao", name: "Avaliação", durationMinutes: 30 },
    { id: "harmonizacao", name: "Harmonização facial", durationMinutes: 60 },
    { id: "botox", name: "Toxina botulínica", durationMinutes: 45 },
    { id: "preenchimento", name: "Preenchimento", durationMinutes: 60 },
    { id: "bioestimulador", name: "Bioestimulador", durationMinutes: 60 },
    { id: "fios", name: "Fios", durationMinutes: 75 },
];

export function getServiceById(id: string | null | undefined): Service | null {
    const needle = (id ?? "").trim();
    if (!needle) return null;
    return services.find((s) => s.id === needle) ?? null;
}
