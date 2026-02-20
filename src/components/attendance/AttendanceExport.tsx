"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AttendanceExportProps {
  attendanceData: any[]
}

export function AttendanceExport({ attendanceData }: AttendanceExportProps) {
  // Convert UTC to IST (UTC+5:30)
  const convertToIST = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      return istDate.toLocaleString("en-US", { 
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      })
    } catch {
      return dateString
    }
  }

  const exportCSV = () => {
    if (attendanceData.length === 0) {
      alert("No attendance data to export")
      return
    }

    const headers = [
      "Employee Name",
      "Email",
      "Date (IST)",
      "Check In Time (IST)",
      "Check Out Time (IST)",
      "Total Hours",
      "Status",
      "Department",
    ]
    const rows = attendanceData.map((record: any) => [
      record.employeeName || "Unknown",
      record.email || "-",
      convertToIST(record.date || record.createdAt).split(",")[0],
      convertToIST(record.checkInTime),
      convertToIST(record.checkOutTime),
      record.totalHours || "-",
      record.status || "-",
      record.department || "-",
    ])

    let csv = headers.join(",") + "\n"
    rows.forEach((row: any[]) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n"
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={exportCSV} size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  )
}
