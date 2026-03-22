"""
Solo/Co-op Electronic Warfare Resolver for the Hardwar Companion App.

Rolls a D12 against the AI EW cost table to determine how many
Interference Tokens the AI expends from its pool.
"""

import random
import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_tables_cache: Optional[dict] = None


def _load_tables() -> dict:
    global _tables_cache
    if _tables_cache is None:
        with open(DATA_DIR / "spawn_tables.json", encoding="utf-8") as f:
            _tables_cache = json.load(f)
    return _tables_cache


def _roll_d12() -> int:
    return random.randint(1, 12)


def _lookup_table(table: list[dict], roll: int) -> Optional[dict]:
    for entry in table:
        if entry["roll_min"] <= roll <= entry["roll_max"]:
            return entry
    return None


def resolve_solo_ew(ai_interference_pool: int) -> dict:
    """
    Solo/Co-op EW resolution.

    Roll D12 against the AI EW cost table:
      1-4  -> 0 tokens
      5-7  -> 1 token
      8-11 -> 2 tokens
      12   -> 3 tokens

    Tokens are deducted from the AI interference pool (cannot go below 0).

    Returns
    -------
    dict with roll, tokens used, remaining pool, and step log.
    """
    tables = _load_tables()
    steps: list[str] = []

    roll = _roll_d12()
    entry = _lookup_table(tables["ai_ew_cost_table"], roll)
    raw_tokens = entry["tokens"]
    tokens_used = min(raw_tokens, ai_interference_pool)
    remaining = ai_interference_pool - tokens_used

    steps.append(f"EW roll D12: {roll}")
    steps.append(f"Table result: {raw_tokens} token(s)")

    if tokens_used < raw_tokens:
        steps.append(
            f"Pool only has {ai_interference_pool} token(s) — "
            f"capped to {tokens_used}."
        )

    steps.append(
        f"AI Interference Pool: {ai_interference_pool} - {tokens_used} = {remaining}"
    )

    return {
        "roll": roll,
        "raw_tokens": raw_tokens,
        "tokens_used": tokens_used,
        "ai_interference_pool_remaining": remaining,
        "steps": steps,
    }
