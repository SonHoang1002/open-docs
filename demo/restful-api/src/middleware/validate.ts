import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { validationFailed } from "../errors.ts";

function zodErrors(err: { issues: { path: PropertyKey[]; code: string; message: string }[] }) {
  return err.issues.map((i) => ({
    field: i.path.map(String).join(".") || "(root)",
    code: i.code,
    message: i.message,
  }));
}

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(validationFailed("Body không hợp lệ.", zodErrors(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(validationFailed("Query parameters không hợp lệ.", zodErrors(result.error)));
      return;
    }
    (req as unknown as { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
}

export function validatedQuery<T>(req: Request): T {
  return (req as unknown as { validatedQuery: T }).validatedQuery;
}
