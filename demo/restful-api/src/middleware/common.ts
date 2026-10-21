import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

const SAFE_ID = /^[A-Za-z0-9_.-]{8,128}$/;

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  req.id = incoming && SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

const windowMs = 60_000;
const maxRequests = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const key = req.ip ?? "unknown";
  let bucket = hits.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    hits.set(key, bucket);
  }
  bucket.count += 1;
  const remaining = Math.max(0, maxRequests - bucket.count);
  const reset = Math.ceil(bucket.resetAt / 1000);
  res.setHeader("RateLimit-Limit", String(maxRequests));
  res.setHeader("RateLimit-Remaining", String(remaining));
  res.setHeader("RateLimit-Reset", String(reset));
  if (bucket.count > maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    next(Object.assign(new Error("rate limit"), { status: 429, retryAfter }));
    return;
  }
  next();
}

export function cors(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key, If-Match, If-None-Match, X-Request-Id");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "ETag, Location, X-Request-Id, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After");
  next();
}
