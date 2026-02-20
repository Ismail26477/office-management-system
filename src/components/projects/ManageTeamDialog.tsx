"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Employee } from "@/types/database"

interface ManageTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: any
  onUpdateTeam: (projectId: string, team: any[]) => Promise<void>
}

export function ManageTeamDialog({ open, onOpenChange, project, onUpdateTeam }: ManageTeamDialogProps) {
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])

  useEffect(() => {
    if (open && project) {
      fetchEmployees()
      // Initialize selected team with current project members
      setSelectedTeam(project.team?.map((member: any) => member.employeeId || member._id) || [])
    }
  }, [open, project])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/employees")
      if (!response.ok) throw new Error("Failed to fetch employees")
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const toggleTeamMember = (employeeId: string) => {
    setSelectedTeam((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const handleUpdateTeam = async () => {
    setLoading(true)
    try {
      const selectedEmployees = employees.filter((emp) => selectedTeam.includes(emp._id))

      const updatedTeam = selectedEmployees.map((emp) => ({
        employeeId: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        avatar: emp.avatar,
      }))

      await onUpdateTeam(project._id, updatedTeam)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Team - {project?.name}</DialogTitle>
          <DialogDescription>Add or remove team members from this project</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Select Team Members</label>
            <Badge variant="secondary">{selectedTeam.length} selected</Badge>
          </div>

          <div className="bg-secondary/30 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No employees available</p>
            ) : (
              employees.map((employee) => (
                <div
                  key={employee._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => toggleTeamMember(employee._id)}
                >
                  <Checkbox
                    checked={selectedTeam.includes(employee._id)}
                    onCheckedChange={() => toggleTeamMember(employee._id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{employee.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {employee.role}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {selectedTeam.length > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Team:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTeam.map((employeeId) => {
                  const emp = employees.find((e) => e._id === employeeId)
                  return (
                    <Badge key={employeeId} variant="secondary" className="cursor-pointer">
                      {emp?.name}
                      <button
                        className="ml-1 text-xs hover:text-destructive"
                        onClick={() => toggleTeamMember(employeeId)}
                      >
                        ×
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTeam} disabled={loading}>
            {loading ? "Updating..." : "Update Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
