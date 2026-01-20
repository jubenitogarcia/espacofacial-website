# Espaço Facial (Open) — 2025-12-28

Este projeto é uma base **independente do Wix** para recriar o site `espacofacial.com`.

## Rodar localmente
```bash
npm install
npm run dev
```
Abra `http://localhost:3000`.

## Colocar online (Cloudflare Workers via OpenNext)

Pré-requisitos:
- Wrangler configurado (login/token) para a conta/zona do Cloudflare.

Deploy do site (Next.js + App Router):
```bash
npm run deploy
```

Deploy do worker de redirects (domínio `esfa.co`):
```bash
npm run deploy:esfa
```

Se o site “não atualizou” após deploy:
- Faça um hard reload no navegador (ou teste em aba anônima).
- Verifique no DevTools → Network → documento `/` se o header `cf-cache-status` está `HIT`.
- Se estiver `HIT`, faça purge do cache no Cloudflare (Caching → Purge Cache).

## Onde colocar imagens
- `public/images/hero.jpg` (banner principal)
- `public/images/579A1718.jpg` e `public/images/579A1718.png` (fotos do grid de doutores, se quiser manter)
- Demais imagens do carrossel e mapa.

## Próximos passos
- Preencher endereços e contatos das unidades
- Inserir textos completos de Sobre Nós e Termos
- Replicar carrossel de posts do Wix (slider)
