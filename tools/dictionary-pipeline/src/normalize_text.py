import re

def normalize_for_search(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = text.replace("â", "a")
    text = text.replace("ê", "e")
    text = text.replace("î", "i")
    text = text.replace("ô", "o")
    text = text.replace("û", "u")
    text = text.replace("á", "a")
    text = text.replace("é", "e")
    text = text.replace("í", "i")
    text = text.replace("ó", "o")
    text = text.replace("ú", "u")
    text = re.sub(r'[^a-z0-9\- ]', '', text)
    return text

