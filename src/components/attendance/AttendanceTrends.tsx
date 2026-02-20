"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const trendsData = [
  { date: "Jan 1", present: 95, late: 3, absent: 2, leave: 0 },
  { date: "Jan 2", present: 92, late: 5, absent: 2, leave: 1 },
  { date: "Jan 3", present: 94, late: 3, absent: 1, leave: 2 },
  { date: "Jan 4", present: 96, late: 2, absent: 1, leave: 1 },
  { date: "Jan 5", present: 93, late: 4, absent: 2, leave: 1 },
  { date: "Jan 6", present: 89, late: 6, absent: 3, leave: 2 },
  { date: "Jan 7", present: 91, late: 5, absent: 2, leave: 2 },
]

export function AttendanceTrends() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground text-lg">Attendance Trends (7 Days)</h3>
        <p className="text-sm text-muted-foreground">Daily attendance pattern analysis</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="hsl(22 93% 50%)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="late" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="absent" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
