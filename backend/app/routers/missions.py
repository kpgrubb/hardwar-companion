import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(tags=["missions"])

DATA_PATH = Path(__file__).parent.parent / "data" / "missions.json"


def _load_missions() -> list[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/missions")
async def get_missions():
    return _load_missions()
