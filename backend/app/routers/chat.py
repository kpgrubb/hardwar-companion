from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    ruleset: str = "core"
    history: list[dict] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    # Placeholder — Phase 3 implementation
    return {
        "answer": "Chat functionality will be available once the RAG pipeline is configured.",
        "citations": [],
        "confidence": "LOW",
        "chunks_used": [],
    }
