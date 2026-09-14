import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API 1: Health & Specs
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "QUẢN LÝ & SẢN XUẤT BIỂN TÊN ĐƯỜNG HẢI LĂNG",
      version: "V4.0",
      specs: {
        assembly: "530 × 300 mm",
        artwork: "500 × 300 mm",
        mountingTrim: "30 × 300 mm (KHÔNG IN)",
        ratio: "5 : 3",
      },
    });
  });

  // API 2: Server-side QC dimension validator
  app.post("/api/validate-artwork", (req, res) => {
    const { widthMm, heightMm, hasMountingTrim } = req.body || {};
    if (widthMm !== 500 || heightMm !== 300) {
      return res.status(400).json({
        valid: false,
        error: "SAI KÍCH THƯỚC ARTWORK. ARTWORK PHẢI LÀ 500 × 300 MM. 530 × 300 MM CHỈ LÀ KÍCH THƯỚC TỔNG THỂ SAU KHI LẮP NẸP.",
      });
    }
    if (hasMountingTrim) {
      return res.status(400).json({
        valid: false,
        error: "PHÁT HIỆN PHẦN NẸP LẮP ĐẶT TRONG FILE ARTWORK IN.",
      });
    }
    return res.json({ valid: true, message: "Kích thước artwork 500 × 300 mm chuẩn xác" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
