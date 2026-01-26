export type Service = {
    id: string;
    name: string;
    subtitle?: string;
    highlightImage?: string;
};

// Catálogo base (em ordem alfabética)
export const services: Service[] = [
    { id: "bioestimulador-colageno", name: "Bioestimulador de Colágeno", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "botox", name: "Botox", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "fios-pdo", name: "Fios de PDO", subtitle: "Espiculado, Liso, Filler", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "hipertrofia", name: "Hipertrofia", subtitle: "GlúteoMax, PowerMúsculo", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "intradermoterapia", name: "Intradermoterapia", subtitle: "Microagulhamento, Peeling, Skinbooster", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "outros", name: "Outros", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "preenchimento", name: "Preenchimento", subtitle: "Facial, Corporal", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "rinomodelacao", name: "Rinomodelação", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "tecnologia-avancada", name: "Tecnologia Avançada", subtitle: "Lavieen, Ultraformer", highlightImage: "/images/highlights/placeholder.svg" },
    { id: "tratamentos", name: "Tratamentos", subtitle: "Alopécia, Celulite, Estrias, Gordura Localizada", highlightImage: "/images/highlights/placeholder.svg" },
];

export function getServiceById(id: string | null | undefined): Service | null {
    const needle = (id ?? "").trim();
    if (!needle) return null;
    return services.find((s) => s.id === needle) ?? null;
}
