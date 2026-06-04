import json
from src.parse_entries import parse_entries_from_text

def test_parse_entries_basic():
    with open("tests/fixtures/sample_pages.txt", "r", encoding="utf-8") as f:
        text = f.read()
    
    entries = parse_entries_from_text(text)
    
    assert len(entries) == 3
    
    assert entries[0]["headword"] == "BÎLA"
    assert len(entries[0]["variants"]) == 1
    assert entries[0]["variants"][0] == {"type": "Alt:", "text": "bîla"}
    assert len(entries[0]["examples"]) == 1
    assert "bîla briaia" in entries[0]["examples"][0]["raw"]
    assert len(entries[0]["notes"]) == 1
    assert "Also implies voice" in entries[0]["notes"][0]["raw"]
    
    assert entries[1]["headword"] == "ÂISA"
    assert len(entries[1]["variants"]) == 1
    assert entries[1]["variants"][0] == {"type": "a/t:", "text": "ais"}
    assert len(entries[1]["examples"]) == 1
    
    assert entries[2]["headword"] == "GÂD"
    assert len(entries[2]["entry_references"]) == 1
    assert entries[2]["entry_references"][0] == {"type": "See also:", "text": "Dawan"}

