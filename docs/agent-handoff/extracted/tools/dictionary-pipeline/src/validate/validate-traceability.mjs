export function validateTraceability({ pages = [], derivedObjects = [], reviewObjects = [] }) {
  const errors = [];
  const pageByNumber = new Map(pages.map((page) => [page.pdf_page_number, page]));
  const blockById = new Map();
  const derivedByPage = new Map();

  for (const page of pages) {
    const pageDerived = new Set(page.derived_objects ?? []);
    derivedByPage.set(page.pdf_page_number, pageDerived);
    for (const block of page.blocks ?? []) {
      blockById.set(block.block_id, block);
    }
  }

  for (const object of derivedObjects) {
    validateObjectTrace(object, { pageByNumber, blockById, errors });
    const listed = derivedByPage.get(object.source_page);
    if (listed && !listed.has(object.uid)) {
      errors.push(`${object.path}: derived object ${object.uid} is not listed in page derived_objects.`);
    }
  }

  for (const object of reviewObjects) {
    validateObjectTrace(object, { pageByNumber, blockById, errors });
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function validateObjectTrace(object, context) {
  const { pageByNumber, blockById, errors } = context;
  const path = object.path ?? object.uid ?? "unknown";
  const page = pageByNumber.get(object.source_page);
  if (!page) {
    errors.push(`${path}: source_page does not exist: ${object.source_page}`);
    return;
  }

  for (const blockId of object.source_blocks ?? []) {
    const block = blockById.get(blockId);
    if (!block) {
      errors.push(`${path}: source_block does not exist: ${blockId}`);
      continue;
    }
    if (block.page_number !== object.source_page) {
      errors.push(`${path}: source_block ${blockId} belongs to page ${block.page_number}, not ${object.source_page}.`);
    }
  }
}
