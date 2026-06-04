import { mkdir } from "node:fs/promises";

export async function ensureDirectories(directories) {
  const uniqueDirectories = [...new Set(directories.filter(Boolean).map(String))].sort();

  for (const directory of uniqueDirectories) {
    await mkdir(directory, { recursive: true });
  }
}
