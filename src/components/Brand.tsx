import Link from "next/link";
import BrandMark from "@/components/BrandMark";

type Props = {
  href?: string;
  className?: string;
  showTagline?: boolean;
};

export default function Brand({ href = "/", className = "", showTagline = false }: Props) {
  return (
    <Link className={`brand ${className}`.trim()} href={href} aria-label="Espaço Facial - Página inicial">
      <BrandMark className="brandMark" />
      <span className="brandText">
        <span className="brandTextLine">
          <span className="brandTextEspaco">Espaço</span>
          <span className="brandTextFacial">Facial</span>
        </span>
        {showTagline ? <span className="brandTagline">Harmonização facial</span> : null}
      </span>
    </Link>
  );
}
