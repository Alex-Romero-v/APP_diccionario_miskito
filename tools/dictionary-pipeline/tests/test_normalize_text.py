from src.normalize_text import normalize_for_search

def test_normalize_basic():
    assert normalize_for_search("BÎLA") == "bila"
    assert normalize_for_search(" Gâd ") == "gad"
    assert normalize_for_search("ÂISA") == "aisa"
    assert normalize_for_search("bîla.") == "bila"
    assert normalize_for_search("aisa-yapti") == "aisa-yapti"

