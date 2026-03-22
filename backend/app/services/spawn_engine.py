"""
Solo/Co-op AI Spawn Engine for the Hardwar Companion App.

Deterministic server-side rules engine. Given the same random seed,
every function produces identical results.

Covers: spawn check, class resolution, subtable resolution,
spotting checks, direction/distance, and strategic assets.
"""

import random
import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_tables_cache: Optional[dict] = None


def _load_tables() -> dict:
    """Load and cache spawn_tables.json."""
    global _tables_cache
    if _tables_cache is None:
        with open(DATA_DIR / "spawn_tables.json", encoding="utf-8") as f:
            _tables_cache = json.load(f)
    return _tables_cache


def _roll_d12() -> int:
    """Roll a single D12 (1-12 inclusive)."""
    return random.randint(1, 12)


def _lookup_table(table: list[dict], roll: int) -> Optional[dict]:
    """Find the entry whose roll_min..roll_max bracket contains *roll*."""
    for entry in table:
        if entry["roll_min"] <= roll <= entry["roll_max"]:
            return entry
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def spawn_check(turn: int, ai_fc_spent: int, ai_fc_total: int) -> dict:
    """
    Spawn check: D12 + turn number >= threshold triggers a spawn.
    If the AI has already spent its full FC budget, spawning stops.

    Returns a dict with roll details, whether spawn triggered, and step log.
    """
    tables = _load_tables()
    threshold = tables["spawn_trigger_threshold"]

    steps: list[str] = []

    # Budget gate
    if ai_fc_spent >= ai_fc_total:
        steps.append(f"AI FC budget exhausted ({ai_fc_spent}/{ai_fc_total}). No spawn.")
        return {
            "triggered": False,
            "roll": 0,
            "turn_bonus": turn,
            "total": 0,
            "threshold": threshold,
            "reason": "AI FC budget exhausted.",
            "steps": steps,
        }

    roll = _roll_d12()
    total = roll + turn
    triggered = total >= threshold

    steps.append(f"Rolled D12: {roll}")
    steps.append(f"Added turn bonus: +{turn} = {total}")
    steps.append(f"Threshold: {threshold}")

    if triggered:
        steps.append(f"Total {total} >= {threshold} — SPAWN TRIGGERED.")
    else:
        steps.append(f"Total {total} < {threshold} — no spawn this turn.")

    return {
        "triggered": triggered,
        "roll": roll,
        "turn_bonus": turn,
        "total": total,
        "threshold": threshold,
        "reason": "Spawn triggered." if triggered else "Below threshold.",
        "steps": steps,
    }


def spawn_resolve(session_state: dict) -> dict:
    """
    Full spawn cascade:
      1. Class roll  (D12 -> C1-C4 or strategic_asset)
      2. Subtable roll  (D12 -> unit type within class)
      3. Spotting check  (player D-stat dice, 11+ = spotted)
      4. Direction + distance  (D12 direction, D12+4 inches distance)

    *session_state* should contain at least:
      - player_d_stat (int): number of D12 dice for spotting
      - ai_fc_spent (int): current FC spent
      - ai_fc_total (int): AI FC budget
      - ai_interference_pool (int): EW pool (for strategic assets)
      - trigger_element (str): element that triggered the spawn

    Returns a structured dict with every intermediate value.
    """
    tables = _load_tables()
    steps: list[str] = []

    # --- 1. Class roll ---
    class_roll = _roll_d12()
    class_entry = _lookup_table(tables["spawn_class_table"], class_roll)
    spawn_class = class_entry["result"]
    steps.append(f"Class roll D12: {class_roll} -> {spawn_class}")

    # Strategic asset branch
    if spawn_class == "strategic_asset":
        steps.append("Result is Strategic Asset — branching to asset table.")
        asset_result = resolve_strategic_asset(
            session_state.get("ai_interference_pool", 0)
        )
        return {
            "type": "strategic_asset",
            "class_roll": class_roll,
            "spawn_class": spawn_class,
            "asset": asset_result,
            "steps": steps + asset_result["steps"],
        }

    # --- 2. Subtable roll ---
    subtable = tables["spawn_subtables"][spawn_class]
    sub_roll = _roll_d12()
    sub_entry = _lookup_table(subtable, sub_roll)
    steps.append(
        f"Subtable roll D12: {sub_roll} -> {sub_entry['unit_type']} "
        f"(Motive: {sub_entry['motive']})"
    )

    # --- 3. Spotting check ---
    d_stat = session_state.get("player_d_stat", 1)
    spot = spotting_check(d_stat)
    steps.extend(spot["steps"])

    # --- 4. Direction & distance ---
    direction = resolve_direction()
    steps.extend(direction["steps"])

    return {
        "type": "unit",
        "class_roll": class_roll,
        "spawn_class": spawn_class,
        "subtable_roll": sub_roll,
        "unit_type": sub_entry["unit_type"],
        "motive": sub_entry["motive"],
        "spotting": spot,
        "direction": direction,
        "trigger_element": session_state.get("trigger_element", ""),
        "steps": steps,
    }


def spotting_check(d_stat: int) -> dict:
    """
    Roll *d_stat* D12 dice. Any die showing 11 or 12 means "spotted"
    (the spawning unit is detected before it fully enters play).

    Returns dict with individual rolls, spotted flag, and step log.
    """
    steps: list[str] = []
    rolls: list[int] = [_roll_d12() for _ in range(max(d_stat, 1))]
    spotted = any(r >= 11 for r in rolls)

    steps.append(f"Spotting check: rolled {d_stat}x D12 -> {rolls}")
    if spotted:
        hits = [r for r in rolls if r >= 11]
        steps.append(f"Spotted! Hits on: {hits}")
    else:
        steps.append("Not spotted — spawn enters undetected.")

    return {
        "d_stat": d_stat,
        "rolls": rolls,
        "spotted": spotted,
        "steps": steps,
    }


def resolve_direction() -> dict:
    """
    Direction: D12 mapped to clock-face label.
    Distance: D12 + 4 inches from the board edge.

    Returns dict with direction label, distance, and step log.
    """
    tables = _load_tables()
    steps: list[str] = []

    dir_roll = _roll_d12()
    direction_label = tables["direction_labels"][dir_roll - 1]
    steps.append(f"Direction roll D12: {dir_roll} -> \"{direction_label}\"")

    dist_roll = _roll_d12()
    distance_inches = dist_roll + 4
    steps.append(f"Distance roll D12: {dist_roll} + 4 = {distance_inches}\"")

    return {
        "direction_roll": dir_roll,
        "direction_label": direction_label,
        "distance_roll": dist_roll,
        "distance_inches": distance_inches,
        "steps": steps,
    }


def resolve_strategic_asset(ai_interference_pool: int) -> dict:
    """
    D12 against the strategic asset table.
    Also rolls for EW token cost (from ai_ew_cost_table).

    Returns dict with asset details, EW cost, remaining pool, and step log.
    """
    tables = _load_tables()
    steps: list[str] = []

    # Asset roll
    asset_roll = _roll_d12()
    asset_entry = _lookup_table(tables["strategic_asset_table"], asset_roll)
    steps.append(
        f"Strategic Asset roll D12: {asset_roll} -> "
        f"\"{asset_entry['asset']}\" — {asset_entry['description']}"
    )

    # EW cost roll
    ew_roll = _roll_d12()
    ew_entry = _lookup_table(tables["ai_ew_cost_table"], ew_roll)
    tokens_used = ew_entry["tokens"]
    tokens_used = min(tokens_used, ai_interference_pool)  # can't exceed pool
    remaining_pool = ai_interference_pool - tokens_used

    steps.append(f"EW cost roll D12: {ew_roll} -> {ew_entry['tokens']} token(s)")
    if tokens_used < ew_entry["tokens"]:
        steps.append(
            f"Pool only has {ai_interference_pool} — capped to {tokens_used} token(s)."
        )
    steps.append(
        f"AI Interference Pool: {ai_interference_pool} - {tokens_used} = {remaining_pool}"
    )

    return {
        "asset_roll": asset_roll,
        "asset": asset_entry["asset"],
        "description": asset_entry["description"],
        "ew_roll": ew_roll,
        "ew_tokens_used": tokens_used,
        "ai_interference_pool_remaining": remaining_pool,
        "steps": steps,
    }


def get_ai_fc_for_mission(mission_id: str) -> int:
    """Look up the AI Force Composition budget for a given mission ID."""
    tables = _load_tables()
    return tables["ai_fc_by_mission"].get(mission_id, 100)
