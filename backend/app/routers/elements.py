import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query

router = APIRouter(tags=["elements"])

DATA_PATH = Path(__file__).parent.parent / "data" / "elements.json"


def _load_elements() -> list[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/elements")
async def get_elements(
    element_class: Optional[int] = Query(None, alias="class"),
    motive_type: Optional[str] = None,
    faction: Optional[str] = None,
):
    elements = _load_elements()
    if element_class is not None:
        elements = [e for e in elements if e.get("class") == element_class]
    if motive_type:
        elements = [e for e in elements if e.get("motive_type", "").lower() == motive_type.lower()]
    if faction:
        elements = [e for e in elements if faction.lower() in e.get("faction", "").lower()]
    return elements


@router.get("/elements/{element_id}")
async def get_element(element_id: str):
    elements = _load_elements()
    for e in elements:
        if e.get("id") == element_id:
            return e
    return {"error": "Element not found"}
