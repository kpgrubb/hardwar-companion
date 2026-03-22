"""
AI Situation Resolution for the Hardwar Companion App.

Reads ai_situations.json and returns the correct behaviour branch
based on line-of-sight and distance.
"""

import json
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_situations_cache: Optional[dict] = None


def _load_situations() -> dict:
    global _situations_cache
    if _situations_cache is None:
        with open(DATA_DIR / "ai_situations.json", encoding="utf-8") as f:
            _situations_cache = json.load(f)
    return _situations_cache


def get_ai_situation(has_los: bool, distance: float) -> dict:
    """
    Determine the AI behaviour branch based on LoS and distance.

    Parameters
    ----------
    has_los : bool
        Whether the AI element has Line of Sight to the target.
    distance : float
        Distance in inches to the target.

    Returns
    -------
    dict with situation id, condition description, action sequence,
    applicable special rules, and step log.
    """
    data = _load_situations()
    steps: list[str] = []

    # Select situation branch
    if not has_los:
        situation_id = "no_los"
        steps.append(f"Target NOT in Line of Sight (distance {distance}\").")
    elif distance > 8.0:
        situation_id = "los_far"
        steps.append(f"Target in LoS, distance {distance}\" (> 8\").")
    else:
        situation_id = "los_close"
        steps.append(f"Target in LoS, distance {distance}\" (<= 8\").")

    # Find the matching situation entry
    situation = None
    for s in data["situations"]:
        if s["id"] == situation_id:
            situation = s
            break

    steps.append(f"Situation: {situation['condition']}")
    for i, action in enumerate(situation["actions"], 1):
        steps.append(f"  Action {i}: {action}")

    return {
        "situation_id": situation["id"],
        "condition": situation["condition"],
        "actions": situation["actions"],
        "special_rules": data["special_rules"],
        "cannot_use": data["cannot_use"],
        "steps": steps,
    }
