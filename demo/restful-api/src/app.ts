import express from "express";
import { cors, rateLimit, requestId } from "./middleware/common.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";
import { productsRouter } from "./routes/products.ts";
import { openApiDocument } from "./openapi.ts";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestId);
  app.use(cors);
  app.use(express.json({ limit: "100kb", type: ["application/json", "application/merge-patch+json"] }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const v1 = express.Router();
  v1.use(rateLimit);
  v1.get("/openapi.json", (_req, res) => res.status(200).json(openApiDocument()));
  v1.use("/products", productsRouter);
  app.use("/v1", v1);

  app.get("/docs", (_req, res) => {
    res
      .status(200)
      .type("text/html")
      .send(`<!doctype html><html><head><meta charset="utf-8"/>
<title>Wedding API — Docs</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
</head><body><div id="swagger"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>window.onload=()=>SwaggerUIBundle({url:"/v1/openapi.json",dom_id:"#swagger"});</script>
</body></html>`);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
