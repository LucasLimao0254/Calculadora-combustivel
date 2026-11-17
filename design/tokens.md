# Design — tokens e regras

Os tokens estão no bloco `:root` do `<style>` de `src/app.template.html`. O tema escuro é aplicado de duas formas: por `prefers-color-scheme` e por `data-theme="dark"`.

## Cores da interface

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#f3f4f2` | `#11161b` | Fundo da página |
| `--surface` | `#ffffff` | `#1a1a19` | Painéis e cartões |
| `--ink` | `#18222b` | `#f0efec` | Texto principal |
| `--muted` | `#5d6872` | `#a3a9ae` | Rótulos e texto secundário |
| `--line` | `#d9ddd8` | `#2f3438` | Bordas |
| `--field` | `#f7f8f6` | `#141618` | Fundo dos campos |
| `--primary` | `#18222b` | `#f0efec` | Botão principal, item ativo |
| `--focus` | `#2a78d6` | `#3987e5` | Foco e links |
| `--good` | `#1f7a4d` | `#4fc386` | Lucro positivo, alta |
| `--bad` | `#b3261e` | `#ff7b72` | Lucro negativo, queda, excluir |

## Cores dos combustíveis

As cores dos combustíveis seguem uma ordem categórica validada para daltonismo em linhas adjacentes. Cada combustível também tem um marcador de formato próprio, então nunca é identificado só pela cor.

| Combustível | Claro | Escuro | Marcador |
|---|---|---|---|
| Gasolina Comum | `#eb6834` | `#d95926` | círculo |
| Gasolina Aditivada | `#2a78d6` | `#3987e5` | quadrado |
| Diesel S10 | `#1baf7a` | `#199e70` | triângulo |
| Diesel S500 | `#eda100` | `#c98500` | losango |
| Média dos 4 | `--ink` | `--ink` | linha tracejada, mais grossa |

## Tipografia

- **Barlow Condensed:** títulos e números grandes. Remete ao visor de bomba de combustível.
- **Barlow:** texto corrido e rótulos.
- Os números usam `font-variant-numeric: tabular-nums`.

## Formatação numérica (pt-BR)

| Valor | Casas decimais | Exemplo |
|---|---|---|
| Compra e custo /L | 4 | `5,1234` |
| Venda | 2 | `6,00` |
| Valores totais | 2 | `R$ 12.345,67` |
| Lucro /L | 4 | `R$ 0,5678` |
| Margem | 1 | `9,5%` |
| Quantidade | 0, com separador de milhar | `8.000` |

Os campos aceitam vírgula ou ponto como separador decimal. No campo de quantidade, o ponto é tratado como separador de milhar.

## Responsivo (até 640 px)

- O resumo do novo reajuste é substituído pela barra fixa no rodapé, com a média de lucro e o botão Salvar.
- Os campos ficam com Compra ocupando a linha inteira e Quantidade e Venda lado a lado.
- Os alvos de toque têm pelo menos 44 px, e o layout respeita as áreas seguras do iOS (`env(safe-area-inset-*)`).
