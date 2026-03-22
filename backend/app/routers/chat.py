from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag import chat as rag_chat

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    ruleset: str = "core"
    history: list[dict] = []


@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        result = await rag_chat(
            query=request.query,
            ruleset=request.ruleset,
            history=request.history,
        )
        return result
    except Exception as e:
        import traceback
        error_msg = str(e)
        tb = traceback.format_exc()
        print(f"Chat error: {error_msg}\n{tb}")
        if "not found" in error_msg.lower() or "does not exist" in error_msg.lower():
            return {
                "answer": "The rules database has not been initialized yet. Please run the ingestion pipeline first (see backend/scripts/).",
                "citations": [],
                "confidence": "LOW",
                "chunks_used": [],
            }
        raise HTTPException(status_code=500, detail=f"Chat error: {error_msg}")
