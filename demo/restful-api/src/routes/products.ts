import { Router } from "express";
import {
  conflict,
  etagOf,
  matchEtag,
  methodNotAllowed,
  newProductId,
  notFound,
  preconditionFailed,
} from "../errors.ts";
import { store, type Product } from "../store.ts";
import { createBody, listQuery, patchBody, replaceBody, type ListQuery } from "../schemas/product.ts";
import { validateBody, validateQuery, validatedQuery } from "../middleware/validate.ts";
import { idempotency } from "../middleware/idempotency.ts";

export const productsRouter = Router();

interface Cursor {
  key: string;
  id: string;
}

function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

function decodeCursor(token: string): Cursor {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as Cursor;
    if (typeof parsed.key !== "string" || typeof parsed.id !== "string") throw new Error("bad");
    return parsed;
  } catch {
    throw Object.assign(new Error("invalid cursor"), {
      status: 400,
      type: "https://api.example.com/errors/invalid-cursor",
      title: "Bad Request",
      detail: "Cursor không hợp lệ.",
    });
  }
}

function sortValue(p: Product, field: string): string | number {
  if (field === "name") return p.name.toLowerCase();
  if (field === "price") return p.price;
  return p.created_at;
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function listProducts(q: ListQuery): { items: Product[]; next: string | null; hasMore: boolean } {
  const desc = q.sort.startsWith("-");
  const field = desc ? q.sort.slice(1) : q.sort;

  let items = store.all().slice();
  if (q.status) items = items.filter((p) => p.status === q.status);
  if (q.q) {
    const needle = q.q.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(needle));
  }

  items.sort((a, b) => {
    const cmp = compare(sortValue(a, field), sortValue(b, field));
    const dir = desc ? -cmp : cmp;
    return dir !== 0 ? dir : a.id.localeCompare(b.id); // tie-breaker ổn định
  });

  if (q.cursor) {
    const cur = decodeCursor(q.cursor);
    items = items.filter((p) => {
      const cmp = compare(sortValue(p, field), cur.key);
      return desc ? cmp < 0 : cmp > 0;
    });
  }

  const hasMore = items.length > q.limit;
  const page = items.slice(0, q.limit);
  const last = page.at(-1);
  const next = hasMore && last ? encodeCursor({ key: String(sortValue(last, field)), id: last.id }) : null;
  return { items: page, next, hasMore };
}

productsRouter.get("/", validateQuery(listQuery), (req, res) => {
  const q = validatedQuery<ListQuery>(req);
  const { items, next, hasMore } = listProducts(q);
  res.status(200).json({
    data: items,
    pagination: { limit: q.limit, next_cursor: next, has_more: hasMore },
  });
});

productsRouter.post("/", idempotency, validateBody(createBody), (req, res) => {
  const body = req.body as ReturnType<typeof createBody.parse>;
  const id = body.id ?? newProductId();
  if (store.get(id)) throw conflict(`Product '${id}' đã tồn tại.`, "duplicate_id");
  const now = new Date().toISOString();
  const product: Product = {
    id,
    name: body.name,
    status: body.status,
    price: body.price,
    tags: body.tags,
    created_at: now,
    updated_at: now,
  };
  store.insert(product);
  res.setHeader("Location", `/v1/products/${product.id}`);
  res.setHeader("ETag", etagOf(product));
  res.status(201).json(product);
});

productsRouter.get("/:id", (req, res) => {
  const product = store.get(req.params.id);
  if (!product) throw notFound(req.params.id);
  const etag = etagOf(product);
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "private, max-age=60");

  const inm = req.header("if-none-match");
  if (matchEtag(inm, etag)) {
    res.status(304).end();
    return;
  }
  res.status(200).json(product);
});

productsRouter.put("/:id", validateBody(replaceBody), (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) throw notFound(req.params.id);
  if (!matchEtag(req.header("if-match"), etagOf(existing))) {
    throw preconditionFailed(etagOf(existing));
  }
  const body = req.body as ReturnType<typeof replaceBody.parse>;
  const next: Product = {
    ...existing,
    name: body.name,
    status: body.status,
    price: body.price,
    tags: body.tags,
    updated_at: new Date().toISOString(),
  };
  store.replace(existing.id, next);
  res.setHeader("ETag", etagOf(next));
  res.status(200).json(next);
});

productsRouter.patch("/:id", validateBody(patchBody), (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) throw notFound(req.params.id);
  if (!matchEtag(req.header("if-match"), etagOf(existing))) {
    throw preconditionFailed(etagOf(existing));
  }
  const body = req.body as ReturnType<typeof patchBody.parse>;
  const next: Product = { ...existing };
  if (body.name != null) next.name = body.name;
  if (body.status != null) next.status = body.status;
  if (body.price != null) next.price = body.price;
  if (body.tags != null) next.tags = body.tags;
  next.updated_at = new Date().toISOString();
  store.replace(existing.id, next);
  res.setHeader("ETag", etagOf(next));
  res.status(200).json(next);
});

productsRouter.delete("/:id", (req, res) => {
  const existing = store.get(req.params.id);
  if (!existing) throw notFound(req.params.id);
  store.remove(existing.id);
  res.status(204).end();
});

productsRouter.all("/:id", (_req, res) => {
  res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
  throw methodNotAllowed("GET, PUT, PATCH, DELETE");
});
