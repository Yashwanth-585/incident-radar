"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { time: "09:00", rate: 0.6 },
  { time: "09:10", rate: 0.7 },
  { time: "09:20", rate: 0.8 },
  { time: "09:30", rate: 1.2 },
  { time: "09:32", rate: 4.5 },
  { time: "09:34", rate: 18 },
  { time: "09:35", rate: 32 },
  { time: "09:36", rate: 35 },
  { time: "09:40", rate: 34 },
  { time: "09:50", rate: 33 },
];

export function ErrorRateChart() {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value: number) => [`${value}%`, "Error rate"]}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f87171" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
