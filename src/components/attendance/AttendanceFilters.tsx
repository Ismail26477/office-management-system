"use client"

import { useState } from "react"
import { Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttendanceFiltersProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
  onStatusFilter: (status: string) => void
  onEmployeeFilter: (employeeId: string) => void
}

export function AttendanceFilters({ onDateRangeChange, onStatusFilter, onEmployeeFilter }: AttendanceFiltersProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleDateChange = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          />
          <Button size="sm" onClick={handleDateChange} className="bg-blue-600 hover:bg-blue-700 text-white">
            Apply
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            onChange={(e) => onStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>

          <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}
