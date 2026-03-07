# Audit 360 Report

- Base URL: https://espacofacial.com
- Run: 2026-03-05T16:42:39.693Z
- Overall score: **96/100**

## Scorecard

| Pilar | Score | Status |
|---|---:|---|
| quality | 100 | PASS |
| security | 100 | PASS |
| seo | 100 | PASS |
| visual | 80 | WARN |
| ui | 100 | PASS |
| ux | 100 | PASS |
| accessibility | 100 | PASS |
| performance | 90 | PASS |

## Checks

- quality: PASS (quality:check passou)
- security: PASS (0 critical / 0 high)
- seo: PASS (0 achados)
- visual: WARN (14 screenshots)
- ux: PASS (14 páginas verificadas)
- ui: PASS (14 páginas verificadas)
- accessibility: PASS (7 páginas com axe)
- performance: PASS (14 medições)
- strategy: PASS (6 reformas priorizadas)

## Strategic Lens Scores

- Technical Senior: 97/100
- Growth Strategist: 100/100
- Art Direction Senior: 93/100
- Performance Marketing: 100/100

## Findings (Top 20)

- [MEDIUM] visual [/agendamento]: Dimensão de screenshot alterada — /agendamento (desktop) mudou de 1440x1285 para 1440x1275. (evidência: reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/agendamento.png)
- [MEDIUM] visual [/agendamento]: Dimensão de screenshot alterada — /agendamento (mobile) mudou de 1170x5232 para 1170x5202. (evidência: reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/agendamento.png)
- [MEDIUM] performance [/]: Lighthouse performance baixo — / com score 69. (evidência: reports/quality/2026-03-05T16-40-23-668Z-audit360/lighthouse/home.json)

## Reformas Prioritárias (Top 10)

- [P1] Redesign do hero para proposta de valor e conversão imediata (Direção de Arte + Growth) — páginas: /; impacto: Alto; esforço: M.
- [P1] Checkout de agendamento com fricção mínima (UX + Performance Marketing) — páginas: /agendamento; impacto: Alto; esforço: M.
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

- reports/quality/2026-03-05T16-40-23-668Z-audit360/logs/quality-check.log
- reports/quality/2026-03-05T16-40-23-668Z-audit360/logs/npm-audit-prod.log
- reports/quality/2026-03-05T16-40-23-668Z-audit360/npm-audit-prod.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/seo-pages.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/home.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/home.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/agendamento.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/agendamento.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/unidades.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/unidades.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/doutores.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/doutores.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/sobre.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/sobre.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/privacidade.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/privacidade.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y/termos.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/desktop/termos.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/home.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/agendamento.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/unidades.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/doutores.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/sobre.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/privacidade.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/screenshots/mobile/termos.png
- reports/quality/2026-03-05T16-40-23-668Z-audit360/visual-summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/ux-summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/performance-summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/a11y-summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/logs/lighthouse-home.log
- reports/quality/2026-03-05T16-40-23-668Z-audit360/lighthouse/home.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/logs/lighthouse-agendamento.log
- reports/quality/2026-03-05T16-40-23-668Z-audit360/lighthouse/agendamento.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/lighthouse-summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/strategy-audit.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/design-reform-backlog.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/design-reform-roadmap.md
- reports/quality/2026-03-05T16-40-23-668Z-audit360/findings.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/summary.json
- reports/quality/2026-03-05T16-40-23-668Z-audit360/summary.env
