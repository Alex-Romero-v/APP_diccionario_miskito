import { result, validateBaseDerivedObject } from "./common.mjs";

export function validateAppendixObject(value) {
  const base = validateBaseDerivedObject(value);
  return base.ok ? result([]) : base;
}
