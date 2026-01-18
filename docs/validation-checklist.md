# Checklist final de validação

## Comandos
- Build + typecheck:
  - `npm run build`
- Lint:
  - `npm run lint`
- Smoke (rotas críticas):
  - `npm run smoke`

## URLs para conferir
- Home: https://espacofacial.com/
- Unidades: https://espacofacial.com/unidades
- Doutores: https://espacofacial.com/doutores
- Robots: https://espacofacial.com/robots.txt
- Sitemap: https://espacofacial.com/sitemap.xml
- 404: https://espacofacial.com/nao-existe

## Redirects críticos
- Shortener:
  - https://esfa.co/bss/faleconosco
  - https://esfa.co/nh/faleconsco
- Domínio principal (vai para WhatsApp):
  - https://espacofacial.com/barrashoppingsul/faleconosco
  - https://espacofacial.com/novohamburgo/faleconosco

## Sem loops
- Rodar:
  - `curl -sSIL https://esfa.co/bss/faleconosco | head`
  - `curl -sSIL https://espacofacial.com/barrashoppingsul/faleconosco | head`

## Operacional (Cloudflare DNS)
- Registros de e-mail (MX/TXT/DKIM) devem ser **DNS only**.
- Ideal: não manter A records do Wix no apex.
