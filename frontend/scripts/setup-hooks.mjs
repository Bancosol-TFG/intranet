import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryDirectory = resolve(frontendDirectory, "..");
const gitDirectory = resolve(repositoryDirectory, ".git");
const huskyCli = resolve(frontendDirectory, "node_modules/husky/bin.js");

if (process.env.HUSKY === "0" || !existsSync(gitDirectory) || !existsSync(huskyCli)) {
  process.exit(0);
}

const result = spawnSync(process.execPath, [huskyCli, "frontend/.husky"], {
  cwd: repositoryDirectory,
  stdio: "inherit",
});

if (result.error) {
  console.error("No se pudo configurar Husky:", result.error.message);
  process.exitCode = 1;
} else if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
}
