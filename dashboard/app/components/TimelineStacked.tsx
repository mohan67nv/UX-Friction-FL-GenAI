'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export type TimelinePoint = {
  hour: string;
  rage: number;
  hesitation: number;
  confusion: number;
  dead_end: number;
};

export function TimelineStacked(props: { points: TimelinePoint[] }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={props.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="hour" tick={{ fill: '#9aa7c7', fontSize: 11 }} />
          <YAxis tick={{ fill: '#9aa7c7', fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="rage" stackId="1" stroke="#ef4444" fill="rgba(239,68,68,0.25)" />
          <Area type="monotone" dataKey="hesitation" stackId="1" stroke="#f59e0b" fill="rgba(245,158,11,0.22)" />
          <Area type="monotone" dataKey="confusion" stackId="1" stroke="#3b82f6" fill="rgba(59,130,246,0.20)" />
          <Area type="monotone" dataKey="dead_end" stackId="1" stroke="#10b981" fill="rgba(16,185,129,0.18)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
