export function validateJsonText(text, path) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, errors: [`${path}: invalid JSON: ${error.message}`] };
  }
}
