"""
Hardwar Rulebook → ChromaDB Ingestion Pipeline

Extracts text from the Hardwar Core Rulebook PDF, chunks by section,
embeds using Gemini's text-embedding-004, and stores in ChromaDB.

Usage:
    cd backend
    python scripts/ingest_chromadb.py
"""

import os
import re
import sys
import time
from pathlib import Path

import pdfplumber
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv

# Load env
load_dotenv(Path(__file__).parent.parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chromadb")
RULEBOOK_PATH = r"C:\Users\grubb\OneDrive\Desktop\Hardwar\HARDWAR_Core_Rulebook (1).pdf"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Section headers we look for to determine chunk boundaries
SECTION_PATTERNS = [
    r"^(?:RULES|WHAT YOU NEED|SCALE|MINIATURES|BASES|DAMAGE|CAUSE AND EFFECT|RETREATING)",
    r"^(?:MEASURING DISTANCES|THE TURN|INITIATIVE|ACTION TOKENS|ELECTRONIC WARFARE|DEPLOYMENT)",
    r"^(?:ACTIONS|MOVE|SHOOT|MOVE & SHOOT|AIMED SHOT|SPECIAL ACTIONS|GUARD|DOING NOTHING)",
    r"^(?:SITUATION UPDATE|TURN SUMMARY|CLOSE COMBAT|CHARGE|AIRCRAFT|LOW ALTITUDE ZONE)",
    r"^(?:TERRAIN|TERRAIN SPECIAL RULES|MOBILITY|COMMON TERRAIN|OPTIONAL ENVIRONMENTAL)",
    r"^(?:COMBAT MISSIONS|SCALE OF CONFLICT|TABLE SIZE|VICTORY CONDITIONS|MISSIONS)",
    r"^(?:MISSION \d+|OPERATORS|BRAND|BACKGROUND|ORIGIN|CONTRACT|MISSION BUDGET)",
    r"^(?:BUDGET MODIFIERS|ASSETS|HQ ASSETS|HR ASSETS|LOGISTIC|STRATEGIC|TACTICAL|NETWORK|INTELLIGENCE|FIELD ASSETS|BLACK ASSETS)",
    r"^(?:SPONSORS|ELEMENTS|BALANCE OF POWER|MUSTERING|COMBAT ELEMENTS|MOTIVE TYPES)",
    r"^(?:WEAPONS AND SKILLS|WEAPON UPGRADES|SPECIAL SKILLS|PERFORMANCE UPGRADES|FLAWS)",
    r"^(?:HARDWARE INTERFACE|EXPERT SKILLS|EXPERT FLAWS|CONSTRUCTION RULES|CUSTOM ELEMENTS)",
    r"^(?:QUICKPLAY RULES|CHANGES TO|SOLO.*CO-OP|TARGET PRIORITY|PLAYER AND AI|ENEMY SPAWNING)",
    r"^(?:ACTIVATING AI|AI ELEMENT|FROM THE ASHES|CAMPAIGN BUDGET|GENERATING MISSIONS)",
    r"^(?:QUICK REFERENCE|INDEX)",
]
SECTION_RE = re.compile("|".join(SECTION_PATTERNS), re.IGNORECASE)

# Page ranges for ruleset tagging
QUICKPLAY_PAGES = set(range(184, 187))  # pp 184-186
SOLO_COOP_PAGES = set(range(187, 202))  # pp 187-201
LORE_PAGES = set(range(6, 26))  # pp 6-25
MISSION_PAGES = set(range(80, 113))  # pp 80-112
STAT_LINE_PAGES = set(range(142, 186))  # pp 142-185
RULES_PAGES = set(range(26, 80))  # pp 26-79


def classify_page(page_num: int) -> tuple[str, str]:
    """Return (ruleset, chunk_type) for a page number."""
    if page_num in QUICKPLAY_PAGES:
        return "quickplay", "rule"
    if page_num in LORE_PAGES:
        return "core", "lore"
    if page_num in MISSION_PAGES:
        return "core", "mission"
    if page_num in STAT_LINE_PAGES:
        return "core", "stat_line"
    return "core", "rule"


def extract_pages(pdf_path: str) -> list[dict]:
    """Extract text from each page with metadata."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_num = i + 1
            text = page.extract_text() or ""
            if text.strip():
                pages.append({
                    "page_num": page_num,
                    "text": text.strip(),
                })
    return pages


def chunk_pages(pages: list[dict], target_size: int = 800, overlap: int = 100) -> list[dict]:
    """
    Chunk pages by section boundaries, with fallback to size-based splitting.
    Target ~200-400 tokens ≈ ~800-1600 chars.
    """
    chunks = []
    current_section = "INTRODUCTION"
    current_text = ""
    current_start_page = 1

    for page_data in pages:
        page_num = page_data["page_num"]
        text = page_data["text"]

        # Skip very short pages (page numbers, credits, etc.)
        if len(text) < 50:
            continue

        # Check for section headers in the text
        lines = text.split("\n")
        for line in lines:
            stripped = line.strip()
            if len(stripped) > 3 and SECTION_RE.match(stripped):
                # Save current chunk if substantial
                if len(current_text) > 100:
                    chunks.append({
                        "text": current_text.strip(),
                        "section": current_section,
                        "page_start": current_start_page,
                        "page_end": page_num,
                    })
                current_section = stripped[:80]
                current_text = ""
                current_start_page = page_num

        current_text += "\n" + text

        # If chunk is getting too big, split it
        if len(current_text) > target_size * 3:
            # Split into target-sized pieces
            words = current_text.split()
            while len(" ".join(words)) > target_size:
                split_point = target_size
                chunk_words = current_text[:split_point].rsplit(" ", 1)[0]
                if len(chunk_words) > 100:
                    chunks.append({
                        "text": chunk_words.strip(),
                        "section": current_section,
                        "page_start": current_start_page,
                        "page_end": page_num,
                    })
                current_text = current_text[len(chunk_words) - overlap:]
                words = current_text.split()

    # Final chunk
    if len(current_text) > 100:
        chunks.append({
            "text": current_text.strip(),
            "section": current_section,
            "page_start": current_start_page,
            "page_end": pages[-1]["page_num"] if pages else 0,
        })

    return chunks


def embed_chunks(chunks: list[dict], batch_size: int = 20) -> list[list[float]]:
    """Embed chunks using Gemini embedding model. Free tier: 100 req/min limit."""
    all_embeddings = []
    total = len(chunks)
    requests_this_minute = 0
    minute_start = time.time()

    for i in range(0, total, batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c["text"][:2048] for c in batch]

        # Rate limit: 100 requests per minute for free tier
        # Each batch = 1 request. Stay under 90 to be safe.
        requests_this_minute += 1
        if requests_this_minute >= 450:
            elapsed = time.time() - minute_start
            if elapsed < 62:
                wait = 62 - elapsed
                print(f"  Rate limit: waiting {wait:.0f}s...")
                time.sleep(wait)
            requests_this_minute = 0
            minute_start = time.time()

        # Retry with backoff on rate limit errors
        for attempt in range(5):
            try:
                result = genai.embed_content(
                    model=f"models/{EMBEDDING_MODEL}",
                    content=texts,
                    task_type="retrieval_document",
                )
                all_embeddings.extend(result["embedding"])
                break
            except Exception as e:
                if "429" in str(e) or "ResourceExhausted" in str(e):
                    wait = 15 * (attempt + 1)
                    print(f"  Rate limited, waiting {wait}s (attempt {attempt + 1}/5)...")
                    time.sleep(wait)
                else:
                    raise

        print(f"  Embedded {min(i + batch_size, total)}/{total} chunks")

        # Small delay between requests
        if i + batch_size < total:
            time.sleep(0.2)

    return all_embeddings


def ingest(pdf_path: str, chroma_dir: str):
    """Full ingestion pipeline."""
    print(f"=== Hardwar Rulebook Ingestion Pipeline ===")
    print(f"PDF: {pdf_path}")
    print(f"ChromaDB: {chroma_dir}")
    print()

    # Step 1: Extract
    print("Step 1: Extracting text from PDF...")
    pages = extract_pages(pdf_path)
    print(f"  Extracted {len(pages)} pages with text")

    # Step 2: Chunk
    print("Step 2: Chunking by section boundaries...")
    chunks = chunk_pages(pages)
    print(f"  Created {len(chunks)} chunks")

    # Step 3: Tag metadata
    print("Step 3: Tagging metadata...")
    for i, chunk in enumerate(chunks):
        ruleset, chunk_type = classify_page(chunk["page_start"])
        chunk["id"] = f"{ruleset}_p{chunk['page_start']:03d}_{i:04d}"
        chunk["ruleset"] = ruleset
        chunk["chunk_type"] = chunk_type
    print(f"  Core chunks: {sum(1 for c in chunks if c['ruleset'] == 'core')}")
    print(f"  Quickplay chunks: {sum(1 for c in chunks if c['ruleset'] == 'quickplay')}")

    # Step 4: Embed
    print("Step 4: Embedding chunks (this may take a few minutes)...")
    embeddings = embed_chunks(chunks)
    print(f"  Generated {len(embeddings)} embeddings")

    # Step 5: Store in ChromaDB
    print("Step 5: Storing in ChromaDB...")
    client = chromadb.PersistentClient(path=chroma_dir)

    # Delete existing collection if it exists
    try:
        client.delete_collection("hardwar_rules")
        print("  Deleted existing collection")
    except Exception:
        pass

    collection = client.create_collection(
        name="hardwar_rules",
        metadata={"description": "Hardwar Core Rulebook chunks for RAG"},
    )

    # Add in batches
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        batch_embeddings = embeddings[i : i + batch_size]

        collection.add(
            ids=[c["id"] for c in batch],
            documents=[c["text"] for c in batch],
            embeddings=batch_embeddings,
            metadatas=[
                {
                    "page_start": c["page_start"],
                    "page_end": c["page_end"],
                    "section_title": c["section"],
                    "ruleset": c["ruleset"],
                    "chunk_type": c["chunk_type"],
                }
                for c in batch
            ],
        )
        print(f"  Stored {min(i + batch_size, len(chunks))}/{len(chunks)} chunks")

    print()
    print(f"=== Ingestion Complete ===")
    print(f"Collection: hardwar_rules")
    print(f"Total chunks: {collection.count()}")
    print(f"ChromaDB path: {chroma_dir}")


if __name__ == "__main__":
    pdf = sys.argv[1] if len(sys.argv) > 1 else RULEBOOK_PATH
    ingest(pdf, CHROMA_DIR)
