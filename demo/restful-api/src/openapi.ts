import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));

export function openApiDocument(): Record<string, unknown> {
  const specPath = resolve(here, "../openapi.yaml");
  return parseYaml(readFileSync(specPath, "utf8")) as Record<string, unknown>;
}
