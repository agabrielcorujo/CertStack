"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { day: "Mon", score: 65 },
  { day: "Tue", score: 72 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 78 },
  { day: "Fri", score: 82 },
  { day: "Sat", score: 75 },
  { day: "Sun", score: 85 },
]

export function ProgressChart() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-[hsl(var(--surface-elevated))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Weekly Progress</h3>
          <p className="mt-0.5 text-sm text-[hsl(var(--text-secondary))]">Your score trend this week</p>
        </div>
        {/* Tab pills - grouped with soft background */}
        <div className="flex gap-1 rounded-xl bg-[hsl(var(--background-surface))] p-1">
          <button className="rounded-lg bg-[hsl(var(--primary-500))] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[hsl(var(--primary-600))]">
            Week
          </button>
          <button className="rounded-lg px-4 py-1.5 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all hover:bg-white">
            Month
          </button>
          <button className="rounded-lg px-4 py-1.5 text-sm font-medium text-[hsl(var(--text-secondary))] transition-all hover:bg-white">
            Year
          </button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary-500))" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(var(--primary-500))" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Softer grid - no dashes, no vertical lines */}
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="hsl(var(--border-light))" 
              vertical={false} 
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--text-tertiary))", fontSize: 12 }}
              domain={[0, 100]}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--text-primary))",
                border: "none",
                borderRadius: "12px",
                color: "#FFFFFF",
                fontSize: "13px",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              itemStyle={{ color: "#FFFFFF" }}
              labelStyle={{ color: "#D1D5DB", fontSize: "12px" }}
            />
            {/* Thicker line with dots */}
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary-500))"
              strokeWidth={3}
              fill="url(#scoreGradient)"
              dot={{ 
                fill: "hsl(var(--primary-500))", 
                r: 4,
                strokeWidth: 2,
                stroke: "white"
              }}
              activeDot={{ 
                r: 6, 
                fill: "hsl(var(--primary-600))",
                strokeWidth: 2,
                stroke: "white"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
