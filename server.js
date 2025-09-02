import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const root = path.join(__dirname);

app.use(compression());

// Optional alias so /assets/me.png always works
app.get("/assets/me.png", (_req, res) => res.sendFile(path.join(root, "assets", "me-1024.png")));

app.use(express.static(root, {
  etag: true,
  lastModified: true,
  maxAge: "7d",
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
  }
}));

app.get("/", (_, res) => res.sendFile(path.join(root, "index.html")));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`VIPSpot static running on http://localhost:${port}`));