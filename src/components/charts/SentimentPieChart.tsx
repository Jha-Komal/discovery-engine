'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartWrapper } from './ChartWrapper';

const COLORS: Record<string, string> = {
  Positive: 'var(--positive)',
  Neutral: 'var(--neutral)',
  Negative: 'var(--negative)',
};

export function SentimentPieChart({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  const data = [
    { name: 'Positive', value: positive },
    { name: 'Neutral', value: neutral },
    { name: 'Negative', value: negative },
  ].filter((d) => d.value > 0);

  return (
    <ChartWrapper title="Sentiment Distribution">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--border)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
