from __future__ import annotations

import os
from dataclasses import dataclass

import httpx


@dataclass(frozen=True)
class LLMResult:
    text: str
    model: str
    backend: str


async def _openai_chat(*, system: str, user: str, timeout: float) -> LLMResult:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY missing")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    payload = {
        "model": model,
        "temperature": float(os.getenv("OPENAI_TEMPERATURE", "0.2")),
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"authorization": f"Bearer {api_key}", "content-type": "application/json"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
        text = str(data["choices"][0]["message"]["content"]).strip()
        return LLMResult(text=text, model=model, backend="openai")


async def _ollama_chat(*, system: str, user: str, timeout: float) -> LLMResult:
    url = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {
            "temperature": float(os.getenv("OLLAMA_TEMPERATURE", "0.2")),
        },
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(
            f"{url}/api/chat",
            headers={"content-type": "application/json"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
        # Ollama returns { message: { content: ... } }
        text = str((data.get("message") or {}).get("content") or "").strip()
        return LLMResult(text=text, model=model, backend="ollama")


async def generate(*, system: str, user: str) -> LLMResult:
    """Generate with OpenAI or Ollama.

    Selection:
    - LLM_BACKEND=auto (default): prefer OpenAI if key present, else Ollama if reachable.
    - LLM_BACKEND=openai|ollama: force.

    Fallback: if the selected backend fails, try the other one.
    """

    backend = os.getenv("LLM_BACKEND", "auto").strip().lower()
    timeout = float(os.getenv("LLM_TIMEOUT_SECONDS", "25"))

    prefer_openai = bool(os.getenv("OPENAI_API_KEY"))

    order: list[str]
    if backend == "openai":
        order = ["openai", "ollama"]
    elif backend == "ollama":
        order = ["ollama", "openai"]
    else:
        order = ["openai", "ollama"] if prefer_openai else ["ollama", "openai"]

    last_err: Exception | None = None
    for b in order:
        try:
            if b == "openai":
                return await _openai_chat(system=system, user=user, timeout=timeout)
            return await _ollama_chat(system=system, user=user, timeout=timeout)
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"All LLM backends failed: {last_err}")
