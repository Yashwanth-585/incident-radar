'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui';

// Mock time series data
const generateTimeSeriesData = (hoursAgo = 4) => {
  const data = [];
  const now = new Date();

  for (let i = hoursAgo * 60; i >= 0; i -= 5) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const hour = timestamp.getHours();

    // More events and errors during the incident (around hour 9-10)
    const baseEvents = 30;
    const eventDeviation = hour >= 9 && hour <= 10 ? 40 : 5;
    const baseErrors = 0.5;
    const errorDeviation = hour >= 9 && hour <= 10 ? 15 : 0.1;

    data.push({
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      events: baseEvents + Math.random() * eventDeviation,
      errors: baseErrors + Math.random() * errorDeviation,
    });
  }

  return data;
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-100">{title}</h3>
        {children}
      </div>
    </Card>
  );
}

export function EventVolumeChart() {
  const data = generateTimeSeriesData();

  return (
    <ChartCard title="Event Volume">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Area
            type="monotone"
            dataKey="events"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorEvents)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ErrorRateChart() {
  const data = generateTimeSeriesData();

  return (
    <ChartCard title="Error Rate (%)">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="errors"
            stroke="#ef4444"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ServiceSparkline({ data }: { data: number[] }) {
  const chartData = data.map((value, index) => ({
    x: index,
    y: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="y"
          stroke="#3b82f6"
          dot={false}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
