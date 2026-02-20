import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Present", value: 85, color: "hsl(var(--success))" },
  { name: "Late", value: 8, color: "hsl(var(--warning))" },
  { name: "Absent", value: 5, color: "hsl(var(--destructive))" },
  { name: "On Leave", value: 2, color: "hsl(var(--info))" },
];

export function AttendanceChart() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Attendance Overview</h3>
        <p className="text-sm text-muted-foreground">Today's attendance distribution</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium text-foreground ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
