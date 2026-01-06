from __future__ import annotations

import os
from dataclasses import dataclass

from .llm_backends import generate as llm_generate, LLMResult


@dataclass(frozen=True)
class MultiLayerResult:
    answer: str
    model: str
    # optional intermediate drafts (useful for debugging / demos)
    drafts: list[tuple[str, str]]


def enabled() -> bool:
    return os.getenv("GENAI_MULTILAYER", "0").strip().lower() in ("1", "true", "yes")


async def _call_with_model(*, system: str, user: str, model: str) -> LLMResult:
    # Temporarily override model via env. This keeps llm_backends simple.
    # NOTE: This is process-wide; safe for single-worker demo. For multi-worker prod,
    # use a per-request client abstraction.
    old = os.getenv("DEEPSEEK_MODEL")
    os.environ["DEEPSEEK_MODEL"] = model
    try:
        return await llm_generate(system=system, user=user)
    finally:
        if old is None:
            os.environ.pop("DEEPSEEK_MODEL", None)
        else:
            os.environ["DEEPSEEK_MODEL"] = old


async def multilayer_answer(*, question: str, context_text: str, lang: str) -> MultiLayerResult:
    """DeepSeek-only multi-layer answer.

    Layers:
    1) deepseek-chat: fast baseline answer.
    2) deepseek-reasoner: validate/improve; fix hallucinations; produce final.

    Optional layer:
    3) deepseek-coder: generate a concrete code snippet if relevant.

    Controlled by env:
    - GENAI_MULTILAYER=1
    - DEEPSEEK_MODEL is used as default but overridden per layer.
    - GENAI_MULTILAYER_CODER=1 enables coder layer.
    """

    # If no deepseek key is set, bail to normal path.
    if not os.getenv("DEEPSEEK_API_KEY"):
        raise RuntimeError("DEEPSEEK_API_KEY missing")

    drafts: list[tuple[str, str]] = []

    system = (
        "You are ZeroBanner AI, a privacy-first UX analytics auditor. "
        "You MUST ONLY use the provided aggregated context; do not invent facts. "
        "Do not request or output PII, URLs, raw user identifiers, or session replay. "
        "If evidence is insufficient, say so and propose what aggregated data would be needed. "
        "Always provide actionable next steps."
    )
    if lang == "de":
        system += " Respond in German."
    else:
        system += " Respond in English."

    baseline_user = (
        f"Question:\n{question}\n\n"
        f"Aggregated context (privacy-safe):\n{context_text}\n\n"
        "Return a structured response with:\n"
        "1) Root cause hypothesis (short)\n"
        "2) Evidence bullets (3-6) referencing the context\n"
        "3) Recommended fix steps (3-5)\n"
        "4) Estimated impact if possible (use EUR impact fields if present; otherwise state unknown)\n"
        "5) Confidence as a percentage (0-100) based on evidence strength\n"
    )

    r1 = await _call_with_model(system=system, user=baseline_user, model="deepseek-chat")
    drafts.append((f"deepseek-chat:{r1.model}", r1.text))

    refine_user = (
        "You will receive a DRAFT answer and the original context.\n"
        "Task: validate every claim against context, remove any unsupported claims, and improve clarity.\n"
        "If the draft lacks evidence, say so explicitly.\n\n"
        f"Question:\n{question}\n\n"
        f"Aggregated context:\n{context_text}\n\n"
        f"DRAFT ANSWER:\n{r1.text}\n\n"
        "Return the FINAL answer in the same structured format (1..5)."
    )

    r2 = await _call_with_model(system=system, user=refine_user, model="deepseek-reasoner")
    drafts.append((f"deepseek-reasoner:{r2.model}", r2.text))

    final_text = r2.text
    final_model = f"multilayer:deepseek-chat+reasoner"

    if os.getenv("GENAI_MULTILAYER_CODER", "0").strip().lower() in ("1", "true", "yes"):
        coder_user = (
            "Given the FINAL answer, produce a small code snippet (CSS/JS/HTML/React) that implements the recommended fix.\n"
            "Keep it minimal and include short comments.\n\n"
            f"FINAL ANSWER:\n{final_text}\n"
        )
        r3 = await _call_with_model(system=system, user=coder_user, model=os.getenv("DEEPSEEK_CODER_MODEL", "deepseek-coder"))
        drafts.append((f"deepseek-coder:{r3.model}", r3.text))
        final_text = final_text + "\n\n---\n\nSuggested implementation snippet:\n" + r3.text
        final_model += "+coder"

    return MultiLayerResult(answer=final_text.strip(), model=final_model, drafts=drafts)
