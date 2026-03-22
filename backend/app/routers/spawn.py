from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.spawn_engine import (
    spawn_check as engine_spawn_check,
    spawn_resolve as engine_spawn_resolve,
    resolve_strategic_asset as engine_resolve_strategic_asset,
)
from app.services.target_priority import resolve_target_priority
from app.services.ai_situations import get_ai_situation
from app.services.ew_resolver import resolve_solo_ew
from app.services.initiative import resolve_initiative

router = APIRouter(tags=["spawn"])


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class SpawnCheckRequest(BaseModel):
    turn: int
    ai_fc_spent: int
    ai_fc_total: int


class SpawnResolveRequest(BaseModel):
    player_d_stat: int = 1
    ai_fc_spent: int = 0
    ai_fc_total: int = 100
    ai_interference_pool: int = 5
    trigger_element: str = ""


class StrategicAssetRequest(BaseModel):
    ai_interference_pool: int


class TargetPriorityRequest(BaseModel):
    trigger_element: str = ""
    ai_class: int = 1


class AISituationRequest(BaseModel):
    has_los: bool
    distance: float


class EWResolveRequest(BaseModel):
    ai_interference_pool: int


class InitiativeRequest(BaseModel):
    mode: str = "solo"
    ruleset: str = "core"
    player_tokens: int = 0
    ai_tokens: int = 0


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/spawn/check")
async def spawn_check(request: SpawnCheckRequest):
    """Roll spawn check: D12 + turn >= threshold."""
    return engine_spawn_check(
        turn=request.turn,
        ai_fc_spent=request.ai_fc_spent,
        ai_fc_total=request.ai_fc_total,
    )


@router.post("/spawn/resolve")
async def spawn_resolve(request: SpawnResolveRequest):
    """Full spawn cascade: class -> subtable -> spotting -> direction."""
    session_state = {
        "player_d_stat": request.player_d_stat,
        "ai_fc_spent": request.ai_fc_spent,
        "ai_fc_total": request.ai_fc_total,
        "ai_interference_pool": request.ai_interference_pool,
        "trigger_element": request.trigger_element,
    }
    return engine_spawn_resolve(session_state)


@router.post("/spawn/strategic-asset")
async def strategic_asset(request: StrategicAssetRequest):
    """Resolve a strategic asset from the asset table."""
    return engine_resolve_strategic_asset(request.ai_interference_pool)


@router.post("/spawn/target-priority")
async def target_priority(request: TargetPriorityRequest):
    """Resolve AI target priority chain."""
    return resolve_target_priority(
        trigger_element=request.trigger_element,
        ai_class=request.ai_class,
    )


@router.post("/spawn/ai-situation")
async def ai_situation(request: AISituationRequest):
    """Get AI behaviour branch for LoS/distance."""
    return get_ai_situation(
        has_los=request.has_los,
        distance=request.distance,
    )


@router.post("/spawn/ew-resolve")
async def ew_resolve(request: EWResolveRequest):
    """Solo/Co-op EW token resolution."""
    return resolve_solo_ew(request.ai_interference_pool)


@router.post("/spawn/initiative")
async def initiative(request: InitiativeRequest):
    """Resolve initiative for the current turn."""
    return resolve_initiative(
        mode=request.mode,
        ruleset=request.ruleset,
        player_tokens=request.player_tokens,
        ai_tokens=request.ai_tokens,
    )
