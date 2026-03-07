# Audit 360 Report

- Base URL: https://espacofacial.com
- Run: 2026-03-04T23:33:08.553Z
- Overall score: **85/100**

## Scorecard

| Pilar | Score | Status |
|---|---:|---|
| quality | 100 | PASS |
| security | 80 | WARN |
| seo | 90 | WARN |
| visual | 20 | WARN |
| ui | 100 | PASS |
| ux | 100 | PASS |
| accessibility | 90 | WARN |
| performance | 100 | PASS |

## Checks

- quality: PASS (quality:check passou)
- security: WARN (0 critical / 1 high)
- seo: WARN (1 achados)
- visual: WARN (14 screenshots)
- ux: PASS (14 páginas verificadas)
- ui: PASS (14 páginas verificadas)
- accessibility: WARN (7 páginas com axe)
- performance: PASS (14 medições)

## Findings (Top 20)

- [HIGH] security: Vulnerabilidades de produção pendentes — npm audit reportou 0 critical e 1 high em produção. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/npm-audit-prod.json)
- [MEDIUM] seo [/agendamento]: Quantidade de H1 não ideal — Encontrados 0 h1; recomendado: 1.
- [MEDIUM] visual [/]: Alteração visual moderada — / (desktop) com 1.3396% de pixels alterados. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/diffs/desktop/home.png)
- [MEDIUM] accessibility [/agendamento]: Violações de acessibilidade detectadas — /agendamento possui 1 violações no axe. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/agendamento.json)
- [MEDIUM] visual [/unidades]: Dimensão de screenshot alterada — /unidades (desktop) mudou de 1440x1901 para 1440x1086. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/unidades.png)
- [MEDIUM] visual [/doutores]: Dimensão de screenshot alterada — /doutores (desktop) mudou de 1440x1901 para 1440x900. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/doutores.png)
- [MEDIUM] visual [/sobre]: Dimensão de screenshot alterada — /sobre (desktop) mudou de 1440x1901 para 1440x900. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/sobre.png)
- [MEDIUM] visual [/]: Dimensão de screenshot alterada — / (mobile) mudou de 1170x11049 para 1170x11121. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/home.png)
- [MEDIUM] visual [/unidades]: Dimensão de screenshot alterada — /unidades (mobile) mudou de 1170x11049 para 1170x8592. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/unidades.png)
- [MEDIUM] visual [/doutores]: Dimensão de screenshot alterada — /doutores (mobile) mudou de 1170x11049 para 1170x1992. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/doutores.png)
- [MEDIUM] visual [/sobre]: Dimensão de screenshot alterada — /sobre (mobile) mudou de 1170x11049 para 1170x2031. (evidência: reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/sobre.png)

## Próximos passos sugeridos

- Resolver findings HIGH primeiro (segurança, SEO bloqueante, acessibilidade crítica).
- Revisar alterações visuais acima de 0.5% em páginas críticas.
- Tratar warnings de performance (TTFB/FCP) e imagens não otimizadas.
- Reexecutar `npm run audit:360` após ajustes para confirmar regressões.

## Artifacts

- reports/quality/2026-03-04T23-31-38-123Z-audit360/logs/quality-check.log
- reports/quality/2026-03-04T23-31-38-123Z-audit360/logs/npm-audit-prod.log
- reports/quality/2026-03-04T23-31-38-123Z-audit360/npm-audit-prod.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/seo-pages.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/home.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/home.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/agendamento.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/agendamento.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/unidades.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/unidades.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/doutores.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/doutores.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/sobre.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/sobre.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/privacidade.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/privacidade.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/desktop/termos.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y/termos.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/home.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/agendamento.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/unidades.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/doutores.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/sobre.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/privacidade.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/screenshots/mobile/termos.png
- reports/quality/2026-03-04T23-31-38-123Z-audit360/visual-summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/ux-summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/performance-summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/a11y-summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/logs/lighthouse-home.log
- reports/quality/2026-03-04T23-31-38-123Z-audit360/lighthouse/home.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/logs/lighthouse-agendamento.log
- reports/quality/2026-03-04T23-31-38-123Z-audit360/lighthouse/agendamento.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/lighthouse-summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/findings.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/summary.json
- reports/quality/2026-03-04T23-31-38-123Z-audit360/summary.env
