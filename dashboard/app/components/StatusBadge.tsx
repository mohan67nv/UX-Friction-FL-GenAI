'use client';

export function StatusBadge(props: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const map: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'rgba(239,68,68,0.16)', text: '#ef4444' },
    high: { bg: 'rgba(245,158,11,0.16)', text: '#f59e0b' },
    medium: { bg: 'rgba(59,130,246,0.16)', text: '#3b82f6' },
    low: { bg: 'rgba(16,185,129,0.16)', text: '#10b981' }
  };

  const v = map[props.level];
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: v.bg,
        color: v.text,
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.4
      }}
    >
      {props.level}
    </span>
  );
}
