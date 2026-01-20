type Props = {
    className?: string;
    title?: string;
    tone?: "dark" | "light";
};

export default function BrandLogo({ className, title = "Espaço Facial", tone = "dark" }: Props) {
    const baseSrc = tone === "light" ? "/logo-white.svg" : "/logo.svg";
    // Cache-busting for edge/CDN deployments (e.g. Cloudflare) that may keep an old SVG cached.
    const src = `${baseSrc}?v=20260120a`;

    return <img src={src} alt={title} className={className} draggable={false} decoding="async" />;
}
