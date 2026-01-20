import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import BrandLogo from "@/components/BrandLogo";

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
            {variant === "mark" ? <BrandMark className="brandMark" /> : null}

            {variant === "full" ? <BrandLogo className="brandLogo" /> : null}

            {variant === "auto" ? (
                <>
                    <BrandMark className="brandMark brandMarkAuto" />
                    <BrandLogo className="brandLogo brandLogoAuto" />
                </>
            ) : null}

            {showTagline ? <span className="srOnly">Harmonização facial</span> : null}
        </Link>
    );
}
