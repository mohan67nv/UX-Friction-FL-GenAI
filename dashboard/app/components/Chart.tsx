'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function FrictionLineChart(props: { points: { hour: string; count: number }[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.points}>
          <XAxis dataKey="hour" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#7c5cff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
