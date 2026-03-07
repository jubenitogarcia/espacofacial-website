# Audit 360 Report

- Base URL: https://espacofacial.com
- Run: 2026-03-04T23:21:33.615Z
- Overall score: **58/100**

## Scorecard

| Pilar | Score | Status |
|---|---:|---|
| quality | 80 | FAIL |
| security | 80 | WARN |
| seo | 0 | WARN |
| visual | 20 | WARN |
| ui | 100 | PASS |
| ux | 100 | PASS |
| accessibility | 10 | WARN |
| performance | 76 | WARN |

## Checks

- quality: FAIL (quality:check falhou)
- security: WARN (0 critical / 1 high)
- seo: WARN (15 achados)
- visual: WARN (14 screenshots)
- ux: PASS (14 páginas verificadas)
- ui: PASS (14 páginas verificadas)
- accessibility: WARN (7 páginas com axe)
- performance: WARN (14 medições)

## Findings (Top 20)

- [HIGH] quality: Quality suite falhou — Lint/typecheck/test/build/smoke strict não passaram. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/logs/quality-check.log)
- [HIGH] security: Vulnerabilidades de produção pendentes — npm audit reportou 0 critical e 1 high em produção. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/npm-audit-prod.json)
- [HIGH] seo [/agendamento]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] seo [/privacidade]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] seo [/termos]: Meta noindex detectada — Rota crítica contém noindex.
- [HIGH] accessibility [/]: Violações de acessibilidade detectadas — / possui 4 violações no axe. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/home.json)
- [HIGH] accessibility [/unidades]: Violações de acessibilidade detectadas — /unidades possui 4 violações no axe. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/unidades.json)
- [HIGH] visual [/doutores]: Regressão visual significativa — /doutores (desktop) com 25.481% de pixels alterados. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/diffs/desktop/doutores.png)
- [HIGH] accessibility [/doutores]: Violações de acessibilidade detectadas — /doutores possui 4 violações no axe. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/doutores.json)
- [HIGH] visual [/sobre]: Regressão visual significativa — /sobre (desktop) com 24.0681% de pixels alterados. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/diffs/desktop/sobre.png)
- [HIGH] accessibility [/sobre]: Violações de acessibilidade detectadas — /sobre possui 4 violações no axe. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/sobre.json)
- [HIGH] visual [/doutores]: Regressão visual significativa — /doutores (mobile) com 5.7872% de pixels alterados. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/diffs/mobile/doutores.png)
- [HIGH] visual [/sobre]: Regressão visual significativa — /sobre (mobile) com 4.282% de pixels alterados. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/diffs/mobile/sobre.png)
- [MEDIUM] seo [/agendamento]: Quantidade de H1 não ideal — Encontrados 0 h1; recomendado: 1.
- [MEDIUM] seo [/sitemap.xml]: sitemap.xml incompleto — sitemap retornou 200 com 3 URLs.
- [MEDIUM] accessibility [/agendamento]: Violações de acessibilidade detectadas — /agendamento possui 3 violações no axe. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/agendamento.json)
- [MEDIUM] performance [/doutores]: TTFB acima do alvo — /doutores (desktop) com TTFB 6908ms.
- [MEDIUM] performance [/doutores]: FCP acima do alvo — /doutores (desktop) com FCP 6992ms.
- [MEDIUM] seo [/agendamento]: Lighthouse SEO baixo — /agendamento com score 61. (evidência: reports/quality/2026-03-04T23-18-10-129Z-audit360/lighthouse/agendamento.json)
- [LOW] seo [/]: Title fora do range recomendado — Comprimento atual: 13 chars.

## Próximos passos sugeridos

- Resolver findings HIGH primeiro (segurança, SEO bloqueante, acessibilidade crítica).
- Revisar alterações visuais acima de 0.5% em páginas críticas.
- Tratar warnings de performance (TTFB/FCP) e imagens não otimizadas.
- Reexecutar `npm run audit:360` após ajustes para confirmar regressões.

## Artifacts

- reports/quality/2026-03-04T23-18-10-129Z-audit360/logs/quality-check.log
- reports/quality/2026-03-04T23-18-10-129Z-audit360/logs/npm-audit-prod.log
- reports/quality/2026-03-04T23-18-10-129Z-audit360/npm-audit-prod.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/seo-pages.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/home.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/home.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/agendamento.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/agendamento.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/unidades.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/unidades.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/doutores.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/doutores.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/sobre.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/sobre.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/privacidade.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/privacidade.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/desktop/termos.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y/termos.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/home.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/agendamento.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/unidades.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/doutores.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/sobre.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/privacidade.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/screenshots/mobile/termos.png
- reports/quality/2026-03-04T23-18-10-129Z-audit360/visual-summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/ux-summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/performance-summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/a11y-summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/logs/lighthouse-home.log
- reports/quality/2026-03-04T23-18-10-129Z-audit360/lighthouse/home.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/logs/lighthouse-agendamento.log
- reports/quality/2026-03-04T23-18-10-129Z-audit360/lighthouse/agendamento.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/lighthouse-summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/findings.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/summary.json
- reports/quality/2026-03-04T23-18-10-129Z-audit360/summary.env
