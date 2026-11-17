// Gera os ícones do app em icons/ (PNG sem dependências + SVG).
// Desenho: gota de combustível laranja com uma linha de tendência, sobre fundo escuro.
// Uso: node scripts/gerar-icones.js
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const out = path.join(__dirname, "..", "icons");
fs.mkdirSync(out, { recursive: true });

const BG = [0x18, 0x22, 0x2b], DROP = [0xeb, 0x68, 0x34], LINE = [0xff, 0xff, 0xff];
// Geometria em coordenadas 0..100 (a mesma do SVG)
const C = { x: 50, y: 58, r: 20 }, T = { x: 50, y: 22 };
const phi = Math.acos(C.r / (C.y - T.y));
const P1 = { x: C.x - C.r * Math.sin(phi), y: C.y - C.r * Math.cos(phi) };
const P2 = { x: C.x + C.r * Math.sin(phi), y: C.y - C.r * Math.cos(phi) };
const TREND = [[38, 66], [45.5, 58.5], [52.5, 63], [62, 51]], LW = 3.4;

const sign = (a, b, c) => (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
function inTri(p) { const d1 = sign(p, T, P1), d2 = sign(p, P1, P2), d3 = sign(p, P2, T); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); }
const inDrop = p => (p.x - C.x) ** 2 + (p.y - C.y) ** 2 <= C.r ** 2 || inTri(p);
function distSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy);
}
const inLine = p => TREND.slice(1).some((b, i) => distSeg(p, TREND[i], b) <= LW / 2);
// Fundo: maskable/apple = quadrado cheio; "any" = quadrado arredondado
function inBg(p, round) {
  if (!round) return true;
  const R = 22, qx = Math.max(Math.abs(p.x - 50) - (50 - R), 0), qy = Math.max(Math.abs(p.y - 50) - (50 - R), 0);
  return Math.hypot(qx, qy) <= R;
}

function render(size, { round = false, scale = 1 } = {}) {
  const S = 6, px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const u = ((x + (sx + 0.5) / S) / size) * 100, v = ((y + (sy + 0.5) / S) / size) * 100;
      if (!inBg({ x: u, y: v }, round)) continue;
      const q = { x: 50 + (u - 50) / scale, y: 50 + (v - 50) / scale };
      const c = inDrop(q) ? (inLine(q) ? LINE : DROP) : BG;
      r += c[0]; g += c[1]; b += c[2]; a++;
    }
    const i = (y * size + x) * 4;
    if (a) { px[i] = r / a; px[i + 1] = g / a; px[i + 2] = b / a; }
    px[i + 3] = Math.round((a / (S * S)) * 255);
  }
  return png(size, px);
}

const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buf => { let c = 0xffffffff; for (const x of buf) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(size, px) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const f = n => +n.toFixed(2);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#18222b"/><path d="M${T.x} ${T.y}L${f(P2.x)} ${f(P2.y)}A${C.r} ${C.r} 0 1 1 ${f(P1.x)} ${f(P1.y)}Z" fill="#eb6834"/><polyline points="${TREND.map(p => p.join(",")).join(" ")}" fill="none" stroke="#fff" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;

const arquivos = {
  "icon.svg": Buffer.from(svg),
  "icon-192.png": render(192, { round: true }),
  "icon-512.png": render(512, { round: true }),
  "icon-maskable-512.png": render(512, { scale: 0.85 }),
  "apple-touch-icon.png": render(180),
  "favicon-32.png": render(32, { round: true })
};
for (const [nome, buf] of Object.entries(arquivos)) fs.writeFileSync(path.join(out, nome), buf);
console.log("Ícones gerados:", Object.entries(arquivos).map(([n, b]) => `${n} (${(b.length / 1024).toFixed(1)} KB)`).join(", "));
