"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle, Clock, XCircle, AlertCircle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import LeaveRequestDialog from "@/components/LeaveRequestDialog" // Import LeaveRequestDialog component

const Leaves = () => {
  const [leaves, setLeaves] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")

  // Mock user data
  const currentUser = {
    id: "user123",
    name: "John Doe",
  }

  // Mock leave data
  const mockLeaves = [
    {
      _id: "1",
      employeeId: "user123",
      employeeName: "John Doe",
      leaveType: "sick",
      startDate: "2026-01-20",
      endDate: "2026-01-22",
      days: 3,
      reason: "Medical checkup",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2026-01-19",
      createdAt: "2026-01-19",
    },
    {
      _id: "2",
      employeeId: "user123",
      employeeName: "John Doe",
      leaveType: "casual",
      startDate: "2026-02-01",
      endDate: "2026-02-01",
      days: 1,
      reason: "Personal work",
      status: "pending",
      createdAt: "2026-01-19",
    },
    {
      _id: "3",
      employeeId: "user123",
      employeeName: "John Doe",
      leaveType: "paid",
      startDate: "2026-02-10",
      endDate: "2026-02-14",
      days: 5,
      reason: "Vacation",
      status: "rejected",
      approvedBy: "Admin",
      approvedDate: "2026-01-18",
      createdAt: "2026-01-15",
    },
  ]

  const mockLeaveBalance = {
    _id: "balance1",
    employeeId: "user123",
    employeeName: "John Doe",
    sickLeave: { total: 10, used: 3, remaining: 7 },
    casualLeave: { total: 12, used: 2, remaining: 10 },
    paidLeave: { total: 20, used: 5, remaining: 15 },
    year: 2026,
  }

  useEffect(() => {
    // Simulate data fetch with mock data
    setTimeout(() => {
      setLeaves(mockLeaves)
      setLeaveBalance(mockLeaveBalance)
    }, 500)
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      const data = await response.json()
      setLeaves(data)
    } catch (err) {
      console.error("Failed to fetch leaves:", err)
    }
  }

  const fetchLeaveBalance = async () => {
    try {
      const response = await fetch("/api/leaveBalance")
      const data = await response.json()
      setLeaveBalance(data)
    } catch (err) {
      console.error("Failed to fetch leave balance:", err)
    }
  }

  const handleLeaveSubmit = async (leaveData: any) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchLeaves()
        fetchLeaveBalance()
      }
    } catch (err) {
      console.error("Failed to submit leave request:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredLeaves = filterStatus === "all" ? leaves : leaves.filter((l) => l.status === filterStatus)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your leaves and view balance</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {leaveBalance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sick Leave */}
          <Card className="p-4 sm:p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-700">Sick Leave</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-2">
                  {leaveBalance.sickLeave.remaining}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {leaveBalance.sickLeave.used} of {leaveBalance.sickLeave.total} used
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </Card>

          {/* Casual Leave */}
          <Card className="p-4 sm:p-6 border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-700">Casual Leave</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-2">
                  {leaveBalance.casualLeave.remaining}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {leaveBalance.casualLeave.used} of {leaveBalance.casualLeave.total} used
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>

          {/* Paid Leave */}
          <Card className="p-4 sm:p-6 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-700">Paid Leave</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-2">
                  {leaveBalance.paidLeave.remaining}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {leaveBalance.paidLeave.used} of {leaveBalance.paidLeave.total} used
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              filterStatus === status
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading leaves...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No {filterStatus !== "all" ? `${filterStatus} ` : ""}leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Leave Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Date Range
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Days
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Reason
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <Badge className="capitalize bg-blue-100 text-blue-800 border-0">
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                      {leave.days} days
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                      {leave.reason}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <Badge className={`capitalize border-0 flex items-center gap-1 w-fit ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Leaves
