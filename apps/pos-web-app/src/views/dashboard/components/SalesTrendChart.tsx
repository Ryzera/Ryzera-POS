// ============================================================
// Sales Trend Line Chart (last 7 days)
// File: src/views/dashboard/components/SalesTrendChart.tsx
// ============================================================

'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SalesTrendPoint } from '@/types/dashboard.types';

interface SalesTrendChartProps {
    data: SalesTrendPoint[];
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatYAxis(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}k`;
    return value % 1 === 0 ? String(value) : value.toFixed(1);
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
    const formatted = data.map(d => ({
        ...d,
        label:   formatDate(d.date),
        // Ensure revenue is always a proper number, not a string
        revenue: Number(d.revenue),
    }));

    const maxRevenue  = Math.max(...formatted.map(d => d.revenue), 0);
    const hasData     = maxRevenue > 0;

    // If all values are 0, show a flat baseline at 100 so the chart
    // doesn't look broken — and shows "no sales" clearly
    const yDomain: [number, number] = hasData
        ? [0, Math.ceil(maxRevenue * 1.25)]
        : [0, 100];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-[14px] font-bold text-gray-800 mb-0.5">
                Sales Trend (Last 7 Days)
            </p>
            <p className="text-[11px] text-gray-400 mb-4">Daily revenue performance</p>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                    <p className="text-[13px] text-gray-400 font-medium">
                        No sales recorded in the last 7 days
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                        data={formatted}
                        margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f3f4f6"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={yDomain}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatYAxis}
                            width={48}
                        />
                        <Tooltip
                            formatter={(value: number) => [
                                `Rs ${value.toLocaleString('en-LK', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`,
                                'Revenue',
                            ]}
                            labelStyle={{ fontSize: 12 }}
                            contentStyle={{
                                borderRadius:    10,
                                border:          '1px solid #e2e8f0',
                                boxShadow:       '0 8px 24px rgba(0,0,0,0.08)',
                                fontSize:        12,
                                backgroundColor: '#ffffff',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#3b82f6' }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}