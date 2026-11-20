# Design — tokens e regras (tema Nocturne)

Os tokens estão no bloco `:root` do `<style>` de `src/app.template.html`. O app tem só tema escuro (`color-scheme: dark`).

## Cores da interface

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#161826` | Fundo da página e dos blocos internos dos cartões |
| `--color-surface` | `#232532` | Cartões |
| `--color-text` | `#e9e9ed` | Texto principal. Texto secundário: o mesmo a 50–75% (`--t50` … `--t75`) |
| `--color-accent` | `#9184d9` | Aba ativa, botão principal, foco |
| `--color-accent-300` | `#d2cefd` | Cabeçalho "Cenário", ícones de aviso |
| `--color-accent-900` | `#2b2741` | Brilho do gradiente de fundo |
| `--color-divider` | texto a 16% | Bordas de campos, segmentos e separadores |
| `--good` | `oklch(0.80 0.12 155)` | Alta, lucro positivo |
| `--bad` | `oklch(0.74 0.14 25)` | Queda, lucro negativo, excluir |

Fundo da página: `radial-gradient(120% 50% at 0% 0%, var(--color-accent-900), var(--color-bg) 70%)`.
Separadores somem nas pontas (`.hr`, gradiente de 48 px em cada lado).

## Cores dos combustíveis

Nenhum combustível é identificado só pela cor: cada um tem um marcador de formato próprio (`.mk`).

| Combustível | Cor | Marcador |
|---|---|---|
| Gasolina Comum | `oklch(0.74 0.12 50)` | círculo |
| Gasolina Aditivada | `oklch(0.74 0.10 245)` | quadrado |
| Diesel S10 | `oklch(0.77 0.10 170)` | triângulo |
| Diesel S500 | `oklch(0.83 0.11 88)` | losango |
| Média dos 4 | `--color-text` | traço; no gráfico, linha tracejada `5 4` de 2,5 px |

## Tipografia

- **Inter** 400 e 500, nunca acima de 500.
- Escala: h3 25 px, h5 16 px, h6 13 px em caixa alta (0,08em); corpo 15 px, line-height 1,55.
- Números sempre com `font-variant-numeric: tabular-nums`.

## Componentes

- **Cartões:** `--color-surface`, raio 14 px, padding 16 px, sem borda.
- **Botões:** `.btn-primary` tem só contorno na cor de destaque (hover 12%, pressionado 22%); `.btn-secondary` tem contorno no divisor.
- **Segmentos** (`.seg`), **tags de variação** (`.tag`, fundo com 16% da cor) e **campos** (44 px, fundo `--color-bg`, prefixo e sufixo em 12 px a 50%).
- **Ícones:** Phosphor (regular; fill na aba ativa e nas setas de variação).
- **Alvos de toque:** pelo menos 44 px. Foco: contorno de 2 px na cor de destaque.

## Formatação numérica (pt-BR)

| Valor | Casas decimais | Exemplo |
|---|---|---|
| Compra e custo /L | 4 | `5,1234` |
| Venda | 2 | `6,00` |
| Valores totais | 2 | `R$ 12.345,67` |
| Lucro /L e variações | 4 | `R$ 0,5678`, `+0,0100`, `−0,0100` (sinal de menos U+2212) |
| Margem | 1 | `9,5%` |
| Quantidade | 0, com separador de milhar | `8.000` |

Os campos aceitam vírgula ou ponto como separador decimal. No campo de quantidade, o ponto é tratado como separador de milhar.

## Layout

- Coluna única fluida (máx. 560 px no computador), referência de 390 × 844 px.
- Barra de abas de 58 px + área segura inferior (mínimo 24 px); o conteúdo respeita `env(safe-area-inset-*)`.
- Troca de tela: `opacity 0→1` e `translateY(6px)→0` em 220 ms (desligada com `prefers-reduced-motion`).
