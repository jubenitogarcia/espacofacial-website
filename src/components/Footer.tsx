import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800, color: "#2a2a2a" }}>Espaço Facial</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/sobre">Sobre Nós</Link>
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/termos">Política de Privacidade</Link>
            <Link href="/termos">Política de Devolução</Link>
            <Link href="/termos">Código de Conduta</Link>
          </div>
          <div>Copyright © 2019-{year} - Espaço Facial. Todos Direitos Reservados.</div>
          <div className="small">
            50.090.741/0001-89 &nbsp;&nbsp; Skincare &amp; Cosmetics Ltda. <br />
            54.425.741/0001-43 &nbsp;&nbsp; Skincare &amp; Cosmetics POA Ltda.
          </div>
        </div>
      </div>
    </footer>
  );
}
