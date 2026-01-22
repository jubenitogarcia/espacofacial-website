export type Service = {
    id: string;
    name: string;
    subtitle?: string;
};

// Catálogo base (em ordem alfabética)
export const services: Service[] = [
    { id: "bioestimulador-colageno", name: "Bioestimulador de Colágeno" },
    { id: "botox", name: "Botox" },
    { id: "fios-pdo", name: "Fios de PDO", subtitle: "Espiculado, Liso, Filler" },
    { id: "hipertrofia", name: "Hipertrofia", subtitle: "GlúteoMax, PowerMúsculo" },
    { id: "intradermoterapia", name: "Intradermoterapia", subtitle: "Microagulhamento, Peeling, Skinbooster" },
    { id: "outros", name: "Outros" },
    { id: "preenchimento", name: "Preenchimento", subtitle: "Facial, Corporal" },
    { id: "rinomodelacao", name: "Rinomodelação" },
    { id: "tecnologia-avancada", name: "Tecnologia Avançada", subtitle: "Lavieen, Ultraformer" },
    { id: "tratamentos", name: "Tratamentos", subtitle: "Alopécia, Celulite, Estrias, Gordura Localizada" },
];

export function getServiceById(id: string | null | undefined): Service | null {
    const needle = (id ?? "").trim();
    if (!needle) return null;
    return services.find((s) => s.id === needle) ?? null;
}
