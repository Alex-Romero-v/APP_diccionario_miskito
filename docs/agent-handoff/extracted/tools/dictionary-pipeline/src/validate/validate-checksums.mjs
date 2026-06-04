export function validateChecksums(checksums, expectedPaths) {
  const errors = [];
  for (const path of expectedPaths) {
    if (!(path in checksums)) errors.push(`Missing checksum path: ${path}`);
  }
  for (const [path, hash] of Object.entries(checksums)) {
    if (!/^[a-f0-9]{64}$/.test(hash)) errors.push(`Invalid SHA-256 for ${path}`);
  }
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
