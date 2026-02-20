import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", completed: 45, pending: 12 },
  { month: "Feb", completed: 52, pending: 8 },
  { month: "Mar", completed: 48, pending: 15 },
  { month: "Apr", completed: 61, pending: 10 },
  { month: "May", completed: 55, pending: 14 },
  { month: "Jun", completed: 67, pending: 9 },
];

export function PerformanceChart() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Task Performance</h3>
        <p className="text-sm text-muted-foreground">Monthly task completion overview</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="pending" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          <span className="text-sm text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-accent" />
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
      </div>
    </div>
  );
}
