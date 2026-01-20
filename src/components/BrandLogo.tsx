type Props = {
    className?: string;
    title?: string;
    tone?: "dark" | "light";
};

export default function BrandLogo({ className, title = "Espaço Facial", tone = "dark" }: Props) {
    const src = tone === "light" ? "/logo-white.svg" : "/logo.svg";

    return <img src={src} alt={title} className={className} draggable={false} decoding="async" />;
}
