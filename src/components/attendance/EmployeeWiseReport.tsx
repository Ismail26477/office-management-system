"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EmployeeWiseReportProps {
  attendanceData: any[]
}

export function EmployeeWiseReport({ attendanceData }: EmployeeWiseReportProps) {
  // Group attendance by employee
  const employeeStats = attendanceData.reduce((acc: any, record: any) => {
    const emp = acc.find((e: any) => e.name === record.employeeName)
    if (emp) {
      if (record.status === "checked-in" || record.status === "checked-out" || record.status === "present") {
        emp.present++
      } else if (record.status === "late") {
        emp.late++
      } else if (record.status === "absent") {
        emp.absent++
      } else if (record.status === "leave") {
        emp.leave++
      }
    } else {
      acc.push({
        name: record.employeeName || "Unknown",
        present:
          record.status === "checked-in" || record.status === "checked-out" || record.status === "present" ? 1 : 0,
        late: record.status === "late" ? 1 : 0,
        absent: record.status === "absent" ? 1 : 0,
        leave: record.status === "leave" ? 1 : 0,
      })
    }
    return acc
  }, [])

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Employee-wise Attendance Summary</h3>
        <p className="text-sm text-muted-foreground">Attendance breakdown by employee</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={employeeStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="present" fill="hsl(22 93% 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="leave" fill="hsl(194 97% 40%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
