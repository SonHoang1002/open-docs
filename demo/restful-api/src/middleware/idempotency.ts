import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { idempotencyKeyReused } from "../errors.ts";

interface Entry {
  fingerprint: string;
  status: number;
  body: unknown;
  headers: Record<string, string>;
  expiresAt: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const store = new Map<string, Entry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) if (entry.expiresAt <= now) store.delete(key);
}, 10 * 60 * 1000).unref();

function fingerprint(req: Request): string {
  return crypto
    .createHash("sha256")
    .update(`${req.method} ${req.originalUrl} ${JSON.stringify(req.body ?? null)}`)
    .digest("hex");
}

export function idempotency(req: Request, res: Response, next: NextFunction): void {
  const key = req.header("idempotency-key");
  if (!key) {
    next();
    return;
  }
  if (!/^[A-Za-z0-9_-]{8,255}$/.test(key)) {
    next(Object.assign(new Error("bad idempotency key"), { status: 400 }));
    return;
  }

  const fp = fingerprint(req);
  const existing = store.get(key);
  if (existing) {
    if (existing.fingerprint !== fp) {
      next(idempotencyKeyReused());
      return;
    }
    res.setHeader("Idempotent-Replayed", "true");
    for (const [k, v] of Object.entries(existing.headers)) res.setHeader(k, v);
    res.status(existing.status).json(existing.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown): Response => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      store.set(key, {
        fingerprint: fp,
        status: res.statusCode,
        body,
        headers: {
          ...(res.getHeader("location") ? { Location: String(res.getHeader("location")) } : {}),
          ...(res.getHeader("etag") ? { ETag: String(res.getHeader("etag")) } : {}),
        },
        expiresAt: Date.now() + TTL_MS,
      });
    }
    return originalJson(body);
  };
  next();
}
