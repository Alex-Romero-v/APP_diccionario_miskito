import { BLOCK_TOKENS } from "../config/constants.mjs";

const prohibitedCommands = new Set(["python", "python3", "pip", "poetry", "conda"]);

export function assertNoPythonUsage(commandSources) {
  const commands = flattenCommandSources(commandSources);

  for (const command of commands) {
    for (const token of tokenize(command)) {
      if (prohibitedCommands.has(token.toLowerCase())) {
        throw new Error(BLOCK_TOKENS.forbiddenPython);
      }
    }
  }
}

function flattenCommandSources(commandSources) {
  if (commandSources == null) {
    return [];
  }

  if (typeof commandSources === "string") {
    return [commandSources];
  }

  if (Array.isArray(commandSources)) {
    return commandSources.flatMap(flattenCommandSources);
  }

  if (typeof commandSources === "object") {
    return Object.values(commandSources).flatMap(flattenCommandSources);
  }

  return [];
}

function tokenize(command) {
  return String(command).match(/[A-Za-z0-9_.-]+/g) ?? [];
}
