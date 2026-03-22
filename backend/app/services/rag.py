import re
import google.generativeai as genai
import chromadb
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)

# ChromaDB client (lazy init)
_chroma_client = None
_collection = None


def _get_collection():
    global _chroma_client, _collection
    if _collection is None:
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        _collection = _chroma_client.get_collection("hardwar_rules")
    return _collection


SYSTEM_PROMPT = """You are an authoritative rules referee for HARDWAR, the 6mm sci-fi tactical miniatures wargame (Modiphius Entertainment, Kickstarter edition).

Active ruleset: {ruleset}

Rules context (retrieved from official rulebook):
{chunks}

Instructions:
- Answer ONLY from the provided rules context.
- Cite every rule claim with (p.XX) referencing the page number.
- If the context does not contain the answer, say so explicitly.
- For Quickplay mode: note where Core rules differ.
- Self-assess confidence: HIGH / MEDIUM / LOW at end of response.
- Be concise and precise. Players are mid-game."""


def _embed_query(text: str) -> list[float]:
    """Embed a query string using Gemini's embedding model."""
    result = genai.embed_content(
        model=f"models/{settings.embedding_model}",
        content=text,
        task_type="retrieval_query",
    )
    return result["embedding"]


def _retrieve_chunks(query: str, ruleset: str, top_k: int = None) -> list[dict]:
    """Retrieve relevant chunks from ChromaDB."""
    top_k = top_k or settings.top_k_retrieval
    collection = _get_collection()

    query_embedding = _embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"ruleset": ruleset},
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    for i in range(len(results["ids"][0])):
        chunks.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i],
        })
    return chunks


def _assess_confidence(chunks: list[dict]) -> str:
    """Assess confidence based on chunk similarity scores."""
    if not chunks:
        return "LOW"
    # ChromaDB returns L2 distance — lower is more similar
    # Convert threshold: similarity 0.72 ~ L2 distance ~0.56 (approximate)
    close_chunks = [c for c in chunks if c["distance"] < 1.0]
    if len(close_chunks) >= 3:
        return "HIGH"
    elif len(close_chunks) >= 1:
        return "MEDIUM"
    return "LOW"


def _format_chunks(chunks: list[dict]) -> str:
    """Format retrieved chunks for the Gemini prompt."""
    formatted = []
    for c in chunks:
        meta = c["metadata"]
        page_info = f"p.{meta.get('page_start', '?')}"
        section = meta.get("section_title", "Unknown")
        formatted.append(f"[{section} — {page_info}]\n{c['text']}")
    return "\n\n---\n\n".join(formatted)


def _extract_citations(text: str) -> list[str]:
    """Extract page citations like (p.41) from response text."""
    return list(set(re.findall(r'\(p\.\d+\)', text)))


async def chat(query: str, ruleset: str, history: list[dict]) -> dict:
    """
    Full RAG pipeline:
    1. Retrieve relevant chunks from ChromaDB
    2. Assemble Gemini prompt with context
    3. Call Gemini API
    4. Parse citations and assess confidence
    """
    # Retrieve chunks
    chunks = _retrieve_chunks(query, ruleset)
    confidence = _assess_confidence(chunks)

    # Format context
    chunks_text = _format_chunks(chunks)

    # Build prompt
    system = SYSTEM_PROMPT.format(ruleset=ruleset.upper(), chunks=chunks_text)

    # Build conversation history for Gemini
    gemini_history = []
    for msg in history[-6:]:  # Last 6 turns to stay within token budget
        role = "user" if msg.get("role") == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

    # Call Gemini
    model = genai.GenerativeModel(
        model_name=settings.gemini_model_pro,
        system_instruction=system,
    )
    chat_session = model.start_chat(history=gemini_history)
    response = chat_session.send_message(query)

    answer = response.text
    citations = _extract_citations(answer)

    # If Gemini self-assessed, use that; otherwise use our chunk-based assessment
    if "HIGH" in answer[-50:]:
        confidence = "HIGH"
    elif "MEDIUM" in answer[-50:]:
        confidence = "MEDIUM"
    elif "LOW" in answer[-50:]:
        confidence = "LOW"

    return {
        "answer": answer,
        "citations": citations,
        "confidence": confidence,
        "chunks_used": [
            {
                "id": c["id"],
                "section": c["metadata"].get("section_title", ""),
                "page": c["metadata"].get("page_start", 0),
                "distance": c["distance"],
            }
            for c in chunks
        ],
    }
