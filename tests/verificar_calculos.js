// Confere a função calc() do app contra uma implementação independente das fórmulas da planilha.
// Uso: node tests/verificar_calculos.js
// Se existir dados-reais/esperado_planilha.json (pasta local, fora do Git), confere também
// os reajustes reais contra os resultados lidos da planilha original.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "src/app.template.html"), "utf8");
const src = html.match(/function calc\(itens\)[\s\S]*?\n}\n/)[0];
const calc = new Function(src + ";return calc;")();

let ok = 0, falhas = 0;
const perto = (a, b) => Math.abs(a - b) <= 1e-6;
function conferir(nome, r, esp) {
  const erro = Object.entries(esp).filter(([k, v]) => !perto(r[k], v));
  if (erro.length) { falhas++; console.log(`✗ ${nome}:`, erro.map(([k, v]) => `${k} app=${r[k]} esperado=${v}`).join("; ")); }
  else ok++;
}

// 1) Caso calculado à mão
//    Imposto = 6,00 × 1,5% = 0,09 · Custo = 5,00 + 0,20 + 0,09 = 5,29 · Lucro = 0,71
//    Item fixo: Custo = 5,50 + 0,20 + 0,10 = 5,80 · Lucro = 0,70 · item com quantidade 0 entra na média
const P = (q, c, v) => ({ q, c, f: 0.2, tm: "p", t: 1.5, v });
conferir("caso manual", calc([P(1000, 5, 6), P(500, 5, 6), { q: 2000, c: 5.5, f: 0.2, tm: "r", t: 0.1, v: 6.5 }, P(0, 5, 6)]), {
  ct: 1000 * 5.29 + 500 * 5.29 + 2000 * 5.8,   // 19535
  fat: 6000 + 3000 + 13000,                     // 22000
  lb: 22000 - 19535,                            // 2465
  mc: (5.29 * 3 + 5.8) / 4,                     // 5,4175
  ml: (0.71 * 3 + 0.7) / 4                      // 0,7075
});

// 2) Implementação independente, aplicada a cada reajuste de data/historico.json
function referencia(itens) {
  let ct = 0, fat = 0, somaCusto = 0, somaLucro = 0;
  for (const it of itens) {
    const imposto = it.tm === "p" ? it.v * (it.t / 100) : it.t;
    const custo = it.c + it.f + imposto;
    ct += it.q * custo; fat += it.q * it.v; somaCusto += custo; somaLucro += it.v - custo;
  }
  return { ct, fat, lb: fat - ct, mc: somaCusto / 4, ml: somaLucro / 4 };
}
const exemplo = JSON.parse(fs.readFileSync(path.join(root, "data/historico.json"), "utf8"));
for (const h of exemplo) conferir(h.nome, calc(h.itens), referencia(h.itens));
console.log(`Exemplo: ${exemplo.length} reajustes + caso manual conferidos.`);

// 3) Opcional: dados reais contra a planilha original (só na máquina que tem a pasta dados-reais/)
const espPath = path.join(root, "dados-reais/esperado_planilha.json");
if (fs.existsSync(espPath)) {
  const hist = JSON.parse(fs.readFileSync(path.join(root, "dados-reais/historico.json"), "utf8"));
  const esp = JSON.parse(fs.readFileSync(espPath, "utf8"));
  for (const e of esp) {
    const h = hist.find(x => x.id === e.id);
    if (!h) { console.log(`- ${e.nome}: não está no histórico (excluído?)`); continue; }
    conferir(e.nome, calc(h.itens), { ct: e.custo_total, fat: e.faturamento, lb: e.lucro_bruto_total, mc: e.media_custo, ml: e.media_lucro });
  }
  console.log(`Dados reais: ${esp.length} reajustes conferidos contra a planilha.`);
}

console.log(`${ok} conferem, ${falhas} com diferença.`);
process.exit(falhas ? 1 : 0);
