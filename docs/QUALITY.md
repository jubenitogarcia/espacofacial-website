# Quality Automation (CI + Nightly)

Este projeto possui uma camada contínua de qualidade para **performance**, **a11y**, **SEO técnico básico**, **integridade de links** e **consistência de UI via snapshots**.

## O que foi adicionado

- `quality/targets.json`: URLs e paths críticos auditados.
- `lighthouserc.cjs` + `quality/budgets.json`: Lighthouse CI com thresholds e budget.
- Scripts:
  - `scripts/fetch_sitemap_urls.mjs`
  - `scripts/select_audit_urls.mjs`
  - `scripts/run_axe.mjs`
  - `scripts/run_linkcheck.mjs`
  - `scripts/ui_snapshots.mjs`
  - `scripts/summarize_quality.mjs`
  - `scripts/quality_gate.mjs`
  - `scripts/run_quality_suite.mjs`
- Workflows:
  - `.github/workflows/quality_pr.yml`
  - `.github/workflows/quality_nightly.yml`
- Templates de issue em `.github/ISSUE_TEMPLATE/`.

## Como rodar localmente

Pré-requisitos:

```bash
npm ci
npx playwright install chromium
```

Auditoria de PR (modo local, com `next start`):

```bash
npm run quality:pr
```

Auditoria de produção (usa `quality/targets.json::baseUrlProd`):

```bash
npm run quality:prod
```

Gerar apenas seleção de URLs para auditoria:

```bash
npm run quality:urls
```

## Interpretação de falhas

Os relatórios ficam em `quality/reports/`.

Arquivos principais:

- `summary.md` e `summary.json`: visão consolidada.
- `gate.md` e `gate.json`: decisão do quality gate.
- `axe.json`: resumo de violações por impacto.
- `linkcheck.json`: links quebrados em markdown + páginas.
- `ui/ui.json`: UI Pack com métricas e observações por viewport.
- `lighthouse/`: reports HTML/JSON do LHCI.

### Política de gate

- PR (`profile=pr`): **gate leve**, falha só em regressão relevante.
- Nightly (`profile=nightly`): **gate mais rígido**; abre issue automática se regressão relevante.

Ajustes de limites:

- `quality/gates.json`: thresholds de score e limites (links, axe, CLS).
- `quality/budgets.json`: budget de bytes/recursos.
- `lighthouserc.cjs`: regras de assert e parâmetros de coleta.

## Targets e TODO

A URL de produção já está definida em `quality/targets.json`.

Se houver preview URL por PR, preencha:

- `quality/targets.json::baseUrlPreview`
- ou variável de repositório `QUALITY_BASE_URL_PREVIEW`

Enquanto isso, o workflow de PR usa servidor local para auditoria.

## Artefatos de CI

Os workflows fazem upload dos artefatos de qualidade:

- PR: artifact `quality-reports`.
- Nightly: artifact `quality-reports-nightly`.

Além disso:

- PR recebe comentário automático com resumo e top 5 ações.
- Nightly abre issue automática quando há regressão relevante.

## Labels recomendadas

- `performance`
- `a11y`
- `seo`
- `ux`
- `tech-debt`

