'use client';

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface LeaveRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  employeeId: string
  employeeName: string
  onSubmit: (leaveData: any) => void
  loading?: boolean
}

export function LeaveRequestDialog({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSubmit,
  loading = false,
}: LeaveRequestDialogProps) {
  const [leaveType, setLeaveType] = useState<"sick" | "casual" | "paid">("casual")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      setError("Please select start and end dates")
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date")
      return
    }

    if (!reason.trim()) {
      setError("Please provide a reason for leave")
      return
    }

    onSubmit({
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
    })

    // Reset form
    setLeaveType("casual")
    setStartDate("")
    setEndDate("")
    setReason("")
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Request Leave</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Employee</Label>
            <p className="text-sm text-gray-600 mt-1">{employeeName}</p>
          </div>

          <div>
            <Label htmlFor="leave-type" className="text-sm font-medium">
              Leave Type
            </Label>
            <Select value={leaveType} onValueChange={(value: any) => setLeaveType(value)}>
              <SelectTrigger id="leave-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="paid">Paid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for leave..."
              className="mt-1 resize-none"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
