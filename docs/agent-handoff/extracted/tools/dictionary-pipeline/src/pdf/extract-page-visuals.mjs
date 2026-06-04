export function extractPageVisuals(pageEvidence) {
  const pageNumber = pageEvidence.page_number;
  const visuals = [];
  let index = 1;

  if (pageEvidence.operatorList?.fnArray?.some((fn) => String(fn).includes("Image"))) {
    visuals.push(visual(pageNumber, "image", index++, null, "Imagen detectada en la página.", ""));
  }

  for (const line of pageEvidence.lines ?? []) {
    if (/[|\t]/.test(line.text)) {
      visuals.push(visual(pageNumber, "table", index++, line.bbox ?? null, "Tabla detectable por estructura textual.", line.text));
    }
  }

  for (const item of pageEvidence.items ?? []) {
    if (item.height > 0 && item.height < 7) {
      visuals.push(visual(pageNumber, "small_text", index++, itemBbox(item), "Texto pequeño detectado.", item.str));
    }
    if (item.color) {
      visuals.push(visual(pageNumber, "colored_text", index++, itemBbox(item), "Texto con color detectado.", item.str));
    }
  }

  if (visuals.length === 0) {
    visuals.push(visual(pageNumber, "unknown", index, null, "Elemento visual detectado en la página.", ""));
  }

  return visuals;
}

function visual(pageNumber, visualType, index, bbox, description, associatedText) {
  return {
    uid: `visual-p${String(pageNumber).padStart(4, "0")}-${visualType}-${String(index).padStart(4, "0")}`,
    object_type: "visual_element",
    visual_type: visualType,
    source_page: pageNumber,
    bbox,
    description,
    associated_text: associatedText,
    requires_manual_review: false,
  };
}

function itemBbox(item) {
  return {
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
  };
}
