import argparse
import re
from typing import List, Dict, Any

def parse_entries_from_text(text: str) -> List[Dict[str, Any]]:
    entries = []
    current_page = None
    
    for line in text.splitlines():
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        page_match = re.match(r'^---\s*PAGE\s+(\d+)\s*---$', line_stripped)
        if page_match:
            current_page = int(page_match.group(1))
            continue
            
        # Try to match new entry
        match = re.match(r'^([^\(]+?)\s*\(\s*([^\)]+?)\s*\)\s*[-–—]\s*([^/]+?)\s*/\s*(.+)$', line_stripped)
        if match and not line.startswith(' '):
            headword = match.group(1).strip()
            pos = match.group(2).strip()
            english = match.group(3).strip()
            spanish = match.group(4).strip()
            
            entries.append({
                "headword": headword,
                "part_of_speech": pos,
                "english_translation": english,
                "spanish_translation": spanish,
                "source_page": current_page,
                "raw_text": line_stripped,
                "extraction_confidence": "HIGH",
                "variants": [],
                "examples": [],
                "notes": [],
                "entry_references": []
            })
            continue
            
        # Parse sub-elements
        if entries:
            last_entry = entries[-1]
            if line_stripped.startswith("a/t:") or line_stripped.startswith("fs/ea:") or line_stripped.startswith("Alt:"):
                prefix = line_stripped.split(":")[0] + ":"
                content = line_stripped[len(prefix):].strip()
                last_entry["variants"].append({"type": prefix, "text": content})
            elif line_stripped.startswith("See also:") or line_stripped.startswith("Ver también:") or line_stripped.startswith("see/ver:"):
                prefix = line_stripped.split(":")[0] + ":"
                content = line_stripped[len(prefix):].strip()
                last_entry["entry_references"].append({"type": prefix, "text": content})
            elif line_stripped.startswith("Note:") or line_stripped.startswith("Nota:") or line_stripped.startswith("Note") or line_stripped.startswith("Nota"):
                last_entry["notes"].append({"raw": line_stripped})
            elif line_stripped.startswith("Ex:") or line_stripped.startswith("Ej:") or line_stripped.startswith("Ex/Ej:") or line_stripped.startswith("ExEj:"):
                last_entry["examples"].append({"raw": line_stripped})
            else:
                last_entry["notes"].append({"raw": line_stripped}) # fallback
    
    return entries

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.parse_args()
