// scripts/generate-ok.mjs
// Writes a simple build stamp the UI can't fake.
import { promises as fs } from "fs";
import path from "path";

const outDir = path.resolve("assets");
await fs.mkdir(outDir, { recursive: true });

const stamp = {
  ok: true,
  app: "VIPSpot 2025",
  generatedAt: new Date().toISOString(),
};

const outFile = path.join(outDir, "ok.json");
await fs.writeFile(outFile, JSON.stringify(stamp, null, 2), "utf8");
console.log("✅ Wrote", path.relative(process.cwd(), outFile));