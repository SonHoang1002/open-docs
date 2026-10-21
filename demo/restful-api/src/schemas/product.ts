import { z } from "zod";

export const statusEnum = z.enum(["draft", "active", "archived"]);

const idPattern = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]{2,63}$/, "ID phải lower-case, 3-64 ký tự [a-z0-9_-]");

export const createBody = z.object({
  id: idPattern.optional(),
  name: z.string().min(1).max(200),
  status: statusEnum.default("draft"),
  price: z.number().int().min(0).max(1_000_000_000),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
});

export const replaceBody = z.object({
  name: z.string().min(1).max(200),
  status: statusEnum,
  price: z.number().int().min(0).max(1_000_000_000),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
});

export const patchBody = z.object({
  name: z.string().min(1).max(200).nullish(),
  status: statusEnum.nullish(),
  price: z.number().int().min(0).max(1_000_000_000).nullish(),
  tags: z.array(z.string().min(1).max(40)).max(20).nullish(),
});

export const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(512).optional(),
  status: statusEnum.optional(),
  q: z.string().max(80).optional(),
  sort: z.enum(["created_at", "-created_at", "price", "-price", "name", "-name"]).default("-created_at"),
});

export type CreateBody = z.infer<typeof createBody>;
export type ReplaceBody = z.infer<typeof replaceBody>;
export type PatchBody = z.infer<typeof patchBody>;
export type ListQuery = z.infer<typeof listQuery>;
