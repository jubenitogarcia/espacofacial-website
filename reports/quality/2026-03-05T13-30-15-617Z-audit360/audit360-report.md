# Audit 360 Report

- Base URL: https://espacofacial.com
- Run: 2026-03-05T13:32:27.603Z
- Overall score: **84/100**

## Scorecard

| Pilar | Score | Status |
|---|---:|---|
| quality | 100 | PASS |
| security | 100 | PASS |
| seo | 60 | WARN |
| visual | 20 | WARN |
| ui | 100 | PASS |
| ux | 100 | PASS |
| accessibility | 100 | PASS |
| performance | 90 | PASS |

## Checks

- quality: PASS (quality:check passou)
- security: PASS (0 critical / 0 high)
- seo: WARN (10 achados)
- visual: WARN (14 screenshots)
- ux: PASS (14 páginas verificadas)
- ui: PASS (14 páginas verificadas)
- accessibility: PASS (7 páginas com axe)
- performance: PASS (14 medições)
- strategy: PASS (6 reformas priorizadas)

## Strategic Lens Scores

- Technical Senior: 94/100
- Growth Strategist: 100/100
- Art Direction Senior: 93/100
- Performance Marketing: 100/100

## Findings (Top 20)

- [MEDIUM] visual [/]: Alteração visual moderada — / (desktop) com 1.4611% de pixels alterados. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/diffs/desktop/home.png)
- [MEDIUM] visual [/unidades]: Dimensão de screenshot alterada — /unidades (desktop) mudou de 1440x1086 para 1440x1901. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/unidades.png)
- [MEDIUM] visual [/doutores]: Dimensão de screenshot alterada — /doutores (desktop) mudou de 1440x900 para 1440x1901. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/doutores.png)
- [MEDIUM] visual [/sobre]: Dimensão de screenshot alterada — /sobre (desktop) mudou de 1440x900 para 1440x1901. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/sobre.png)
- [MEDIUM] visual [/]: Dimensão de screenshot alterada — / (mobile) mudou de 1170x11121 para 1170x10509. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/home.png)
- [MEDIUM] visual [/unidades]: Dimensão de screenshot alterada — /unidades (mobile) mudou de 1170x8592 para 1170x10509. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/unidades.png)
- [MEDIUM] visual [/doutores]: Dimensão de screenshot alterada — /doutores (mobile) mudou de 1170x1992 para 1170x10509. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/doutores.png)
- [MEDIUM] visual [/sobre]: Dimensão de screenshot alterada — /sobre (mobile) mudou de 1170x2031 para 1170x10509. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/sobre.png)
- [MEDIUM] performance [/agendamento]: Lighthouse performance baixo — /agendamento com score 52. (evidência: reports/quality/2026-03-05T13-30-15-617Z-audit360/lighthouse/agendamento.json)
- [LOW] seo [/]: Title fora do range recomendado — Comprimento atual: 13 chars.
- [LOW] seo [/]: Meta description fora do range recomendado — Comprimento atual: 63 chars.
- [LOW] seo [/unidades]: Title fora do range recomendado — Comprimento atual: 13 chars.
- [LOW] seo [/unidades]: Meta description fora do range recomendado — Comprimento atual: 63 chars.
- [LOW] seo [/doutores]: Title fora do range recomendado — Comprimento atual: 13 chars.
- [LOW] seo [/doutores]: Meta description fora do range recomendado — Comprimento atual: 63 chars.
- [LOW] seo [/sobre]: Title fora do range recomendado — Comprimento atual: 13 chars.
- [LOW] seo [/sobre]: Meta description fora do range recomendado — Comprimento atual: 63 chars.
- [LOW] seo [/privacidade]: Meta description fora do range recomendado — Comprimento atual: 63 chars.
- [LOW] seo [/termos]: Meta description fora do range recomendado — Comprimento atual: 63 chars.

## Reformas Prioritárias (Top 10)

- [P1] Redesign do hero para proposta de valor e conversão imediata (Direção de Arte + Growth) — páginas: /; impacto: Alto; esforço: M.
- [P0] Checkout de agendamento com fricção mínima (UX + Performance Marketing) — páginas: /agendamento; impacto: Alto; esforço: M.
- [P1] Landing local orientada por intenção e proximidade (Arquitetura de Informação + Local SEO) — páginas: /unidades; impacto: Médio; esforço: M.
- [P1] Página de especialistas com narrativa de autoridade (Autoridade + Conversão) — páginas: /doutores; impacto: Médio; esforço: M.
- [P1] Design system visual e verbal v2 com governança (Design System) — páginas: /, /agendamento, /unidades, /doutores; impacto: Alto; esforço: L.
- [P1] Programa contínuo de experimentação (A/B e multivariada) (Performance Marketing) — páginas: /, /agendamento; impacto: Alto; esforço: L.

## Próximos passos sugeridos

- Resolver findings HIGH primeiro (segurança, SEO bloqueante, acessibilidade crítica).
- Revisar alterações visuais acima de 0.5% em páginas críticas.
- Tratar warnings de performance (TTFB/FCP) e imagens não otimizadas.
- Executar backlog de reformas P0/P1 com ciclos quinzenais de medição.
- Reexecutar `npm run audit:360` após ajustes para confirmar regressões.

## Artifacts

- reports/quality/2026-03-05T13-30-15-617Z-audit360/logs/quality-check.log
- reports/quality/2026-03-05T13-30-15-617Z-audit360/logs/npm-audit-prod.log
- reports/quality/2026-03-05T13-30-15-617Z-audit360/npm-audit-prod.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/seo-pages.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/home.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/home.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/agendamento.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/agendamento.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/unidades.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/unidades.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/doutores.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/doutores.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/sobre.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/sobre.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/privacidade.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/privacidade.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y/termos.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/desktop/termos.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/home.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/agendamento.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/unidades.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/doutores.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/sobre.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/privacidade.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/screenshots/mobile/termos.png
- reports/quality/2026-03-05T13-30-15-617Z-audit360/visual-summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/ux-summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/performance-summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/a11y-summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/logs/lighthouse-home.log
- reports/quality/2026-03-05T13-30-15-617Z-audit360/lighthouse/home.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/logs/lighthouse-agendamento.log
- reports/quality/2026-03-05T13-30-15-617Z-audit360/lighthouse/agendamento.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/lighthouse-summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/strategy-audit.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/design-reform-backlog.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/design-reform-roadmap.md
- reports/quality/2026-03-05T13-30-15-617Z-audit360/findings.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/summary.json
- reports/quality/2026-03-05T13-30-15-617Z-audit360/summary.env
