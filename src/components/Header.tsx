import Link from "next/link";
import AgendeCta from "@/components/AgendeCta";
import UnitChooser from "@/components/UnitChooser";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="nav">
          <div className="navLeft">
            <Link className="brand" href="/">Espaço Facial</Link>
            <nav className="menu" aria-label="Menu principal">
              <Link href="/#doutores">Nossos Doutores</Link>
              <Link href="/#unidades">Unidades</Link>
            </nav>
          </div>
          <div className="headerActions">
            <UnitChooser />
            <AgendeCta />
          </div>
        </div>
      </div>
    </header>
  );
}
