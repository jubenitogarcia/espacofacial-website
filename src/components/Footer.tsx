export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footerInner">
          <div className="footerBrand">Espaço Facial</div>

          <div className="footerMeta">
            <div>Copyright © 2019-{year} - Espaço Facial. Todos Direitos Reservados.</div>
            <div className="footerSmall">
              50.090.741/0001-89 &nbsp;&nbsp; Skincare &amp; Cosmetics Ltda. <br />
              54.425.741/0001-43 &nbsp;&nbsp; Skincare &amp; Cosmetics POA Ltda.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
