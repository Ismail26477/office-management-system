import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", hours: 8.2 },
  { day: "Tue", hours: 7.8 },
  { day: "Wed", hours: 8.5 },
  { day: "Thu", hours: 9.1 },
  { day: "Fri", hours: 7.5 },
  { day: "Sat", hours: 4.2 },
  { day: "Sun", hours: 0 },
];

export function HoursWorkedChart() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Hours Worked</h3>
        <p className="text-sm text-muted-foreground">Weekly working hours trend</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={[0, 10]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value}h`, 'Hours']}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="hsl(var(--purple))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--purple))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--purple))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Total this week</p>
          <p className="text-lg font-semibold text-foreground">45.3 hours</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Average per day</p>
          <p className="text-lg font-semibold text-foreground">6.5 hours</p>
        </div>
      </div>
    </div>
  );
}
