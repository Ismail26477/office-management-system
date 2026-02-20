"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, Clock, Users, TrendingUp, X, ChevronDown, AlertCircle, CheckCircle, Zap, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AttendanceExport } from "@/components/attendance/AttendanceExport"
import { AttendanceDetailModal } from "@/components/attendance/AttendanceDetailModal"
import { AttendanceAnalytics } from "@/components/attendance/AttendanceAnalytics"

// Office timings: 10 AM to 6 PM
const OFFICE_START_TIME = 10 // 10 AM
const OFFICE_END_TIME = 18 // 6 PM
const LATE_THRESHOLD_MINUTES = 15 // 15 minutes grace period
const RECORDS_PER_PAGE = 50 // Pagination limit

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [uniqueEmployees, setUniqueEmployees] = useState<string[]>([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showEmployeeFilter, setShowEmployeeFilter] = useState(false)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showLateDetails, setShowLateDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        // Increase timeout to 30 seconds for database queries
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch("/api/attendance?limit=1000", { signal: controller.signal })
        clearTimeout(timeoutId)
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch attendance`)
        const data = await response.json()
        
        // Handle both array and object responses
        const attendanceRecords = Array.isArray(data) ? data : (data.data || [])
        setAttendanceData(attendanceRecords)

        // Extract unique employees with memoization
        const employees = [...new Set(attendanceRecords?.map((r: any) => r.employeeName || r.name).filter(Boolean))] as string[]
        setUniqueEmployees(employees.sort())
        setError(null) // Clear error on success
      } catch (err: any) {
        console.error("[v0] Error fetching attendance:", err.message)
        // Only show error if it's not an abort (user didn't navigate away)
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load attendance data")
        }
        setAttendanceData([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Memoized filtered data to avoid recalculation on every render
  const { todayRecords, previousRecords } = useMemo(() => {
    const today_date = new Date().toISOString().split("T")[0]
    
    const today = attendanceData.filter((record: any) => {
      const recordDate = new Date(record.date || record.createdAt).toISOString().split("T")[0]
      const matchesDate = recordDate === today_date
      const matchesEmployee = !filterEmployee || record.employeeName === filterEmployee || record.name === filterEmployee
      return matchesDate && matchesEmployee
    })

    const previous = attendanceData.filter((record: any) => {
      const recordDate = new Date(record.date || record.createdAt).toISOString().split("T")[0]
      const matchesDate = !filterDate || recordDate === filterDate
      const matchesEmployee = !filterEmployee || record.employeeName === filterEmployee || record.name === filterEmployee
      return recordDate !== today_date && matchesDate && matchesEmployee
    })

    return { todayRecords: today, previousRecords: previous }
  }, [attendanceData, filterEmployee, filterDate])

  // Calculate if employee is late based on office timing (comparing in IST)
  const isLate = (checkInTime: string) => {
    if (!checkInTime) return false
    try {
      const date = new Date(checkInTime)
      // Convert to IST for accurate time comparison
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      const hours = istDate.getHours()
      const minutes = istDate.getMinutes()
      
      // Check if arrival is after 10:15 AM (with 15 min grace period)
      if (hours > OFFICE_START_TIME) return true
      if (hours === OFFICE_START_TIME && minutes > LATE_THRESHOLD_MINUTES) return true
      return false
    } catch {
      return false
    }
  }

  // Calculate expected vs actual working hours
  const calculateWorkingHours = (checkInTime: string, checkOutTime: string) => {
    try {
      if (!checkInTime || !checkOutTime) return { actual: 0, expected: 8, overtime: 0, earlyLeave: 0 }
      
      const checkIn = new Date(checkInTime)
      const checkOut = new Date(checkOutTime)
      const diffMs = checkOut.getTime() - checkIn.getTime()
      const actualHours = diffMs / (1000 * 60 * 60)
      
      const expected = 8 // 10 AM to 6 PM = 8 hours
      const overtime = Math.max(0, actualHours - expected)
      const earlyLeave = checkOut.getHours() < OFFICE_END_TIME ? true : false
      
      return { 
        actual: Math.round(actualHours * 100) / 100, 
        expected, 
        overtime: Math.round(overtime * 100) / 100,
        earlyLeave 
      }
    } catch {
      return { actual: 0, expected: 8, overtime: 0, earlyLeave: false }
    }
  }

  const calculateStats = (data: any[]) => {
    if (data.length === 0) {
      return { present: 0, late: 0, absent: 0, earlyLeave: 0, overtime: 0, avgHours: 0 }
    }
    const present = data.filter(
      (r) => r.status === "checked-in" || r.status === "checked-out" || r.status === "present",
    ).length
    const late = data.filter((r) => isLate(r.checkInTime)).length
    const absent = data.filter((r) => r.status === "absent").length
    
    const earlyLeave = data.filter((r) => {
      const hours = calculateWorkingHours(r.checkInTime, r.checkOutTime)
      return hours.earlyLeave
    }).length
    
    const totalHours = data.reduce((acc, r) => {
      const hours = calculateWorkingHours(r.checkInTime, r.checkOutTime)
      return acc + hours.actual
    }, 0)
    const avgHours = data.length > 0 ? Math.round((totalHours / data.length) * 100) / 100 : 0
    
    const overtime = data.reduce((acc, r) => {
      const hours = calculateWorkingHours(r.checkInTime, r.checkOutTime)
      return acc + hours.overtime
    }, 0)
    
    return { present, late, absent, earlyLeave, overtime: Math.round(overtime * 100) / 100, avgHours }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
      case "checked-out":
      case "checked-in":
        return { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-500" }
      case "late":
        return { bg: "bg-yellow-100", text: "text-yellow-700", badge: "bg-yellow-500" }
      case "absent":
        return { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-500" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-500" }
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return "—"
    try {
      // Convert UTC to IST (UTC+5:30)
      const date = new Date(dateString)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      return istDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    } catch {
      return dateString
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    try {
      // Convert UTC to IST (UTC+5:30)
      const date = new Date(dateString)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
      return istDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return dateString
    }
  }

  const todayStats = calculateStats(todayRecords)

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  // Paginate previous records
  const totalPages = Math.ceil(previousRecords.length / RECORDS_PER_PAGE)
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE
    return previousRecords.slice(start, start + RECORDS_PER_PAGE)
  }, [previousRecords, currentPage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-destructive font-medium">Failed to load data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track and manage employee attendance</p>
        </div>
        <div className="w-full sm:w-auto">
          <AttendanceExport attendanceData={attendanceData} />
        </div>
      </div>

      {/* Stats Cards - Enhanced with new metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl border border-green-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-green-700 font-medium">Present Today</p>
              <p className="text-2xl sm:text-4xl font-bold text-green-900 mt-1 sm:mt-2">{todayStats.present}</p>
            </div>
            <div className="bg-green-200 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <CheckCircle className="h-5 sm:h-6 w-5 sm:w-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl border border-yellow-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-yellow-700 font-medium">Late Arrivals</p>
              <p className="text-2xl sm:text-4xl font-bold text-yellow-900 mt-1 sm:mt-2">{todayStats.late}</p>
              <p className="text-xs text-yellow-600 mt-1">After 10:15 AM</p>
            </div>
            <div className="bg-yellow-200 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <AlertCircle className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl border border-red-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-red-700 font-medium">Absent Today</p>
              <p className="text-2xl sm:text-4xl font-bold text-red-900 mt-1 sm:mt-2">{todayStats.absent}</p>
            </div>
            <div className="bg-red-200 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <Users className="h-5 sm:h-6 w-5 sm:w-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl border border-orange-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-orange-700 font-medium">Early Leave</p>
              <p className="text-2xl sm:text-4xl font-bold text-orange-900 mt-1 sm:mt-2">{todayStats.earlyLeave}</p>
              <p className="text-xs text-orange-600 mt-1">Before 6 PM</p>
            </div>
            <div className="bg-orange-200 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <Eye className="h-5 sm:h-6 w-5 sm:w-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-blue-700 font-medium">Avg Hours</p>
              <p className="text-2xl sm:text-4xl font-bold text-blue-900 mt-1 sm:mt-2">{todayStats.avgHours}</p>
              <p className="text-xs text-blue-600 mt-1">Target: 8 hrs</p>
            </div>
            <div className="bg-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
              <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Attendance Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
            Daily Attendance
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Today's attendance records - {formatDate(today)}
          </p>
        </div>

        {/* Filters - Mobile-optimized dropdown filters */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Employee Filter */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowEmployeeFilter(!showEmployeeFilter)}
                className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              >
                <span className="truncate">{filterEmployee ? filterEmployee : "All Employees"}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 transition-transform ${showEmployeeFilter ? "rotate-180" : ""}`}
                />
              </button>
              {showEmployeeFilter && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilterEmployee("")
                      setShowEmployeeFilter(false)
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    All Employees
                  </button>
                  {uniqueEmployees.map((emp) => (
                    <button
                      key={emp}
                      onClick={() => {
                        setFilterEmployee(emp)
                        setShowEmployeeFilter(false)
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-200"
                    >
                      {emp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filterEmployee && (
              <button
                onClick={() => setFilterEmployee("")}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Table - Mobile card view for small screens */}
        {todayRecords.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                      Employee
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                      Check-in
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                      Check-out
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                      Hours Worked
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todayRecords.map((record: any) => {
                    const late = isLate(record.checkInTime)
                    const hours = calculateWorkingHours(record.checkInTime, record.checkOutTime)
                    const statusLabel = late ? "late" : (record.status === "checked-out" ? "present" : record.status)
                    const colors = getStatusColor(statusLabel)
                    return (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div
                            className="flex items-center gap-2 sm:gap-3 hover:opacity-75 transition-opacity"
                            onClick={() => handleViewDetails(record)}
                          >
                            <Avatar className="h-8 sm:h-9 w-8 sm:w-9 border border-gray-200">
                              <AvatarImage src={record.photoData || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {(record.employeeName || record.name || "Unknown")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs sm:text-sm font-medium text-blue-600 underline truncate">
                              {record.employeeName || record.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-green-600">
                          {formatTime(record.checkInTime)}
                          {late && <span className="block text-xs text-yellow-600 font-semibold">Late</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                          {formatTime(record.checkOutTime)}
                          {hours.earlyLeave && <span className="block text-xs text-orange-600 font-semibold">Early</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                          <div>
                            <p>{hours.actual} hrs</p>
                            {hours.overtime > 0 && <p className="text-blue-600 text-xs">+{hours.overtime} OT</p>}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <Badge className={`${colors.badge} text-white border-0 capitalize text-xs`}>
                            {statusLabel}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {todayRecords.map((record: any) => {
                const colors = getStatusColor(record.status)
                const totalHours = record.totalHours || "—"
                return (
                  <div
                    key={record._id}
                    onClick={() => handleViewDetails(record)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
                          <AvatarImage src={record.photoData || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                            {(record.employeeName || record.name || "Unknown")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-blue-600 underline truncate">
                            {record.employeeName || record.name || "Unknown"}
                          </p>
                          <Badge className={`${colors.badge} text-white border-0 capitalize text-xs mt-1`}>
                            {record.status === "checked-out" ? "present" : record.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground">Check-in</p>
                        <p className="font-medium text-green-600">{formatTime(record.checkInTime)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground">Check-out</p>
                        <p className="font-medium">{formatTime(record.checkOutTime)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-medium">{totalHours}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              No attendance records for today{filterEmployee ? " for selected employee" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Attendance History Section */}
      {previousRecords.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
              Attendance History
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{previousRecords.length} previous records</p>
          </div>

          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Employee Filter */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowEmployeeFilter(!showEmployeeFilter)}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                >
                  <span className="truncate">{filterEmployee ? filterEmployee : "All Employees"}</span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-transform ${showEmployeeFilter ? "rotate-180" : ""}`}
                  />
                </button>
                {showEmployeeFilter && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setFilterEmployee("")
                        setShowEmployeeFilter(false)
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      All Employees
                    </button>
                    {uniqueEmployees.map((emp) => (
                      <button
                        key={emp}
                        onClick={() => {
                          setFilterEmployee(emp)
                          setShowEmployeeFilter(false)
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-200"
                      >
                        {emp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {(filterEmployee || filterDate) && (
                <button
                  onClick={() => {
                    setFilterEmployee("")
                    setFilterDate("")
                  }}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* History Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Employee
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Check-in
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Check-out
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Total Hours
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRecords.map((record: any) => {
                  const colors = getStatusColor(record.status)
                  const totalHours = record.totalHours || "—"
                  return (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                        {formatDate(record.date || record.createdAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div
                          className="flex items-center gap-2 sm:gap-3 hover:opacity-75 transition-opacity"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Avatar className="h-8 sm:h-9 w-8 sm:w-9 border border-gray-200">
                            <AvatarImage src={record.photoData || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                              {(record.employeeName || record.name || "Unknown")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs sm:text-sm font-medium text-blue-600 underline truncate">
                            {record.employeeName || record.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-green-600">
                        {formatTime(record.checkInTime)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                        {formatTime(record.checkOutTime)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                        {totalHours}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge className={`${colors.badge} text-white border-0 capitalize text-xs`}>
                          {record.status === "checked-out" ? "present" : record.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {paginatedRecords.map((record: any) => {
              const colors = getStatusColor(record.status)
              const totalHours = record.totalHours || "—"
              return (
                <div
                  key={record._id}
                  onClick={() => handleViewDetails(record)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-gray-200 flex-shrink-0">
                        <AvatarImage src={record.photoData || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                          {(record.employeeName || record.name || "Unknown")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-600 underline truncate">
                          {record.employeeName || record.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(record.date || record.createdAt)}</p>
                      </div>
                    </div>
                    <Badge className={`${colors.badge} text-white border-0 capitalize text-xs flex-shrink-0`}>
                      {record.status === "checked-out" ? "present" : record.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="font-medium text-green-600">{formatTime(record.checkInTime)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="font-medium">{formatTime(record.checkOutTime)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-muted-foreground">Total Hours</p>
                      <p className="font-medium">{totalHours}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {((currentPage - 1) * RECORDS_PER_PAGE) + 1} to {Math.min(currentPage * RECORDS_PER_PAGE, previousRecords.length)} of {previousRecords.length} records
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Analytics Section */}
      <AttendanceAnalytics
        records={attendanceData}
        isLate={isLate}
        calculateWorkingHours={calculateWorkingHours}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      {/* Attendance Detail Modal */}
      <AttendanceDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        allRecords={attendanceData}
      />
    </div>
  )
}

export default Attendance
