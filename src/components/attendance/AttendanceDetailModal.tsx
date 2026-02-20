"use client"

import { useState } from "react"
import { X, MapPin, Camera, Clock, Download, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AttendanceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: {
    _id: string
    employeeName?: string
    name?: string
    email?: string
    department?: string
    checkInTime?: string
    checkInLocation?: string | { address?: string; latitude?: number; longitude?: number }
    checkInPhoto?: string
    checkInPhotoData?: string
    checkOutTime?: string
    checkOutLocation?: string | { address?: string; latitude?: number; longitude?: number }
    checkOutPhoto?: string
    checkOutPhotoData?: string
    totalHours?: number
    status: string
    photoData?: string
    [key: string]: any
  } | null
  allRecords?: any[] // All attendance records for export
}

export function AttendanceDetailModal({ isOpen, onClose, record, allRecords = [] }: AttendanceDetailModalProps) {
  if (!isOpen || !record) return null

  const [filterPeriod, setFilterPeriod] = useState("month") // today, week, month, year

  // Get filtered records for the selected period
  const getFilteredRecords = () => {
    const employeeName = record.employeeName || record.name
    const now = new Date()
    let startDate = new Date()

    switch (filterPeriod) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        const firstDay = now.getDate() - now.getDay()
        startDate = new Date(now.getFullYear(), now.getMonth(), firstDay)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    return (allRecords || []).filter((r: any) => {
      const recordDate = new Date(r.checkInTime || r.createdAt || "")
      const name = r.employeeName || r.name
      return name === employeeName && recordDate >= startDate && recordDate <= now
    })
  }

  // Convert UTC to IST and format for display with proper timezone handling
  const convertToIST = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      
      // Get UTC components
      const utcYear = date.getUTCFullYear()
      const utcMonth = date.getUTCMonth()
      const utcDate = date.getUTCDate()
      const utcHours = date.getUTCHours()
      const utcMinutes = date.getUTCMinutes()
      const utcSeconds = date.getUTCSeconds()
      
      // Create IST date by adding 5.5 hours to UTC time
      const istDate = new Date(
        Date.UTC(utcYear, utcMonth, utcDate, utcHours + 5, utcMinutes + 30, utcSeconds)
      )
      
      // Format: DD/MM/YYYY, HH:MM:SS AM/PM
      const day = String(istDate.getUTCDate()).padStart(2, '0')
      const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
      const year = istDate.getUTCFullYear()
      let hours = istDate.getUTCHours()
      const minutes = String(istDate.getUTCMinutes()).padStart(2, '0')
      const seconds = String(istDate.getUTCSeconds()).padStart(2, '0')
      const ampm = hours >= 12 ? 'pm' : 'am'
      hours = hours % 12
      hours = hours ? hours : 12
      const hoursStr = String(hours).padStart(2, '0')
      
      return `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`
    } catch {
      return dateString
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const filtered = getFilteredRecords()
    if (filtered.length === 0) {
      alert("No records found for the selected period")
      return
    }

    const employeeName = record.employeeName || record.name || "Employee"
    const headers = ["Date", "Check In Time (IST)", "Check Out Time (IST)", "Status", "Total Hours", "Department"]
    const rows = filtered.map((r: any) => {
      // Get IST date from check-in time
      const checkInDate = r.checkInTime || r.createdAt
      let dateStr = "-"
      if (checkInDate) {
        try {
          const date = new Date(checkInDate)
          const utcDate = date.getUTCDate()
          const utcMonth = date.getUTCMonth() + 1
          const utcYear = date.getUTCFullYear()
          const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
          dateStr = `${String(istDate.getUTCDate()).padStart(2, '0')}-${String(istDate.getUTCMonth() + 1).padStart(2, '0')}-${istDate.getUTCFullYear()}`
        } catch (e) {
          dateStr = "-"
        }
      }
      return [
        dateStr,
        convertToIST(r.checkInTime),
        convertToIST(r.checkOutTime),
        r.status || "-",
        r.totalHours ? `${Math.floor(r.totalHours)}h ${Math.round((r.totalHours % 1) * 60)}m` : "-",
        r.department || "-",
      ]
    })

    const csvContent = [
      [`${employeeName} - Attendance Report (${filterPeriod.toUpperCase()})`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${employeeName}-attendance-${filterPeriod}-${new Date().getTime()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLocationString = (
    location: string | { address?: string; latitude?: number; longitude?: number } | undefined,
  ) => {
    if (!location) return "Not recorded"
    if (typeof location === "string") return location
    if (typeof location === "object" && location.address) return location.address
    return "Not recorded"
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Not recorded"
    try {
      const date = new Date(dateString)
      // Convert to IST (UTC+5:30)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      return istDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return dateString
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not recorded"
    try {
      const date = new Date(dateString)
      // Convert to IST (UTC+5:30)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      return istDate.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
      case "checked-out":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "leave":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === "checked-out") return "Present"
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getImageData = (photoField?: string, photoDataField?: string) => {
    return photoField || photoDataField || null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src={record.photoData || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {(record.employeeName || record.name || "Unknown")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{record.employeeName || record.name || "Unknown"}</h2>
                <p className="text-blue-100">{record.email || "No email"}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Filter and Export Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Filter by:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/40 text-sm hover:bg-white/30 transition cursor-pointer"
              >
                <option value="today" className="text-gray-900">Today</option>
                <option value="week" className="text-gray-900">This Week</option>
                <option value="month" className="text-gray-900">This Month</option>
                <option value="year" className="text-gray-900">This Year</option>
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="ml-auto px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="font-semibold text-gray-900">{record.department || "-"}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Hours</p>
              <p className="font-semibold text-gray-900">{formatHours(record.totalHours)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge className={cn("text-xs font-semibold", getStatusColor(record.status))}>
                {getStatusLabel(record.status)}
              </Badge>
            </div>
          </div>

          {/* Check In Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-green-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </span>
              Check In Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check In Time */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Check In Time (IST)</p>
                <p className="text-lg font-bold text-green-700 break-words">{convertToIST(record.checkInTime)}</p>
              </div>

              {/* Check In Location */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Check In Location
                </p>
                <p className="font-semibold text-gray-900 break-words">{getLocationString(record.checkInLocation)}</p>
              </div>

              {/* Check In Photo */}
              {(() => {
                const checkInImage = record.photoData || record.checkInPhoto || record.checkInPhotoData
                return checkInImage ? (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Camera className="h-4 w-4" /> Check In Photo
                    </p>
                    <img
                      src={checkInImage || "/placeholder.svg"}
                      alt="Check In"
                      className="w-full h-48 object-cover rounded-lg border border-green-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                ) : null
              })()}
            </div>
          </div>

          {/* Check Out Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-red-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
              </span>
              Check Out Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check Out Time */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600 mb-2">Check Out Time (IST)</p>
                <p className="text-lg font-bold text-red-700 break-words">{convertToIST(record.checkOutTime)}</p>
              </div>

              {/* Check Out Location */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Check Out Location
                </p>
                <p className="font-semibold text-gray-900 break-words">{getLocationString(record.checkOutLocation)}</p>
              </div>

              {/* Check Out Photo */}
              {(() => {
                const checkOutImage = getImageData(record.checkOutPhoto, record.checkOutPhotoData)
                return checkOutImage ? (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Camera className="h-4 w-4" /> Check Out Photo
                    </p>
                    <img
                      src={checkOutImage || "/placeholder.svg"}
                      alt="Check Out"
                      className="w-full h-48 object-cover rounded-lg border border-red-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                ) : null
              })()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
