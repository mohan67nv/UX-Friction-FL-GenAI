from __future__ import annotations

import os
from dataclasses import dataclass

from .llm_backends import generate as llm_generate


@dataclass(frozen=True)
class LangChainResult:
    answer: str
    model: str


def enabled() -> bool:
    return os.getenv("GENAI_ORCHESTRATOR", "native").strip().lower() == "langchain"


async def langchain_answer(*, question: str, context_text: str, lang: str) -> LangChainResult:
    """LangChain multi-step (agentic) auditor.

    This implementation is intentionally minimal and production-friendly:
    - It uses LangChain's prompt/runnable composition to enforce a multi-step workflow.
    - It reuses our existing `llm_backends.generate()` so provider selection (DeepSeek/OpenAI/Ollama)
      remains centralized.

    Steps:
    1) Retrieval summary: extract key evidence from context.
    2) Analysis: form root-cause hypothesis based on evidence.
    3) Recommendations: propose fix steps + what to check next.
    4) Impact: estimate impact only if present in evidence.
    5) Final synthesis: present a clean structured answer.

    If LangChain is not available, callers should fall back.
    """

    try:
        from langchain_core.prompts import ChatPromptTemplate
    except Exception as e:  # pragma: no cover
        raise RuntimeError(f"LangChain not available: {e}")

    system = (
        "You are ZeroBanner AI, a privacy-first UX analytics auditor. "
        "You MUST ONLY use the provided aggregated context; do not invent facts. "
        "Do not request or output PII, URLs, raw user identifiers, or session replay."
    )
    if lang == "de":
        system += " Respond in German."
    else:
        system += " Respond in English."

    # Step 1: retrieval summary
    p_retrieval = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            (
                "user",
                "Extract the most relevant evidence snippets for the user's question. "
                "Return 5-10 bullet points, each referencing the context explicitly.\n\n"
                "Question:\n{question}\n\nContext:\n{context}\n",
            ),
        ]
    )

    # Step 2: analysis
    p_analysis = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            (
                "user",
                "Given the evidence bullets, propose a root-cause hypothesis and 2 alternative hypotheses. "
                "Mark which is best-supported and why.\n\n"
                "Question:\n{question}\n\nEvidence bullets:\n{evidence}\n",
            ),
        ]
    )

    # Step 3: recommendations
    p_reco = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            (
                "user",
                "Based on the best-supported hypothesis, propose 3-6 concrete fix steps. "
                "Also propose 2 verification checks to confirm the fix.\n\n"
                "Hypotheses:\n{analysis}\n\nEvidence:\n{evidence}\n",
            ),
        ]
    )

    # Step 4: impact
    p_impact = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            (
                "user",
                "Estimate impact using ONLY numbers present in the context/evidence (e.g. EUR impact fields). "
                "If missing, output 'Impact: unknown (insufficient evidence)'.\n\n"
                "Context:\n{context}\n\nEvidence:\n{evidence}\n\nRecommendation steps:\n{recommendations}\n",
            ),
        ]
    )

    # Step 5: final synthesis
    p_final = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            (
                "user",
                "Write the FINAL answer in this structure:\n"
                "1) Root cause hypothesis (short)\n"
                "2) Evidence bullets (3-6)\n"
                "3) Recommended fix steps (3-5)\n"
                "4) Impact estimate\n"
                "5) Confidence (0-100)\n\n"
                "Question:\n{question}\n\n"
                "Evidence bullets:\n{evidence}\n\n"
                "Analysis:\n{analysis}\n\n"
                "Recommendations:\n{recommendations}\n\n"
                "Impact:\n{impact}\n",
            ),
        ]
    )

    async def call(prompt: ChatPromptTemplate, **kwargs: str) -> str:
        msgs = prompt.format_messages(**kwargs)
        # Collapse into a simple (system,user) pair to use our existing backend.
        # LangChain is used for orchestration/prompt hygiene, not for network calls.
        sys_msg = msgs[0].content if msgs else system
        user_msg = "\n".join([m.content for m in msgs[1:]])
        r = await llm_generate(system=str(sys_msg), user=str(user_msg))
        return r.text

    evidence = await call(p_retrieval, question=question, context=context_text)
    analysis = await call(p_analysis, question=question, evidence=evidence)
    recommendations = await call(p_reco, analysis=analysis, evidence=evidence)
    impact = await call(p_impact, context=context_text, evidence=evidence, recommendations=recommendations)
    final = await call(
        p_final,
        question=question,
        evidence=evidence,
        analysis=analysis,
        recommendations=recommendations,
        impact=impact,
    )

    # Model label reflects orchestrator. Underlying provider is in llm_backends.
    return LangChainResult(answer=final.strip(), model="langchain:multistep")
