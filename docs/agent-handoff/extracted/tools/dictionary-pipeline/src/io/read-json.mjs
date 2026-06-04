import { readFile } from "node:fs/promises";

export async function readJson(pathToRead) {
  return JSON.parse(await readFile(pathToRead, "utf8"));
}
