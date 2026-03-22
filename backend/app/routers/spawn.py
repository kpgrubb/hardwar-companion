from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["spawn"])


class SpawnCheckRequest(BaseModel):
    turn: int
    ai_fc_spent: int
    ai_fc_total: int


class SpawnResolveRequest(BaseModel):
    class_roll: int
    player_d_stat: int
    trigger_element: str = ""


class StrategicAssetRequest(BaseModel):
    ai_interference_pool: int


@router.post("/spawn/check")
async def spawn_check(request: SpawnCheckRequest):
    # Placeholder — Phase 4 implementation
    return {"triggered": False, "roll": 0, "total": 0, "reason": "Spawn engine not yet implemented."}


@router.post("/spawn/resolve")
async def spawn_resolve(request: SpawnResolveRequest):
    # Placeholder — Phase 4 implementation
    return {"error": "Spawn engine not yet implemented."}


@router.post("/spawn/strategic-asset")
async def strategic_asset(request: StrategicAssetRequest):
    # Placeholder — Phase 4 implementation
    return {"error": "Spawn engine not yet implemented."}
