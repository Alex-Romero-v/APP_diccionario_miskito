export function validateJsonlText(text, path, options = {}) {
  const { allowEmptyReview = false } = options;
  const errors = [];

  if (text.length === 0) {
    if (allowEmptyReview && /review\/(?:needs_review|coverage_gaps|rejected_blocks)\.jsonl$/.test(path.replaceAll("\\", "/"))) {
      return { ok: true, records: [] };
    }
    return { ok: false, errors: [`${path}: empty JSONL is not allowed.`] };
  }

  const lines = text.split(/\r?\n/);
  const records = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const isLastTrailingLine = index === lines.length - 1 && line === "";
    if (isLastTrailingLine) continue;
    if (line.trim() === "") {
      errors.push(`${path}:${index + 1}: empty line in JSONL.`);
      continue;
    }
    try {
      records.push(JSON.parse(line));
    } catch (error) {
      errors.push(`${path}:${index + 1}: invalid JSONL: ${error.message}`);
    }
  }

  return errors.length === 0 ? { ok: true, records } : { ok: false, errors };
}
