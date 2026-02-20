"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonthlyAttendanceViewProps {
  attendanceData: any[]
}

export function MonthlyAttendanceView({ attendanceData }: MonthlyAttendanceViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAttendanceStatus = (day: number) => {
    const recordDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const record = attendanceData.find((r: any) => {
      const rDate = new Date(r.date || r.createdAt)
      return rDate.toDateString() === recordDate.toDateString()
    })
    return record?.status || null
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const statusColors: Record<string, string> = {
    "checked-in": "bg-green-100 text-green-800 border-green-300",
    "checked-out": "bg-green-100 text-green-800 border-green-300",
    present: "bg-green-100 text-green-800 border-green-300",
    late: "bg-yellow-100 text-yellow-800 border-yellow-300",
    absent: "bg-red-100 text-red-800 border-red-300",
    leave: "bg-blue-100 text-blue-800 border-blue-300",
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-foreground">{monthName}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={previousMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const status = day ? getAttendanceStatus(day) : null
          return (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg border transition-colors ${
                day
                  ? status
                    ? statusColors[status] || "bg-muted"
                    : "bg-muted/30 text-muted-foreground"
                  : "bg-transparent"
              }`}
            >
              {day && <span>{day}</span>}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-200 border border-green-300" />
          <span className="text-sm text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-yellow-200 border border-yellow-300" />
          <span className="text-sm text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-200 border border-red-300" />
          <span className="text-sm text-muted-foreground">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-blue-200 border border-blue-300" />
          <span className="text-sm text-muted-foreground">Leave</span>
        </div>
      </div>
    </div>
  )
}
