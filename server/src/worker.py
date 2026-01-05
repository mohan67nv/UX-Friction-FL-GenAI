import asyncio


async def run_periodic(interval_seconds: int, fn):
    while True:
        await asyncio.sleep(interval_seconds)
        try:
            await fn()
        except Exception:
            # Intentionally swallow in MVP; add structured logging in prod.
            pass
