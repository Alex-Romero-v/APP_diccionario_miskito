import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function listFilesDeterministic(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b, "en"));
}
