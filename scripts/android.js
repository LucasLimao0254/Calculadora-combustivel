// Roda o Bubblewrap dentro de android/, com a pasta android/ no PATH.
// Motivo: no Windows o Bubblewrap chama "gradlew.bat" pelo nome. Com a proteção
// NoDefaultCurrentDirectoryInExePath ativa, o cmd não procura programas na pasta atual
// e o build falha com "'gradlew.bat' não é reconhecido". Pôr a pasta no PATH resolve
// sem desligar a proteção.
// Uso: node scripts/android.js <comando do bubblewrap> [opções]
//      ex.: node scripts/android.js build
const { spawn } = require("child_process");
const path = require("path");

const dir = path.join(__dirname, "..", "android");
const env = { ...process.env };
const chave = Object.keys(env).find(k => k.toUpperCase() === "PATH") || "PATH";
env[chave] = dir + path.delimiter + (env[chave] || "");

const args = ["--yes", "@bubblewrap/cli@1.27.0", ...process.argv.slice(2)];
const p = spawn(process.platform === "win32" ? "npx.cmd" : "npx", args, { cwd: dir, env, stdio: "inherit", shell: process.platform === "win32" });
p.on("exit", code => process.exit(code ?? 1));
