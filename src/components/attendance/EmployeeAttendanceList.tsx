"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmployeeRecord {
  _id: string
  employeeName?: string
  name?: string
  checkInTime?: string
  checkOutTime?: string
  status: string
  totalHours?: number
  photoData?: string
  [key: string]: any
}

interface EmployeeAttendanceListProps {
  data: EmployeeRecord[]
  loading?: boolean
  onRowClick?: (record: EmployeeRecord) => void
}

export function EmployeeAttendanceList({ data, loading = false, onRowClick }: EmployeeAttendanceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
      case "checked-out":
        return "bg-green-100 text-green-800 border-green-300"
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "absent":
        return "bg-red-100 text-red-800 border-red-300"
      case "leave":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Not recorded"
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return dateString
    }
  }

  const formatHours = (hours?: number) => {
    if (!hours) return "-"
    const h = Math.floor(hours)
    const m = Math.round((hours % 1) * 60)
    return `${h}h ${m}m`
  }

  const getStatusLabel = (status: string) => {
    if (status === "checked-out") return "present"
    return status || "unknown"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading attendance data...</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h3 className="font-semibold text-foreground text-lg">Employee Attendance</h3>
        <p className="text-sm text-muted-foreground">Today's attendance details</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Total Hours</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.length > 0 ? (
              data.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(record)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={record.photoData || "/placeholder.svg"} />
                        <AvatarFallback>
                          {(record.employeeName || record.name || "Unknown")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {record.employeeName || record.name || "Unknown Employee"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LogIn className="h-4 w-4 text-green-600" />
                      {formatTime(record.checkInTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LogOut className="h-4 w-4 text-red-600" />
                      {formatTime(record.checkOutTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {formatHours(record.totalHours)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn("border", getStatusColor(record.status))}>
                      {getStatusLabel(record.status)}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
