# Calculadora de Reajuste — Combustível

App web de página única que substitui uma planilha de reajustes de preço de posto de combustível. Calcula custo, lucro e margem por litro dos quatro combustíveis em cada reajuste, guarda o histórico e mostra a evolução do lucro em gráfico.

> **Os dados deste repositório são fictícios.** `data/` traz 12 reajustes de exemplo gerados por `scripts/gerar-exemplo.js`. Os dados reais ficam fora do Git, na pasta local `dados-reais/` (veja [Dados reais](#dados-reais)).

## Como usar

Não há dependências para instalar: abra `index.html` no navegador.

Para publicar no **GitHub Pages**: Settings → Pages → *Deploy from a branch* → `main` / `(root)`. O arquivo `.nojekyll` já está no repositório.

> Fora da plataforma de artifacts do Claude (arquivo local ou GitHub Pages), os reajustes e configurações ficam salvos **só no navegador** em que foram feitos (`localStorage`). Use Exportar/Importar backup para levá-los a outro aparelho. Veja [Persistência](#persistência).

Comandos (Node.js, sem dependências):

| Comando | O que faz |
|---|---|
| `npm test` | Confere os cálculos e se `index.html` está em dia com o template |
| `npm run build` | Gera `index.html` a partir de `src/app.template.html` + `data/` |
| `npm run build:real` | Gera `dados-reais/index.html` com os dados reais (só local) |
| `npm run exemplo` | Gera de novo os dados fictícios de `data/` |

## Conteúdo

| Pasta / arquivo | O que é |
|---|---|
| `index.html` | Página pronta, com os dados de exemplo embutidos. Gerada por `scripts/build.js`. |
| `src/app.template.html` | Código do app, com `__STATE__` no lugar dos dados. É a base para editar. |
| `data/historico.json` | Reajustes de exemplo (fictícios), no formato que o app usa. |
| `data/config.json` | Frete e imposto de exemplo, usados também em "Restaurar padrão". |
| `scripts/build.js` | Junta template + `historico.json` + `config.json` numa página. |
| `scripts/gerar-exemplo.js` | Gera os dados fictícios de `data/`. |
| `tests/verificar_calculos.js` | Confere `calc()` contra um caso calculado à mão e uma implementação independente das fórmulas. |
| `design/tokens.md` | Cores, fontes e regras visuais. |
| `dados-reais/` | **Fora do Git** (`.gitignore`). Dados reais, planilha original e página com os dados reais. |

## Dados reais

A pasta `dados-reais/` existe só na máquina local e nunca vai para o GitHub. Ela segue o mesmo formato de `data/`:

| Arquivo | O que é |
|---|---|
| `historico.json`, `config.json` | Histórico e configurações reais |
| `index.html` | Página com os dados reais (`npm run build:real`) |
| `esperado_planilha.json` | Resultados da planilha original. Se existir, `npm test` confere os reajustes reais contra ele. |
| `reajuste.xlsx`, `historico.csv`, `screenshots/` | Planilha original, exportação em CSV e capturas de tela |

## Telas

O menu hambúrguer (canto superior esquerdo) abre a navegação lateral. Cada tela tem seu endereço: `#dashboard`, `#historico` e `#configuracoes`.

**Dashboard**
1. Gráfico de linhas do lucro bruto por litro, com uma série por combustível e a média dos quatro tracejada.
   - Filtro de período: últimos 5, 10 ou 20 reajustes, todos, ou um intervalo de/até.
   - Filtro de combustível por botões, que funcionam também como legenda.
2. Média de lucro atual, do último reajuste salvo: valor em R$/L, margem média em % e diferença para o reajuste anterior. Abaixo vêm o lucro e a margem de cada combustível.
3. Novo reajuste: Compra, Quantidade e Venda de cada combustível. Mostra na hora o custo e o lucro por litro de cada um, a média de lucro (com a diferença para o atual) e o Lucro Bruto Total.
   - Botões Limpar, Copiar (resumo em texto) e Salvar reajuste.
   - O nome do novo reajuste é gerado sozinho (maior número existente + 1); a data vem preenchida com o dia.
   - No celular, a média de lucro e o botão Salvar ficam numa barra fixa no rodapé.

**Histórico.** Reajustes do mais recente para o mais antigo, com média de lucro, diferença para o anterior e Lucro Bruto Total. Em "Detalhes" aparecem:
- uma tabela com quantidade, compra, venda e lucro por litro de cada combustível;
- a edição da data;
- o botão "Usar como base", que copia os preços para o novo reajuste;
- o botão Excluir, que pede um segundo toque para confirmar.

**Configurações.** Frete em R$/L, aplicado aos quatro combustíveis. Imposto calculado como % sobre a venda ou como valor fixo por litro, um por combustível. "Restaurar padrão" volta para os valores de `config.json`; "Restaurar histórico original" volta para o histórico embutido na página e pede confirmação.

**Backup.** Em Configurações, "Exportar backup" baixa `reajustes-backup-AAAA-MM-DD.json` com o histórico e as configurações (`{app, versao, exportado, cfg, hist}`). "Importar backup" lê esse arquivo, confere se cada reajuste tem id, nome, data válida e os 4 combustíveis com valores numéricos, mostra quantos reajustes serão substituídos e pede um segundo toque para confirmar. Aceita também um JSON de estado do app (`{cfg, hist, …}`).

## Regras de cálculo

São as fórmulas da planilha original, por combustível. A coluna da planilha aparece entre parênteses.

| Campo | Fórmula |
|---|---|
| Imposto (E) | `venda × alíquota` no modo %, ou um valor fixo em R$/L |
| Custo /L (F) | `compra + frete + imposto` |
| Custo total (G) | `quantidade × custo` |
| Lucro bruto /L (J) | `venda − custo` |
| Faturamento (K) | `quantidade × venda` |
| Margem % | `lucro /L ÷ venda` (não existia na planilha) |

Totais do reajuste:

| Campo | Fórmula |
|---|---|
| Custo total, Faturamento | Soma dos quatro combustíveis |
| Lucro Bruto Total | `Faturamento − Custo total` |
| Média de custo (L), Média de lucro (M) | Média **simples** dos quatro combustíveis, como `=AVERAGE(F:F)` na planilha. Entra até combustível com quantidade 0. |
| Margem média | Média simples das quatro margens |

Rode `npm test` depois de qualquer mudança em `calc()`.

## Modelo de dados

O estado fica num `<script type="application/json" id="state">` dentro da própria página:

```json
{
  "rev": 1,
  "cfg":    { "frete": 0.2, "modo": "pct", "pct": 1.5,
              "fixo": { "gas": 0.08, "adt": 0.08, "s10": 0.085, "s500": 0.09 } },
  "padrao": { … configuração usada em "Restaurar padrão" … },
  "hist": [
    { "id": "e1", "nome": "Reajuste 1", "data": "2026-01-06",
      "itens": [ { "q": 8000, "c": 5.1234, "f": 0.2, "tm": "p", "t": 1.5, "v": 6.0 }, … ] }
  ],
  "seed": [ … cópia do histórico, usada em "Restaurar histórico original" … ]
}
```

- `itens` segue sempre esta ordem: Gasolina Comum, Gasolina Aditivada, Diesel S10, Diesel S500.
- Cada item guarda seu próprio frete (`f`) e imposto: `tm` é `"p"` (% da venda, com `t` em %) ou `"r"` (R$/L, com `t` em reais). Assim, um reajuste antigo continua com os valores da época mesmo depois de mudar as configurações.
- `data` é `"AAAA-MM-DD"` ou `null`.

## Persistência

- **Histórico e configurações:** usam a capacidade `artifact` da plataforma de artifacts do Claude.
  - Ao salvar, o app gera de novo o HTML completo, só com o JSON de estado trocado, e publica como nova versão com `artifact.publish(html)`.
  - Todas as janelas abertas recarregam.
  - A estrutura da página é capturada no início do script, antes de qualquer alteração no DOM: são os elementos marcados com `data-own`.
- **Valores digitados no novo reajuste e filtros do gráfico:** ficam no `localStorage` do navegador (`calc-reajuste-draft`, `calc-reajuste-ui`).
- **Fora da plataforma** (arquivo aberto localmente, GitHub Pages ou capacidade indisponível): o app salva o estado só no `localStorage` (`calc-reajuste-state`) e mostra o aviso em Configurações. Quem tiver o `rev` maior prevalece no carregamento. Para passar os dados de um navegador ou aparelho para outro, use Exportar/Importar backup.

**Para levar a outro servidor**, troque a função `persist()` por uma chamada à sua API. O formato do estado pode continuar o mesmo, e o restante do app não depende da plataforma.

## Dependências

- Chart.js 4.4.1 (`cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js`)
- Google Fonts: Barlow e Barlow Condensed

Não há etapa de compilação: é HTML, CSS e JavaScript puro num único arquivo.

## Para regerar a página

Edite `src/app.template.html` (código) ou `data/historico.json` / `data/config.json` (dados) e rode `npm run build` (e `npm run build:real` para a página com os dados reais). O script troca `__STATE__` pelo JSON de estado (com `<` escapado como `<`) e mantém o `rev` da página atual. Depois rode `npm test`.

## Limitações conhecidas

- O filtro de período trabalha por quantidade de reajustes, não por datas, porque reajustes podem não ter data. Quando há datas, o eixo do gráfico mostra dd/mm.
- As configurações aceitam um único frete para os quatro combustíveis. Reajustes antigos com fretes ou impostos diferentes entre combustíveis continuam corretos no histórico, mas não dá para criar um reajuste novo assim pelas configurações.
- Duas pessoas salvando ao mesmo tempo: vale o primeiro salvamento, e a outra janela recarrega e perde a alteração (ela recebe um aviso).
