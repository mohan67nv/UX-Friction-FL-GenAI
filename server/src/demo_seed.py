from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import hash_password
from .database import APIKey, FrictionEvent, Organization, OrgMember, Project, User
from .models_recommendations import Recommendation


async def seed_demo(db: AsyncSession) -> dict:
    """Seed demo data into an already-initialized database."""

    demo_email = "demo@privacyedge.local"
    demo_password = "DemoPassword123!"
    org_name = "PrivacyEdge Demo GmbH"
    org_slug = "privacyedge-demo-gmbh"

    user = (await db.execute(select(User).where(User.email == demo_email))).scalar_one_or_none()
    if not user:
        user = User(email=demo_email, password_hash=hash_password(demo_password), name="Demo User")
        db.add(user)
        await db.flush()

    org = (await db.execute(select(Organization).where(Organization.slug == org_slug))).scalar_one_or_none()
    if not org:
        org = Organization(name=org_name, slug=org_slug, plan="demo", monthly_events_limit=10_000_000)
        db.add(org)
        await db.flush()

    mem = (
        await db.execute(select(OrgMember).where(and_(OrgMember.organization_id == org.id, OrgMember.user_id == user.id)))
    ).scalar_one_or_none()
    if not mem:
        db.add(OrgMember(organization_id=org.id, user_id=user.id, role="owner"))

    project = (
        await db.execute(select(Project).where(and_(Project.organization_id == org.id, Project.name == "Demo Website")))
    ).scalar_one_or_none()
    if not project:
        project = Project(organization_id=org.id, name="Demo Website", domain="demo.example.de", privacy_mode="high")
        db.add(project)
        await db.flush()

    key = (
        await db.execute(select(APIKey).where(and_(APIKey.project_id == project.id, APIKey.revoked_at.is_(None))))
    ).scalars().first()
    if not key:
        import secrets

        plain = "pe_" + secrets.token_urlsafe(24)
        key = APIKey(project_id=project.id, key_hash=hash_password(plain), key_prefix=plain[:10], name="Demo")
        db.add(key)

    # Seed demo recommendations (premium dashboard)
    # Idempotent via unique(project_id,title)
    demo_recos = [
        Recommendation(
            project_id=project.id,
            priority="critical",
            status="open",
            title='Rage Clicks auf „Kauf abschließen“-Button',
            title_en='Rage Clicks on "Complete Purchase" Button',
            metric_type="rage",
            what_text='234 Nutzer rage-klickten diese Woche Ihren Checkout-Button.',
            what_text_en='234 users rage-clicked your checkout button this week.',
            why_text='Safari iOS rendert opacity:0.6 wie „deaktiviert“ → Nutzer denken, der Button ist defekt (94% Confidence).',
            why_text_en='Safari iOS renders opacity:0.6 as disabled → users think the CTA is broken (94% confidence).',
            who_text='Mobile Safari Nutzer, Peak 14:00–16:00 (Lunch-Hours).',
            who_text_en='Mobile Safari users, peak 14:00–16:00 during lunch hours.',
            confidence=0.94,
            incidents_week=234,
            cost_week_eur=234 * 89 * 0.60 / 4,  # simple demo math
            impact_month_eur=12400,
            fix_summary='Disabled-State Styling klar machen (opacity 1.0 + cursor + explizite Farben).',
            fix_summary_en='Change disabled CTA styling to a clear disabled state (opacity 1.0 + cursor + explicit colors).',
            fix_code='''/* Before */\nbutton:disabled { opacity: 0.6; }\n\n/* After */\nbutton:disabled {\n  opacity: 1.0;\n  background: #d1d5db;\n  color: #6b7280;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n''',
            fix_code_en='''/* Before */\nbutton:disabled { opacity: 0.6; }\n\n/* After */\nbutton:disabled {\n  opacity: 1.0;\n  background: #d1d5db;\n  color: #6b7280;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n''',
            effort_minutes=15,
        ),
        Recommendation(
            project_id=project.id,
            priority="high",
            status="open",
            title="Zögern im Versandformular (Ø 4,2s)",
            title_en="Hesitation on Shipping Address Form (avg 4.2s)",
            metric_type="hesitation",
            what_text='89 Nutzer zögerten im Versandformular (Ø 4,2s Verzögerung).',
            what_text_en='89 users hesitated on the shipping form (avg 4.2s delay).',
            why_text='Nutzer scrollen, um Versandkosten/Freigrenze zu prüfen; fehlender Hinweis erzeugt Unsicherheit.',
            why_text_en='Users scroll to check if they qualify for free shipping; no visible indicator creates uncertainty.',
            who_text='Abendliche Käufer (20:00–22:00), geräteübergreifend.',
            who_text_en='Evening shoppers (20:00–22:00) across devices.',
            confidence=0.88,
            incidents_week=89,
            cost_week_eur=5200 / 4,
            impact_month_eur=5200,
            fix_summary='Banner über dem Formular: „Kostenloser Versand ab €50“.',
            fix_summary_en='Add a banner above the form: "Free shipping on orders over €50".',
            fix_code='''<div class="shipping-banner">🎉 Kostenloser Versand ab €50</div>\n''',
            fix_code_en='''<div class="shipping-banner">🎉 Free shipping on orders over €50</div>\n''',
            effort_minutes=30,
        ),
        Recommendation(
            project_id=project.id,
            priority="medium",
            status="open",
            title="Verwirrung: Nutzer springen zwischen Warenkorb und Produkt", 
            title_en="Confusion: Users backtrack between Cart and Product",
            metric_type="confusion",
            what_text='67 Nutzer wechselten wiederholt Warenkorb → Produkt → Warenkorb.',
            what_text_en='67 users backtracked Cart → Product → Cart repeatedly.',
            why_text='Preis-Klarheit (MwSt./Versand erst spät sichtbar) führt zu wiederholtem Nachprüfen.',
            why_text_en='Pricing clarity issue (VAT / shipping not shown early) drives re-checking behavior.',
            who_text='Mobile Nutzer bei langsamer Verbindung.',
            who_text_en='Mobile users on slow connections.',
            confidence=0.78,
            incidents_week=67,
            cost_week_eur=2100 / 4,
            impact_month_eur=2100,
            fix_summary='MwSt./Retouren/Lieferinfo direkt am Preis und in der Warenkorb-Zusammenfassung anzeigen.',
            fix_summary_en='Show VAT + returns + delivery info near the price and in cart summary.',
            fix_code='''<small>Preis inkl. MwSt. • Kostenlose Retoure</small>\n''',
            fix_code_en='''<small>Price includes VAT • Free returns</small>\n''',
            effort_minutes=60,
        ),
    ]

    for r in demo_recos:
        db.add(r)

    # Seed last 7 days
    days = 7
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(days=days)

    def iso_hour(dt: datetime) -> str:
        dt = dt.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
        return dt.isoformat().replace("+00:00", "Z")

    # wipe existing
    await db.execute(
        FrictionEvent.__table__.delete().where(
            and_(FrictionEvent.project_id == project.id, FrictionEvent.hour >= iso_hour(start))
        )
    )

    rng = random.Random(42)
    hour = start
    while hour <= now:
        h = iso_hour(hour)
        is_business = 8 <= hour.hour <= 18
        base = 8 if is_business else 3
        noise = rng.randint(0, 4)

        rage = max(0, int(base * 1.6 + noise + rng.randint(-2, 3)))
        hesitation = max(0, int(base * 1.1 + noise + rng.randint(-2, 2)))
        confusion = max(0, int(base * 0.9 + noise + rng.randint(-2, 2)))
        dead_end = max(0, int(base * 0.4 + rng.randint(0, 2)))

        db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="rage", event_count=rage))
        db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="hesitation", event_count=hesitation))
        db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="confusion", event_count=confusion))
        db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="dead_end", event_count=dead_end))

        hour += timedelta(hours=1)

    return {"email": demo_email, "password": demo_password}
