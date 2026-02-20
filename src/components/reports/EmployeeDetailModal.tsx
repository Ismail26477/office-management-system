"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, Clock, Users } from "lucide-react"

interface EmployeeDetailModalProps {
  isOpen: boolean
  employeeName: string | null
  onClose: () => void
}

interface AttendanceRecord {
  date: string
  status: string
  checkInTime?: string
  checkOutTime?: string
  hours?: string
  employeeName: string
  department?: string
}

export function EmployeeDetailModal({ isOpen, employeeName, onClose }: EmployeeDetailModalProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState<"day" | "week" | "month" | "year">("month")
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    totalHours: 0,
  })

  useEffect(() => {
    if (isOpen && employeeName) {
      fetchEmployeeDetails()
    }
  }, [isOpen, employeeName, filterPeriod])

  const fetchEmployeeDetails = async () => {
    if (!employeeName) return

    try {
      setLoading(true)
      const url = `/api/reports/employee?employeeName=${encodeURIComponent(employeeName)}&period=${filterPeriod}`
      console.log("[v0] Fetching from URL:", url)
      
      const response = await fetch(url)
      console.log("[v0] Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Response error:", errorText)
        throw new Error(`Failed to fetch employee details: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)
      
      setRecords(data.records || [])
      setStats(data.stats || { presentDays: 0, absentDays: 0, lateDays: 0, totalHours: 0 })
    } catch (error) {
      console.error("[v0] Error fetching employee details:", error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = (status || "").toLowerCase().trim()
    if (normalizedStatus === "present" || normalizedStatus === "checked-out" || normalizedStatus === "p")
      return "bg-green-100 text-green-800"
    if (normalizedStatus === "absent" || normalizedStatus === "a") return "bg-red-100 text-red-800"
    if (normalizedStatus === "late" || normalizedStatus === "l") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const normalizedStatus = (status || "").toLowerCase().trim()
    if (normalizedStatus === "p") return "Present"
    if (normalizedStatus === "a") return "Absent"
    if (normalizedStatus === "l") return "Late"
    return status || "Unknown"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{employeeName} - Attendance Details</DialogTitle>
        </DialogHeader>

        {/* Filter Section */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="text-sm font-medium">Filter by:</label>
          <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <div className="text-xs text-muted-foreground mt-1">Present</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
              <div className="text-xs text-muted-foreground mt-1">Absent</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <div className="text-xs text-muted-foreground mt-1">Late</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
              <div className="text-xs text-muted-foreground mt-1">Total Hours</div>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {loading && <div className="text-center py-8 text-muted-foreground">Loading records...</div>}

        {/* Records Table */}
        {!loading && (
          <div className="border rounded-lg overflow-hidden">
            {records.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Check In</th>
                    <th className="px-4 py-3 text-left font-semibold">Check Out</th>
                    <th className="px-4 py-3 text-left font-semibold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {record.date ? new Date(record.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">{record.checkInTime || "—"}</td>
                      <td className="px-4 py-3 text-xs">{record.checkOutTime || "—"}</td>
                      <td className="px-4 py-3">{record.hours || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No attendance records found for this period
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
