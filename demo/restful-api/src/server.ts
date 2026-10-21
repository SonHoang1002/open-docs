import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`RESTful API demo đang chạy tại http://localhost:${port}`);
  console.log(`  Swagger UI : http://localhost:${port}/docs`);
  console.log(`  OpenAPI    : http://localhost:${port}/v1/openapi.json`);
  console.log(`  Products   : http://localhost:${port}/v1/products`);
});
