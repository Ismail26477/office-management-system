"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Calendar, TrendingUp, Users, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmployeeDetailModal } from "@/components/reports/EmployeeDetailModal"
import { downloadReport } from "@/utils/downloadReport" // Import the downloadReport function

const Reports = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")
  const [reportData, setReportData] = useState<any>(null)
  const [allEmployeesData, setAllEmployeesData] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [overallStats, setOverallStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)

  const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"]

  useEffect(() => {
    fetchReportData()
  }, [period])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/reports?period=${period}&type=summary`)
      if (!response.ok) {
        throw new Error("Failed to fetch report data")
      }

      const data = await response.json()

      setAllEmployeesData(data.employees || [])
      setTrends(data.trends || [])
      setOverallStats(data.overallStats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const chartData = allEmployeesData.slice(0, 10).map((emp) => ({
    name: emp.employeeName,
    present: emp.presentDays,
    absent: emp.absentDays,
    late: emp.lateDays,
    percentage: emp.attendancePercentage,
  }))

  const attendanceStats = {
    totalEmployees: allEmployeesData.length,
    avgAttendance: allEmployeesData.length > 0 ? (allEmployeesData.reduce((sum, e) => sum + e.attendancePercentage, 0) / allEmployeesData.length).toFixed(1) : 0,
    totalPresent: allEmployeesData.reduce((sum, e) => sum + e.presentDays, 0),
    totalAbsent: allEmployeesData.reduce((sum, e) => sum + e.absentDays, 0),
    totalLate: allEmployeesData.reduce((sum, e) => sum + e.lateDays, 0),
    avgHours: allEmployeesData.length > 0 ? (allEmployeesData.reduce((sum, e) => sum + (e.avgHoursPerDay || 0), 0) / allEmployeesData.length).toFixed(2) : 0,
  }

  const pieChartData = overallStats
    ? [
        { name: "Avg Attendance %", value: overallStats.avgAttendance },
        { name: "Absent %", value: 100 - overallStats.avgAttendance },
      ]
    : []

  const handleDownloadReport = () => {
    if (!allEmployeesData.length) return

    let csvContent = `Attendance Report - ${period.toUpperCase()}\n\n`
    csvContent += "Employee,Present Days,Absent Days,Late Days,Early Leave,Total Hours,Expected Hours,Attendance %\n"

    allEmployeesData.forEach((emp: any) => {
      csvContent += `${emp.employeeName},${emp.presentDays},${emp.absentDays},${emp.lateDays},${emp.earlyLeaveDays},${emp.totalHours},${emp.expectedHours},${emp.attendancePercentage}%\n`
    })

    const element = document.createElement("a")
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`)
    element.setAttribute("download", `attendance_report_${period}.csv`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleEmployeeClick = (empName: string) => {
    setSelectedEmployee(empName)
    setShowEmployeeModal(true)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Attendance Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Analyze attendance patterns and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadReport} variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-muted-foreground">
          <p>Loading report data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && overallStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Employees</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-2">{overallStats.totalEmployees}</p>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <p className="text-xs sm:text-sm text-green-700 font-medium">Avg Attendance</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-2">{overallStats.avgAttendance}%</p>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <p className="text-xs sm:text-sm text-emerald-700 font-medium">Avg Hours/Day</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-2">{overallStats.avgHours}</p>
          </Card>

          <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <p className="text-xs sm:text-sm text-purple-700 font-medium">Total Records</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-2">{overallStats.totalRecords}</p>
          </Card>
        </div>
      )}

      {/* Charts */}
      {!loading && allEmployeesData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance by Employee - Bar Chart */}
          <Card className="lg:col-span-2 p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-foreground mb-4">Attendance by Employee</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Attendance Overview - Pie Chart */}
          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-foreground mb-4">Overall Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Attendance Percentage Trend */}
      {!loading && allEmployeesData.length > 0 && (
        <Card className="p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Percentage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Detailed Table */}
      {!loading && allEmployeesData.length > 0 && (
        <Card className="p-6 border border-gray-200 overflow-hidden">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Department</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Total Days</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Late</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Total Hours</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Avg Hours/Day</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allEmployeesData.map((emp) => (
                  <tr key={emp.employeeName} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleEmployeeClick(emp.employeeName)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                      >
                        {emp.employeeName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm text-muted-foreground">{emp.department || "—"}</td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm font-medium">{emp.totalDays}</td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-green-600 font-medium">
                      {emp.presentDays}
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-red-600 font-medium">
                      {emp.absentDays}
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-yellow-600 font-medium">
                      {emp.lateDays}
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm font-medium">
                      {emp.totalHours || 0}h
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm font-medium text-blue-600">
                      {emp.avgHoursPerDay || 0}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={`${
                          emp.attendancePercentage >= 90
                            ? "bg-green-100 text-green-800"
                            : emp.attendancePercentage >= 75
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        } border-0`}
                      >
                        {emp.attendancePercentage.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        isOpen={showEmployeeModal}
        employeeName={selectedEmployee}
        onClose={() => {
          setShowEmployeeModal(false)
          setSelectedEmployee(null)
        }}
      />
    </div>
  )
}

export default Reports
