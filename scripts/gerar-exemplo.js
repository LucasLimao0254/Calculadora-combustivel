// Gera dados FICTÍCIOS de exemplo em data/ (historico.json e config.json).
// Uso: node scripts/gerar-exemplo.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");

let seed = 20260101;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const r = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

const cfg = { frete: 0.2, modo: "pct", pct: 1.5, fixo: { gas: 0.08, adt: 0.08, s10: 0.085, s500: 0.09 } };
const base = [
  { c: 5.1, q: 8000, m: 0.55 },  // Gasolina Comum
  { c: 5.1, q: 2000, m: 0.7 },   // Gasolina Aditivada
  { c: 5.4, q: 7000, m: 0.4 },   // Diesel S10
  { c: 5.3, q: 1500, m: 0.45 }   // Diesel S500
];

const hist = [];
let dia = new Date(Date.UTC(2026, 0, 6));
for (let n = 1; n <= 12; n++) {
  const choque = (rnd() - 0.45) * 0.3;
  const itens = base.map(b => {
    b.c = Math.max(4.5, b.c + choque + (rnd() - 0.5) * 0.08);
    const c = r(b.c, 4);
    const custo = c + cfg.frete;
    const v = r((custo + b.m + (rnd() - 0.5) * 0.3) / (1 - cfg.pct / 100), 2);
    const q = Math.round((b.q * (0.6 + rnd() * 0.8)) / 500) * 500;
    return { q, c, f: cfg.frete, tm: "p", t: cfg.pct, v };
  });
  hist.push({ id: "e" + n, nome: "Reajuste " + n, data: dia.toISOString().slice(0, 10), itens });
  dia = new Date(dia.getTime() + (14 + Math.floor(rnd() * 14)) * 864e5);
}

fs.writeFileSync(path.join(root, "data/historico.json"), JSON.stringify(hist, null, 1) + "\n");
fs.writeFileSync(path.join(root, "data/config.json"), JSON.stringify(cfg, null, 1) + "\n");
console.log(`Dados de exemplo gerados: ${hist.length} reajustes (fictícios).`);
