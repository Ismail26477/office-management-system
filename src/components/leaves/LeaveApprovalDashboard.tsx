"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LeaveApprovalDashboardProps {
  onApprovalChange?: () => void
}

export function LeaveApprovalDashboard({ onApprovalChange }: LeaveApprovalDashboardProps) {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingLeaves()
  }, [])

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/leaves?status=pending")
      if (response.ok) {
        const data = await response.json()
        setPendingLeaves(data)
      }
    } catch (err) {
      console.error("Failed to fetch pending leaves:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (leaveId: string, employeeId: string, leaveType: string, days: number) => {
    try {
      setApprovingId(leaveId)

      // Update leave status
      const leaveResponse = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          approvedBy: "admin",
        }),
      })

      if (leaveResponse.ok) {
        // Update leave balance
        await fetch(`/api/leaves/balance/${employeeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaveType,
            daysUsed: days,
          }),
        })

        fetchPendingLeaves()
        onApprovalChange?.()
      }
    } catch (err) {
      console.error("Failed to approve leave:", err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (leaveId: string) => {
    try {
      setApprovingId(leaveId)
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          approvedBy: "admin",
        }),
      })

      if (response.ok) {
        fetchPendingLeaves()
        onApprovalChange?.()
      }
    } catch (err) {
      console.error("Failed to reject leave:", err)
    } finally {
      setApprovingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading pending leaves...</div>
  }

  if (pendingLeaves.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No pending leave requests</p>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-foreground">Pending Leave Approvals</h3>
        <p className="text-sm text-muted-foreground mt-1">{pendingLeaves.length} requests awaiting approval</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                Employee
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                Type
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
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pendingLeaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                  {leave.employeeName}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <Badge className="capitalize bg-blue-100 text-blue-800 border-0 text-xs">
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
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 gap-1 bg-transparent"
                      onClick={() => handleApprove(leave._id, leave.employeeId, leave.leaveType, leave.days)}
                      disabled={approvingId !== null}
                    >
                      <Check className="w-3 h-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1 bg-transparent"
                      onClick={() => handleReject(leave._id)}
                      disabled={approvingId !== null}
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
