import { resolve, relative, sep } from "node:path";

const projectRoot = resolve(".");

const allowedDirectoryPrefixes = [
  "tools/dictionary-pipeline/intermediate",
  "tools/dictionary-pipeline/reports",
  "tools/dictionary-pipeline/src",
  "tools/dictionary-pipeline/tests",
];

const allowedFiles = new Set([
  "package.json",
  "package-lock.json",
  "TASKS.md",
  "TASKS.txt",
]);

export function isWritePathAllowed(pathToCheck) {
  const relativePath = toProjectRelativePath(pathToCheck);

  if (allowedFiles.has(relativePath)) {
    return true;
  }

  return allowedDirectoryPrefixes.some(
    (prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`),
  );
}

export function toProjectRelativePath(pathToNormalize) {
  return relative(projectRoot, resolve(projectRoot, pathToNormalize))
    .split(sep)
    .join("/");
}
