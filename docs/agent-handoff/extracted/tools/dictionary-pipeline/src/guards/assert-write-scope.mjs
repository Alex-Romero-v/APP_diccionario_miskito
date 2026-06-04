import { BLOCK_TOKENS } from "../config/constants.mjs";
import { isWritePathAllowed } from "../config/allowed-paths.mjs";

export function assertWriteScope(pathsToWrite) {
  const paths = Array.isArray(pathsToWrite) ? pathsToWrite : [pathsToWrite];

  for (const pathToWrite of paths.filter(Boolean)) {
    if (!isWritePathAllowed(pathToWrite)) {
      throw new Error(BLOCK_TOKENS.writeScopeViolation);
    }
  }
}
