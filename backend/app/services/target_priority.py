"""
AI Target Priority Resolution for the Hardwar Companion App.

Chain: (1) triggering element -> (2) closest to objective -> (3) highest class.
"""


def resolve_target_priority(trigger_element: str, ai_class: int) -> dict:
    """
    Determine the AI's target priority using the standard chain:

    1. The player element that triggered the spawn (if any).
    2. The player element closest to the AI's objective.
    3. The player element with the highest Combat Class (C value).

    Parameters
    ----------
    trigger_element : str
        Identifier of the player element that triggered the spawn.
        Empty string or None means no specific trigger.
    ai_class : int
        The AI element's class (1-4), used for descriptive context.

    Returns
    -------
    dict with the priority chain, reasoning at each step, and the
    recommended target.
    """
    steps: list[str] = []
    chain: list[dict] = []

    # Step 1 — triggering element
    if trigger_element:
        chain.append({
            "priority": 1,
            "rule": "Triggering element",
            "target": trigger_element,
        })
        steps.append(
            f"Priority 1: Target the triggering element \"{trigger_element}\"."
        )
    else:
        chain.append({
            "priority": 1,
            "rule": "Triggering element",
            "target": None,
        })
        steps.append(
            "Priority 1: No specific triggering element — skip to next rule."
        )

    # Step 2 — closest to objective
    chain.append({
        "priority": 2,
        "rule": "Closest to AI objective",
        "target": None,  # must be resolved at the table with board state
    })
    steps.append(
        "Priority 2: If trigger target unavailable, target the player element "
        "closest to the AI's primary objective."
    )

    # Step 3 — highest class
    chain.append({
        "priority": 3,
        "rule": "Highest Combat Class (C value)",
        "target": None,  # must be resolved at the table with board state
    })
    steps.append(
        "Priority 3: If still tied, target the player element with the "
        "highest Combat Class."
    )

    # Determine recommended target (first non-None in chain)
    recommended = None
    for link in chain:
        if link["target"] is not None:
            recommended = link["target"]
            break

    if recommended:
        steps.append(f"Recommended target: \"{recommended}\".")
    else:
        steps.append(
            "No deterministic target — resolve priorities 2 & 3 using "
            "board state (closest to objective, then highest C)."
        )

    return {
        "ai_class": ai_class,
        "chain": chain,
        "recommended_target": recommended,
        "steps": steps,
    }
