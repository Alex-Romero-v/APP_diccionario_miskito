const uidPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const timestampPattern = /\d{4}-\d{2}-\d{2}T|\d{13,}/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUids(items) {
  const errors = [];
  const seen = new Map();

  for (const item of items) {
    const uid = item.uid;
    const path = item.path ?? "unknown";

    if (typeof uid !== "string" || !uidPattern.test(uid)) errors.push(`${path}: invalid UID: ${uid}`);
    if (typeof uid === "string" && timestampPattern.test(uid)) errors.push(`${path}: UID contains timestamp: ${uid}`);
    if (typeof uid === "string" && uuidPattern.test(uid)) errors.push(`${path}: UID has random UUID form: ${uid}`);
    if (seen.has(uid)) {
      errors.push(`${path}: duplicate UID ${uid}; first seen at ${seen.get(uid)}`);
    } else {
      seen.set(uid, path);
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
