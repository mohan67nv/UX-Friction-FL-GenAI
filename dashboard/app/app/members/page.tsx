'use client';

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/client';

type Org = { id: string; name: string };

type Member = { user_id: string; email: string; role: string };

export default function MembersPage() {
  const t = useT();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgId, setOrgId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  useEffect(() => {
    (async () => {
      const o = await fetch('/api/dashboard/orgs');
      const orgList = (await o.json()) as Org[];
      setOrgs(orgList);
      if (!orgId && orgList.length) setOrgId(orgList[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const r = await fetch(`/api/dashboard/orgs/${orgId}/members`);
      const list = (await r.json()) as Member[];
      setMembers(list);
    })();
  }, [orgId]);

  async function invite() {
    const r = await fetch(`/api/dashboard/orgs/${orgId}/members`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    const list = (await r.json()) as Member[];
    setMembers(list);
    setEmail('');
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">{t('membersTitle')}</div>
          <div className="sub">{t('membersSubtitle')}</div>
        </div>
        <select className="input" value={orgId} onChange={(e) => setOrgId(e.target.value)} style={{ width: 280 }}>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('membersAdd')}</h3>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)} style={{ marginTop: 10 }}>
            <option value="viewer">viewer</option>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          <button className="btn" style={{ marginTop: 10 }} onClick={invite}>
            {t('commonCreate')}
          </button>
          <div className="kpiSmall" style={{ marginTop: 10 }}>
            MVP: user must already exist.
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('membersCurrent')}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {members.map((m) => (
              <div key={m.user_id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 800 }}>{m.email}</div>
                <div className="kpiSmall">role: {m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
