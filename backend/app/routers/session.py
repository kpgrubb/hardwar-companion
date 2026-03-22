from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["session"])


class SessionStartRequest(BaseModel):
    ruleset: str = "core"
    mode: str = "solo"
    mission_id: str = "M0"
    player_fc: int = 10
    roster: Optional[list] = None
    field_asset: Optional[str] = None


@router.post("/session/start")
async def start_session(request: SessionStartRequest):
    # Placeholder — Phase 4 implementation
    return {
        "id": "session-placeholder",
        "ruleset": request.ruleset,
        "mode": request.mode,
        "mission": request.mission_id,
        "turn": 1,
        "max_turns": 6,
        "player_fc": request.player_fc,
        "ai_fc_total": request.player_fc,
        "ai_fc_spent": 0,
        "ai_interference_pool": 5,
        "spotting_pool": [],
        "field_asset": request.field_asset,
        "player_vp": 0,
        "ai_vp": 0,
        "player_bp": request.player_fc // 5,
        "roster": [],
        "log": [],
    }
