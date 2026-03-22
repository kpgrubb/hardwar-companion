import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(tags=["keywords"])

DATA_PATH = Path(__file__).parent.parent / "data" / "keywords.json"


def _load_keywords() -> list[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/keywords/{term}")
async def get_keyword(term: str):
    keywords = _load_keywords()
    term_lower = term.lower()
    for kw in keywords:
        if kw.get("term", "").lower() == term_lower:
            return kw
        if term_lower in [a.lower() for a in kw.get("aliases", [])]:
            return kw
    return {"error": "Keyword not found"}
