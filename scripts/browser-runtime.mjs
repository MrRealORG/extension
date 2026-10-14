// The npm-distributed headless browser makes tests usable in restricted Linux sandboxes.
// Its runtime libraries are unpacked into the OS temp directory, never the repository.
import chromium from "@sparticuz/chromium";
import { brotliDecompressSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const libs = join(tmpdir(), "dream-browser-libs");
if (
  process.platform === "linux" &&
  !existsSync(join(libs, "lib/libnspr4.so"))
) {
  const bin = require
    .resolve("@sparticuz/chromium")
    .replace(/build\/index.js$/, "bin/al2023.tar.br");
  mkdirSync(libs, { recursive: true });
  const archive = join(libs, "runtime.tar");
  writeFileSync(archive, brotliDecompressSync(readFileSync(bin)));
  execFileSync("tar", ["xf", archive, "-C", libs]);
}
export const launchOptions = {
  executablePath: await chromium.executablePath(),
  args: chromium.args.filter(
    (a) =>
      ![
        "--single-process",
        "--disable-web-security",
        "--allow-running-insecure-content",
      ].includes(a),
  ),
  env: {
    ...process.env,
    LD_LIBRARY_PATH: `${join(libs, "lib")}:${process.env.LD_LIBRARY_PATH || ""}`,
  },
};
