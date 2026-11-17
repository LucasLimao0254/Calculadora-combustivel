// Gera a página a partir de src/app.template.html + historico.json + config.json.
// Uso: node scripts/build.js                       (data/ de exemplo → index.html)
//      node scripts/build.js --dados dados-reais   (dados reais → dados-reais/index.html)
//      node scripts/build.js --check               (só confere se a saída está atualizada)
// Opções: --dados <pasta> (padrão: data)  --saida <arquivo> (padrão: index.html, ou <pasta>/index.html com --dados)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const arg = (nome, padrao) => { const i = process.argv.indexOf(nome); return i > -1 ? process.argv[i + 1] : padrao; };

const dados = arg("--dados", "data");
const saida = path.resolve(root, arg("--saida", dados === "data" ? "index.html" : path.join(dados, "index.html")));
const ler = f => fs.readFileSync(path.resolve(root, f), "utf8");

const hist = JSON.parse(ler(path.join(dados, "historico.json")));
const cfg = JSON.parse(ler(path.join(dados, "config.json")));

// Mantém o rev da página atual, para que navegadores com alterações locais mais novas continuem prevalecendo.
let rev = 1;
try {
  const m = fs.readFileSync(saida, "utf8").match(/id="state" data-own>([\s\S]*?)<\/script>/);
  if (m) rev = JSON.parse(m[1]).rev || 1;
} catch (e) {}

// cfg: configuração em uso · padrao: usada em "Restaurar padrão"
// hist: histórico · seed: cópia usada em "Restaurar histórico original"
const state = { rev, cfg, padrao: cfg, hist, seed: hist };
const html = ler("src/app.template.html")
  .replace("__STATE__", () => JSON.stringify(state).replace(/</g, "\\u003c"));

const rel = path.relative(root, saida);
if (process.argv.includes("--check")) {
  const atual = fs.existsSync(saida) ? fs.readFileSync(saida, "utf8") : "";
  if (atual !== html) { console.log(`✗ ${rel} está desatualizado. Rode: npm run build`); process.exit(1); }
  console.log(`✓ ${rel} está atualizado.`);
} else {
  fs.writeFileSync(saida, html);
  console.log(`${rel} gerado (${hist.length} reajustes, rev ${rev}).`);
}
