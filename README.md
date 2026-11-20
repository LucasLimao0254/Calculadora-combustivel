# Calculadora de Reajuste — Combustível

App web de página única que substitui uma planilha de reajustes de preço de posto de combustível. Calcula custo, lucro e margem por litro dos quatro combustíveis em cada reajuste, guarda o histórico e mostra a evolução do lucro em gráfico.

> **O app vem em branco:** sem reajustes e com frete e imposto zerados. Preencha as Configurações e salve o primeiro reajuste, ou importe um backup em Configurações. Os dados reais ficam fora do Git, na pasta local `dados-reais/` (veja [Dados reais](#dados-reais)).

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

## Instalar no celular (PWA)

O app é um PWA: pode ser instalado com ícone na tela inicial e funciona sem internet depois do primeiro acesso.

- **Android (Chrome):** abra o site e use o botão **Instalar app** em Configurações, ou o menu ⋮ → *Instalar app*.
- **iPhone (Safari):** Compartilhar → *Adicionar à Tela de Início*.

Os dados continuam no armazenamento do navegador do aparelho; o app instalado pede ao navegador para não apagá-los (`navigator.storage.persist()`). Exporte um backup de vez em quando.

Arquivos do PWA: `manifest.webmanifest`, `sw.js` (service worker: página com rede primeiro e cache como reserva; ícones Phosphor, fonte Inter e ícones do app em cache) e `icons/` (gerados por `npm run icones`). Ao mudar a lista de arquivos em cache, aumente `VERSAO` em `sw.js`.

## Conteúdo

| Pasta / arquivo | O que é |
|---|---|
| `index.html` | Página pronta, em branco. Gerada por `scripts/build.js`. |
| `src/app.template.html` | Código do app, com `__STATE__` no lugar dos dados. É a base para editar. |
| `data/historico.json` | Histórico embutido na página. Vazio (`[]`) no repositório. |
| `data/config.json` | Frete e imposto iniciais, usados também em "Restaurar padrão". Zerados no repositório. |
| `scripts/build.js` | Junta template + `historico.json` + `config.json` numa página. |
| `tests/verificar_calculos.js` | Confere `calc()` contra um caso calculado à mão e uma implementação independente das fórmulas, em 500 reajustes aleatórios. |
| `design/tokens.md` | Cores, fontes e regras visuais. |
| `dados-reais/` | **Fora do Git** (`.gitignore`). Dados reais, planilha original e página com os dados reais. |

## Dados reais

A pasta `dados-reais/` existe só na máquina local e nunca vai para o GitHub. Ela segue o mesmo formato de `data/`:

| Arquivo | O que é |
|---|---|
| `historico.json`, `config.json` | Histórico e configurações reais |
| `backup-dados-reais.json` | Backup no formato do app, para importar no celular ou em outro navegador |
| `index.html` | Página com os dados reais (`npm run build:real`) |
| `esperado_planilha.json` | Resultados da planilha original. Se existir, `npm test` confere os reajustes reais contra ele. |
| `reajuste.xlsx`, `historico.csv`, `screenshots/` | Planilha original, exportação em CSV e capturas de tela |

## Telas

Design mobile-first no tema escuro **Nocturne**, com uma barra de abas embaixo. Cada aba tem seu endereço: `#inicio`, `#simular`, `#historico` e `#ajustes` (os antigos `#dashboard` e `#configuracoes` continuam funcionando). A última aba aberta fica guardada no aparelho.

**Início**
1. Gráfico do lucro bruto por litro (SVG próprio): uma linha por combustível e a média dos quatro tracejada, grade a cada R$ 0,50.
   - Período: últimos 5, 10 ou 20 reajustes, ou todos.
   - Chips de combustível ligam e desligam as séries e funcionam como legenda.
2. Média de lucro atual (último reajuste salvo): valor em R$/L, margem média e variação contra o anterior. Abaixo, uma grade 2×2 com lucro e margem de cada combustível.

**Simular** (novo reajuste, layout "Preço de venda")
- Resumo **Atual × Cenário**: média de lucro /L, margem média e lucro total, com a variação da média.
- Venda de cada combustível com botões − e + (R$ 0,01 por toque) e a linha "Lucro /L atual → cenário" com a variação.
- "Compra e quantidade" recolhível, preenchido com os valores do último reajuste (aberto quando não há reajustes).
- Data, Limpar, Copiar (resumo em texto) e **Salvar**, que vira "Salvo" por 1,8 s.
- O nome é gerado sozinho (maior número existente + 1).

**Histórico.** Do mais recente para o mais antigo, com média de lucro, variação e Lucro Bruto Total. Ao abrir um cartão: tabela por combustível, edição da data, **Usar como base** (copia os preços para Simular) e **Excluir** (o primeiro toque vira "Confirmar").

**Ajustes.**
- Frete em R$/L e imposto como % da venda ou valor fixo por litro (um por combustível). "Restaurar padrão" volta para `config.json`.
- Backup: **Exportar** baixa `reajustes-backup-AAAA-MM-DD.json` (`{app, versao, exportado, cfg, hist}`). **Importar** valida o arquivo (id, nome, data, os 4 combustíveis com valores numéricos) e mostra um quadro de confirmação com Cancelar e Substituir. Aceita também um JSON de estado do app (`{cfg, hist, …}`).
- "Restaurar histórico original" só aparece quando a página tem histórico embutido.
- "Instalar app" aparece quando o navegador permite instalar; no iPhone, aparecem as instruções.

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

- Phosphor Icons 2.1.1, web font regular e fill (`cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1`)
- Google Fonts: Inter 400 e 500

O gráfico é SVG feito no próprio app, sem biblioteca.

Não há etapa de compilação: é HTML, CSS e JavaScript puro num único arquivo.

## Para regerar a página

Edite `src/app.template.html` (código) ou `data/historico.json` / `data/config.json` (dados) e rode `npm run build` (e `npm run build:real` para a página com os dados reais). O script troca `__STATE__` pelo JSON de estado (com `<` escapado como `<`) e mantém o `rev` da página atual. Depois rode `npm test`.

## Limitações conhecidas

- O filtro de período trabalha por quantidade de reajustes, não por datas, porque reajustes podem não ter data.
- As configurações aceitam um único frete para os quatro combustíveis. Reajustes antigos com fretes ou impostos diferentes entre combustíveis continuam corretos no histórico, mas não dá para criar um reajuste novo assim pelas configurações.
- Duas pessoas salvando ao mesmo tempo: vale o primeiro salvamento, e a outra janela recarrega e perde a alteração (ela recebe um aviso).
