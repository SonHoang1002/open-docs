import crypto from "node:crypto";
import type { Product, ProductStatus } from "./store.ts";

export const PRODUCT_STATUSES: ProductStatus[] = ["draft", "active", "archived"];

export class ApiError extends Error {
  status: number;
  type: string;
  title: string;
  detail: string;
  extra: Record<string, unknown>;

  constructor(
    status: number,
    type: string,
    title: string,
    detail: string,
    extra: Record<string, unknown> = {},
  ) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
    this.detail = detail;
    this.extra = extra;
  }
}

export function notFound(id: string): ApiError {
  return new ApiError(
    404,
    "https://api.example.com/errors/not-found",
    "Not Found",
    `Product '${id}' không tồn tại.`,
    { errors: [{ field: "id", code: "not_found", message: "Resource không tồn tại" }] },
  );
}

export function validationFailed(detail: string, errors: unknown[]): ApiError {
  return new ApiError(
    400,
    "https://api.example.com/errors/validation-failed",
    "Validation Failed",
    detail,
    { errors },
  );
}

export function conflict(detail: string, code: string): ApiError {
  return new ApiError(409, "https://api.example.com/errors/conflict", "Conflict", detail, {
    errors: [{ field: "id", code, message: detail }],
  });
}

export function preconditionFailed(currentEtag: string): ApiError {
  return new ApiError(
    412,
    "https://api.example.com/errors/precondition-failed",
    "Precondition Failed",
    "If-Match không khớp với ETag hiện tại của resource (bản ghi đã bị thay đổi).",
    { current_etag: currentEtag },
  );
}

export function idempotencyKeyReused(): ApiError {
  return new ApiError(
    422,
    "https://api.example.com/errors/idempotency-key-reused",
    "Idempotency Key Reused",
    "Idempotency-Key đã được dùng với payload khác. Dùng key mới cho nghiệp vụ mới.",
    { errors: [{ field: "Idempotency-Key", code: "idempotency_key_reused", message: "Key không khớp fingerprint đã lưu" }] },
  );
}

export function methodNotAllowed(allow: string): ApiError {
  return new ApiError(
    405,
    "https://api.example.com/errors/method-not-allowed",
    "Method Not Allowed",
    `Resource không hỗ trợ method này. Xem header Allow: ${allow}`,
    { allow },
  );
}

export function payloadTooLarge(max: number): ApiError {
  return new ApiError(
    413,
    "https://api.example.com/errors/payload-too-large",
    "Payload Too Large",
    `Body vượt giới hạn ${max} bytes.`,
    {},
  );
}

export function tooManyRequests(retryAfterSeconds: number): ApiError {
  return new ApiError(
    429,
    "https://api.example.com/errors/rate-limited",
    "Too Many Requests",
    `Vượt quá rate limit. Thử lại sau ${retryAfterSeconds}s.`,
    { retry_after: retryAfterSeconds },
  );
}

export function etagOf(product: Product): string {
  const hash = crypto.createHash("sha1").update(JSON.stringify(product)).digest("hex");
  return `"${hash}"`;
}

export function matchEtag(header: string | undefined, current: string): boolean {
  if (!header) return false;
  if (header.trim() === "*") return true;
  return header
    .split(",")
    .map((v) => v.trim().replace(/^W\//, ""))
    .includes(current);
}

export function newProductId(): string {
  return `prd_${crypto.randomBytes(8).toString("hex")}`;
}
