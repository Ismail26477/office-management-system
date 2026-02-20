"use client"

import { Users, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AttendanceStatsProps {
  present: number
  late: number
  absent: number
  leave: number
  total: number
}

export function AttendanceStats({ present, late, absent, leave, total }: AttendanceStatsProps) {
  const calculatePercentage = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  const stats = [
    {
      label: "Present",
      value: present,
      percentage: calculatePercentage(present),
      color: "bg-green-600",
      icon: Users,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Late",
      value: late,
      percentage: calculatePercentage(late),
      color: "bg-yellow-600",
      icon: Clock,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "Absent",
      value: absent,
      percentage: calculatePercentage(absent),
      color: "bg-red-600",
      icon: AlertCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      label: "Leave",
      value: leave,
      percentage: calculatePercentage(leave),
      color: "bg-blue-600",
      icon: TrendingUp,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl border border-border/50 shadow-sm p-5 opacity-0 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("h-5 w-5", stat.textColor)} />
            </div>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{stat.label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Percentage</span>
              <span className="text-xs font-medium text-foreground">{stat.percentage}%</span>
            </div>
            <Progress value={stat.percentage} className="h-1.5" />
          </div>
        </div>
      ))}
    </div>
  )
}
