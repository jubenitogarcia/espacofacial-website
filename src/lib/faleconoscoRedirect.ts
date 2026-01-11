const DESTINATIONS: Record<string, string> = {
    bss: "https://api.whatsapp.com/message/MT7UGL6U6KYWA1?autoload=1&app_absent=0",
    nh: "https://api.whatsapp.com/message/5ZD2K6FMTDVSC1?autoload=1&app_absent=0",
};

const UNIT_TO_SIGLA: Record<string, keyof typeof DESTINATIONS> = {
    // siglas
    bss: "bss",
    nh: "nh",

    // slugs (com e sem hífen)
    barrashoppingsul: "bss",
    "novo-hamburgo": "nh",
    novohamburgo: "nh",
};

function normalize(input: string): string {
    return input.trim().toLowerCase();
}

export function resolveFaleConoscoDestination(unitOrSigla: string): string | null {
    const key = normalize(unitOrSigla);
    const sigla = UNIT_TO_SIGLA[key];
    if (!sigla) return null;
    return DESTINATIONS[sigla] ?? null;
}
