export function linkContinuations(previousPageBlocks, nextPageBlocks) {
  const previous = previousPageBlocks.at(-1);
  const next = nextPageBlocks.find((block) => block.block_type === "entry_continuation");

  if (!previous || !next) {
    return [previous, next];
  }

  return [
    { ...previous, continued_to: next.block_id },
    { ...next, continued_from: previous.block_id },
  ];
}
