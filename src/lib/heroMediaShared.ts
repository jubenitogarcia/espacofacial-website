export type HeroMediaItem = {
    type: "image" | "video";
    src: string;
    alt?: string;
};

export const LOCAL_HERO_ITEMS: HeroMediaItem[] = [
    {
        type: "image",
        src: "/images/hero/banner-01.png",
        alt: "Botox 3 Regiões (40ui) e Botox Full Face",
    },
    {
        type: "image",
        src: "/images/hero/banner-02.png",
        alt: "Festival do Preenchimento",
    },
    {
        type: "image",
        src: "/images/hero/banner-03.png",
        alt: "Carnaval beleza - Brilhe de dentro para fora",
    },
];

export function dedupeHeroMediaItems(items: HeroMediaItem[]): HeroMediaItem[] {
    const unique = new Map<string, HeroMediaItem>();
    for (const item of items) {
        unique.set(`${item.type}:${item.src}`, item);
    }
    return [...unique.values()];
}
