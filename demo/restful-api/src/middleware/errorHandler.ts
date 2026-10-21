import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors.ts";

type RateErr = Error & { status?: number; retryAfter?: number };

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).type("application/problem+json").json({
    type: "https://api.example.com/errors/not-found",
    title: "Not Found",
    status: 404,
    detail: "Endpoint không tồn tại.",
    instance: _req.originalUrl,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let status = 500;
  let type = "https://api.example.com/errors/internal";
  let title = "Internal Server Error";
  let detail = "Đã xảy ra lỗi không mong đợi. Vui lòng liên hệ support kèm X-Request-Id.";
  let extra: Record<string, unknown> = {};

  if (err instanceof ApiError) {
    ({ status, type, title, detail, extra } = err);
  } else if ((err as RateErr)?.status === 429) {
    status = 429;
    type = "https://api.example.com/errors/rate-limited";
    title = "Too Many Requests";
    detail = "Vượt quá rate limit. Thử lại sau.";
    extra = { errors: [{ code: "rate_limited", message: detail }] };
  } else if ((err as { type?: string })?.type === "entity.parse.failed") {
    status = 400;
    type = "https://api.example.com/errors/malformed-json";
    title = "Bad Request";
    detail = "JSON body không hợp lệ (không parse được).";
    extra = { errors: [{ code: "malformed_json", message: detail }] };
  } else if ((err as { type?: string })?.type === "entity.too.large") {
    status = 413;
    type = "https://api.example.com/errors/payload-too-large";
    title = "Payload Too Large";
    detail = "Body vượt giới hạn cho phép.";
    extra = { errors: [{ code: "payload_too_large", message: detail }] };
  }

  // Log server-side, KHÔNG trả stack ra client.
  if (status >= 500) {
    console.error(`[500] rid=${req.id} ${req.method} ${req.originalUrl}`, err);
  }

  res
    .status(status)
    .type("application/problem+json")
    .json({ type, title, status, detail, instance: req.originalUrl, ...extra });
}
