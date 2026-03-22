import uuid

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.spawn_engine import get_ai_fc_for_mission

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
    """
    Start a new solo/co-op session.

    Computes the AI Force Composition budget from the mission table
    and initialises all session-level counters.
    """
    ai_fc_total = get_ai_fc_for_mission(request.mission_id)

    # AI interference pool scales with FC budget
    # Base 5 tokens, +1 per 30 FC above 100
    base_pool = 5
    bonus = max(0, (ai_fc_total - 100)) // 30
    ai_interference_pool = base_pool + bonus

    session_id = str(uuid.uuid4())

    return {
        "id": session_id,
        "ruleset": request.ruleset,
        "mode": request.mode,
        "mission": request.mission_id,
        "turn": 1,
        "max_turns": 6,
        "player_fc": request.player_fc,
        "ai_fc_total": ai_fc_total,
        "ai_fc_spent": 0,
        "ai_interference_pool": ai_interference_pool,
        "spotting_pool": [],
        "field_asset": request.field_asset,
        "player_vp": 0,
        "ai_vp": 0,
        "player_bp": request.player_fc // 5,
        "roster": request.roster or [],
        "log": [
            f"Session started: mission {request.mission_id}, "
            f"AI FC budget {ai_fc_total}, "
            f"interference pool {ai_interference_pool}."
        ],
    }
