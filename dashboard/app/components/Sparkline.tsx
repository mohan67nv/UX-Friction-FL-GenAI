export function Sparkline(props: { values: number[]; height?: number }) {
  const h = props.height ?? 44;
  const w = 240;
  const values = props.values.length ? props.values : [0];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1e-9, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * (w - 2) + 1;
      const y = h - ((v - min) / range) * (h - 2) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke="rgba(124,92,255,0.9)" strokeWidth="2" />
    </svg>
  );
}
