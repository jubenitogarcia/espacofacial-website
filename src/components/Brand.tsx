import Link from "next/link";
import BrandMark from "@/components/BrandMark";

type Props = {
    href?: string;
    className?: string;
    showTagline?: boolean;
    variant?: "auto" | "full" | "mark";
};

export default function Brand({
    href = "/",
    className = "",
    showTagline = false,
    variant = "auto",
}: Props) {
    return (
        <Link className={`brand ${className}`.trim()} href={href} aria-label="Espaço Facial - Página inicial">
            <BrandMark className="brandMark" />
            {variant === "mark" ? null : (
                <span className="brandText" data-variant={variant}>
                    <span className="brandTextLine">
                        <span className="brandTextEspaco">Espaço</span>
                        <span className="brandTextFacial">Facial</span>
                    </span>
                    {showTagline ? <span className="brandTagline">Harmonização facial</span> : null}
                </span>
            )}
        </Link>
    );
}
