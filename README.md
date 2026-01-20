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

## Ver logs (produção)

Tail do Worker principal:
```bash
npm run tail
```

Observações:
- `--sampling-rate` precisa ser **entre 0 e 1** (ex.: `0.25`). `1` e `1.0` dão erro.
- Se aparecer `Network connection lost`, normalmente é apenas a conexão do tail que caiu — rode novamente.

Tail em JSON (útil para filtrar/processar):
```bash
npm run tail:json
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

## Tracking (Ads/SEO) — QA rápido

Objetivo: garantir que `utm_*` / `gclid` **não se perdem** e chegam nos eventos de clique (principalmente WhatsApp).

### 1) Teste de persistência e evento

1. Abra a home com parâmetros, por exemplo:
	- `http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=teste&gclid=TESTE123`
2. Clique em **Agendar** (header/floating/sobre/doutor).
3. Verifique o payload do evento:
	- Ative debug via querystring: adicione `&ef_debug=1` na URL.
	- O console vai logar: `[analytics] cta_agendar_click { ... }` incluindo `utm_*`, `gclid` e `landingPeriod`.

### 2) Teste de redirect preservando params

1. Abra (exemplo):
	- `http://localhost:3000/barrashoppingsul/faleconosco?utm_campaign=teste&gclid=TESTE123`
2. Confirme que o redirect para o WhatsApp **mantém** `utm_campaign` e `gclid` na URL final.

### 3) Dica: debug persistente

Se quiser manter logs sem querystring:
- Rode no console: `localStorage.setItem('ef_debug','1')`.

## Operação mensal (landing muda por campanha)

O hero já suporta atualização sem deploy via `/api/hero-media` (Drive folder / manifest).

Checklist mensal recomendado:
- Atualizar as mídias do hero (Drive folder / manifest)
- Publicar campanhas com UTMs padronizadas (ex.: `utm_source=google&utm_medium=cpc&utm_campaign=YYYY-MM_nome`)
- Validar `cta_agendar_click` com `ef_debug=1` em 2 dispositivos (mobile/desktop)
- Conferir redirects de WhatsApp preservando `utm_*`/`gclid`
