import { BLOCK_TOKENS } from "../config/constants.mjs";

export function assertNodeRuntime(runtime = process) {
  if (!runtime?.versions?.node) {
    throw new Error(BLOCK_TOKENS.nodeUnavailable);
  }
}
