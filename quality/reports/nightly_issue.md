## Regressão de Qualidade Detectada (Nightly)

- Data: 2026-03-04T20:06:25.277Z
- Base URL: http://127.0.0.1:3000

### Resumo
# Quality Summary

- Modo: pr
- Base URL: http://127.0.0.1:3000
- URLs auditadas: 8

## Lighthouse (média)

| Categoria | Score |
| --- | --- |
| Performance | 78% |
| Accessibility | 90% |
| Best Practices | 99% |
| SEO | 92% |

- Axe critical: 6
- Axe serious: 14
- Links quebrados: 2
- UI high-risk snapshots: 0

## Top 5 problemas

| Rank | Área | Problema |
| --- | --- | --- |
| #1 | links | 2 links quebrados detectados |
| #2 | a11y | 6 violações críticas de acessibilidade |
| #3 | a11y | 14 violações sérias de acessibilidade |
| #4 | lighthouse | Performance médio em 78% |

### Recomendações iniciais
1. Corrigir primeiro os itens críticos de acessibilidade e links quebrados em páginas críticas.
2. Rever assets pesados e render-blocking para elevar performance.
3. Validar snapshots com overflow/CLS antes do próximo deploy.

### Artefatos
- Veja os artifacts do workflow nightly em `quality-reports`.
