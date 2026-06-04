import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export function sha256Text(text) {
  return createHash("sha256").update(text).digest("hex");
}

export async function sha256File(pathToRead) {
  return createHash("sha256").update(await readFile(pathToRead)).digest("hex");
}
