"""
Initiative Resolution for the Hardwar Companion App.

Supports three modes:
  - Solo: player always wins initiative.
  - Core: step-by-step blind bid using Interference Tokens.
  - Quick Play (QP): fewer tokens remaining wins.
"""


def resolve_initiative(mode: str, ruleset: str, **kwargs) -> dict:
    """
    Resolve initiative for the current turn.

    Parameters
    ----------
    mode : str
        "solo" or "coop".
    ruleset : str
        "core" or "qp" (Quick Play).
    **kwargs : additional context
        - player_tokens (int): tokens the player is bidding / has remaining.
        - ai_tokens (int): tokens in the AI interference pool.

    Returns
    -------
    dict with winner, reasoning, prompt (if applicable), and step log.
    """
    steps: list[str] = []
    player_tokens = kwargs.get("player_tokens", 0)
    ai_tokens = kwargs.get("ai_tokens", 0)

    # --- Solo mode: player always wins ---
    if mode == "solo":
        steps.append("Solo mode: player always wins initiative.")
        return {
            "winner": "player",
            "mode": mode,
            "ruleset": ruleset,
            "reason": "Solo mode — player automatically has initiative.",
            "steps": steps,
        }

    # --- Core ruleset: blind bid ---
    if ruleset == "core":
        steps.append("Core ruleset: initiative resolved via blind bid.")
        steps.append(
            "Each side secretly commits Interference Tokens. "
            "Higher bid wins; ties go to the defender."
        )
        steps.append(
            "Prompt: Choose how many Interference Tokens to bid for initiative."
        )

        # If we have concrete bids, resolve
        if player_tokens is not None and ai_tokens is not None and (
            player_tokens > 0 or ai_tokens > 0
        ):
            if player_tokens > ai_tokens:
                winner = "player"
                steps.append(
                    f"Player bid {player_tokens} vs AI bid {ai_tokens} "
                    f"-> Player wins initiative."
                )
            elif ai_tokens > player_tokens:
                winner = "ai"
                steps.append(
                    f"Player bid {player_tokens} vs AI bid {ai_tokens} "
                    f"-> AI wins initiative."
                )
            else:
                winner = "defender"
                steps.append(
                    f"Tied at {player_tokens} each -> Defender wins initiative."
                )

            return {
                "winner": winner,
                "mode": mode,
                "ruleset": ruleset,
                "player_bid": player_tokens,
                "ai_bid": ai_tokens,
                "reason": f"Blind bid resolved: {winner} wins.",
                "steps": steps,
            }

        # No bids yet — return prompt
        return {
            "winner": None,
            "mode": mode,
            "ruleset": ruleset,
            "awaiting_input": True,
            "prompt": "Enter your Interference Token bid for initiative.",
            "reason": "Awaiting player bid.",
            "steps": steps,
        }

    # --- Quick Play: fewer tokens remaining wins ---
    if ruleset == "qp":
        steps.append("Quick Play ruleset: fewer remaining tokens wins initiative.")
        steps.append(
            f"Player tokens remaining: {player_tokens}, "
            f"AI tokens remaining: {ai_tokens}."
        )

        if player_tokens < ai_tokens:
            winner = "player"
            steps.append("Player has fewer tokens -> Player wins initiative.")
        elif ai_tokens < player_tokens:
            winner = "ai"
            steps.append("AI has fewer tokens -> AI wins initiative.")
        else:
            winner = "player"
            steps.append(
                "Tied — in QP solo/co-op, tie goes to player."
            )

        return {
            "winner": winner,
            "mode": mode,
            "ruleset": ruleset,
            "player_tokens": player_tokens,
            "ai_tokens": ai_tokens,
            "reason": f"{winner.capitalize()} wins initiative (QP: fewer tokens).",
            "steps": steps,
        }

    # Fallback
    steps.append(f"Unknown ruleset '{ruleset}' — defaulting player wins.")
    return {
        "winner": "player",
        "mode": mode,
        "ruleset": ruleset,
        "reason": f"Unknown ruleset '{ruleset}'; defaulting to player.",
        "steps": steps,
    }
