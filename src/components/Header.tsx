import Link from "next/link";
import AgendeCta from "@/components/AgendeCta";

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="nav">
          <div className="navLeft">
            <Link className="brand" href="/">Espaço Facial</Link>
            <nav className="menu" aria-label="Menu principal">
              <Link href="/sobre">Sobre Nós</Link>
              <Link href="/unidades">Unidades</Link>
              <Link href="/termos">Termos</Link>
            </nav>
          </div>
          <AgendeCta />
        </div>
      </div>
    </header>
  );
}
