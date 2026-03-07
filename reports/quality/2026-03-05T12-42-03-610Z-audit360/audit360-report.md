# Audit 360 Report

- Base URL: https://espacofacial.com
- Run: 2026-03-05T12:47:13.281Z
- Overall score: **54/100**

## Scorecard

| Pilar | Score | Status |
|---|---:|---|
| quality | 100 | PASS |
| security | 100 | PASS |
| seo | 0 | WARN |
| visual | 20 | WARN |
| ui | 100 | PASS |
| ux | 100 | PASS |
| accessibility | 10 | WARN |
| performance | 0 | WARN |

## Checks

- quality: PASS (quality:check passou)
- security: PASS (0 critical / 0 high)
- seo: WARN (14 achados)
- visual: WARN (14 screenshots)
- ux: PASS (14 páginas verificadas)
- ui: PASS (14 páginas verificadas)
- accessibility: WARN (7 páginas com axe)
- performance: WARN (14 medições)
- strategy: PASS (6 reformas priorizadas)

## Strategic Lens Scores

- Technical Senior: 84/100
- Growth Strategist: 98/100
- Art Direction Senior: 93/100
- Performance Marketing: 100/100

## Findings (Top 20)

- [HIGH] seo [/agendamento]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] seo [/privacidade]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] seo [/termos]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] accessibility [/]: Violações de acessibilidade detectadas — / possui 4 violações no axe. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/home.json)
- [HIGH] accessibility [/unidades]: Violações de acessibilidade detectadas — /unidades possui 4 violações no axe. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/unidades.json)
- [HIGH] accessibility [/doutores]: Violações de acessibilidade detectadas — /doutores possui 4 violações no axe. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/doutores.json)
- [HIGH] accessibility [/sobre]: Violações de acessibilidade detectadas — /sobre possui 4 violações no axe. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/sobre.json)
- [MEDIUM] seo [/sitemap.xml]: sitemap.xml incompleto — sitemap retornou 200 com 3 URLs.
- [MEDIUM] performance [/]: TTFB acima do alvo — / (desktop) com TTFB 4492ms.
- [MEDIUM] performance [/]: FCP acima do alvo — / (desktop) com FCP 6104ms.
- [MEDIUM] visual [/]: Alteração visual moderada — / (desktop) com 1.3396% de pixels alterados. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/diffs/desktop/home.png)
- [MEDIUM] performance [/agendamento]: TTFB acima do alvo — /agendamento (desktop) com TTFB 1880ms.
- [MEDIUM] accessibility [/agendamento]: Violações de acessibilidade detectadas — /agendamento possui 3 violações no axe. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/agendamento.json)
- [MEDIUM] performance [/unidades]: TTFB acima do alvo — /unidades (desktop) com TTFB 1316ms.
- [MEDIUM] visual [/unidades]: Dimensão de screenshot alterada — /unidades (desktop) mudou de 1440x1086 para 1440x1901. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/unidades.png)
- [MEDIUM] visual [/doutores]: Dimensão de screenshot alterada — /doutores (desktop) mudou de 1440x900 para 1440x1901. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/doutores.png)
- [MEDIUM] performance [/sobre]: TTFB acima do alvo — /sobre (desktop) com TTFB 1139ms.
- [MEDIUM] performance [/sobre]: FCP acima do alvo — /sobre (desktop) com FCP 2580ms.
- [MEDIUM] visual [/sobre]: Dimensão de screenshot alterada — /sobre (desktop) mudou de 1440x900 para 1440x1901. (evidência: reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/sobre.png)
- [MEDIUM] performance [/]: TTFB acima do alvo — / (mobile) com TTFB 1364ms.

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

- reports/quality/2026-03-05T12-42-03-610Z-audit360/logs/quality-check.log
- reports/quality/2026-03-05T12-42-03-610Z-audit360/logs/npm-audit-prod.log
- reports/quality/2026-03-05T12-42-03-610Z-audit360/npm-audit-prod.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/seo-pages.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/home.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/home.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/agendamento.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/agendamento.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/unidades.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/unidades.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/doutores.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/doutores.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/sobre.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/sobre.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/privacidade.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/privacidade.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y/termos.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/desktop/termos.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/home.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/agendamento.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/unidades.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/doutores.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/sobre.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/privacidade.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/screenshots/mobile/termos.png
- reports/quality/2026-03-05T12-42-03-610Z-audit360/visual-summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/ux-summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/performance-summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/a11y-summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/logs/lighthouse-home.log
- reports/quality/2026-03-05T12-42-03-610Z-audit360/lighthouse/home.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/logs/lighthouse-agendamento.log
- reports/quality/2026-03-05T12-42-03-610Z-audit360/lighthouse/agendamento.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/lighthouse-summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/strategy-audit.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/design-reform-backlog.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/design-reform-roadmap.md
- reports/quality/2026-03-05T12-42-03-610Z-audit360/findings.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/summary.json
- reports/quality/2026-03-05T12-42-03-610Z-audit360/summary.env
