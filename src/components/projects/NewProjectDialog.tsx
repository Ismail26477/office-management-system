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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { Employee } from "@/types/database"

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (projectData: any) => Promise<void>
}

export function NewProjectDialog({ open, onOpenChange, onCreateProject }: NewProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: "in_progress",
    deadline: "",
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
    }
  }, [open])

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

  const handleCreate = async () => {
    if (!formData.name || !formData.deadline || selectedTeam.length === 0) {
      alert("Please fill in all required fields and select at least one team member")
      return
    }

    setLoading(true)
    try {
      const selectedEmployees = employees.filter((emp) => selectedTeam.includes(emp._id))

      const projectPayload = {
        id: `proj-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline,
        progress: 0,
        team: selectedEmployees.map((emp) => ({
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          avatar: emp.avatar,
        })),
        tasks: {
          total: 0,
          completed: 0,
        },
      }

      await onCreateProject(projectPayload)

      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: "medium",
        status: "in_progress",
        deadline: "",
      })
      setSelectedTeam([])
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Create a new project and assign team members to work on it</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Basic Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Deadline <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project goals and scope"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Team Assignment Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Assign Team Members <span className="text-destructive">*</span>
              </Label>
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
                <p className="text-xs font-medium text-muted-foreground mb-2">Selected Team Members:</p>
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

          {/* Info Box */}
          <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <p className="text-xs text-foreground">
              <span className="font-semibold">Tip:</span> You can add or remove team members from the "Manage Team"
              option after creating the project.
            </p>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
