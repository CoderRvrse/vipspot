// Cross-platform "open http://localhost:8000" with a lock so it opens once per run.
// Set VIP_ALWAYS_OPEN=1 to force opening every time.
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

const URL = process.env.VIP_ORIGIN || "http://localhost:8000";
const lock = path.join(os.tmpdir(), "vipspot-open.lock");

// Open only once per session unless VIP_ALWAYS_OPEN=1
const shouldOpen = process.env.VIP_ALWAYS_OPEN === "1";
try {
  if (!shouldOpen) {
    await fs.access(lock); // exists -> skip opening
    process.exit(0);
  }
} catch {
  await fs.writeFile(lock, String(Date.now()));
}

const cmd =
  process.platform === "win32" ? `start "" "${URL}"`
: process.platform === "darwin" ? `open "${URL}"`
: /* linux */                      `xdg-open "${URL}"`;

exec(cmd, (err) => {
  if (err) console.error("Failed to open browser:", err.message);
});