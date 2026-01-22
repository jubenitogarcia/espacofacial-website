export type Service = {
    id: string;
    name: string;
};

// MVP: catálogo base (pode evoluir por unidade/doutor depois)
export const services: Service[] = [
    { id: "harmonizacao", name: "Harmonização facial" },
    { id: "botox", name: "Toxina botulínica" },
    { id: "preenchimento", name: "Preenchimento" },
    { id: "bioestimulador", name: "Bioestimulador" },
    { id: "fios", name: "Fios" },
];

export function getServiceById(id: string | null | undefined): Service | null {
    const needle = (id ?? "").trim();
    if (!needle) return null;
    return services.find((s) => s.id === needle) ?? null;
}
