import { BLOCK_TOKENS } from "../config/constants.mjs";

const networkEnvKeys = new Set([
  "TRANSCRIPTION_NETWORK_ALLOWED",
  "ALLOW_NETWORK",
  "NETWORK_ALLOWED",
]);

const networkCommandPatterns = [
  /(^|\s)--network(\s|$)/i,
  /(^|\s)--allow-network(\s|$)/i,
  /\bhttps?:\/\//i,
];

export function assertNoNetwork({ env = process.env, commands = [] } = {}) {
  for (const key of networkEnvKeys) {
    if (String(env?.[key] ?? "").toLowerCase() === "true") {
      throw new Error(BLOCK_TOKENS.forbiddenNetwork);
    }
  }

  for (const command of flattenCommands(commands)) {
    if (networkCommandPatterns.some((pattern) => pattern.test(command))) {
      throw new Error(BLOCK_TOKENS.forbiddenNetwork);
    }
  }
}

function flattenCommands(commands) {
  if (commands == null) {
    return [];
  }

  if (typeof commands === "string") {
    return [commands];
  }

  if (Array.isArray(commands)) {
    return commands.flatMap(flattenCommands);
  }

  if (typeof commands === "object") {
    return Object.values(commands).flatMap(flattenCommands);
  }

  return [];
}
