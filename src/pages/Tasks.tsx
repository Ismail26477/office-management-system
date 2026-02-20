"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Calendar, GripVertical, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TaskData {
  _id?: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  assignee: {
    _id: string
    name: string
    avatar?: string
    role?: string
  }
  dueDate: string
  tags: string[]
  status: "todo" | "inProgress" | "completed"
  createdAt?: string
  updatedAt?: string
}

interface Employee {
  _id: string
  name: string
  email: string
  role: string
  avatar?: string
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "inProgress", title: "In Progress", color: "bg-info" },
  { id: "completed", title: "Completed", color: "bg-success" },
]

const priorityStyles = {
  high: "status-destructive",
  medium: "status-warning",
  low: "status-success",
}

const tagColors = [
  "bg-primary/10 text-primary",
  "bg-purple/10 text-purple",
  "bg-accent/10 text-accent",
  "bg-warning/10 text-warning",
  "bg-info/10 text-info",
]

const Tasks = () => {
  const [tasks, setTasks] = useState<Record<string, TaskData[]>>({
    todo: [],
    inProgress: [],
    completed: [],
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<{ task: TaskData; sourceColumn: string } | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assigneeId: "",
    dueDate: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks")
        const tasksData = await tasksResponse.json()

        // Fetch employees
        const employeesResponse = await fetch("/api/employees")
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)

        // Group tasks by status
        const groupedTasks = {
          todo: tasksData.filter((t: TaskData) => t.status === "todo"),
          inProgress: tasksData.filter((t: TaskData) => t.status === "inProgress"),
          completed: tasksData.filter((t: TaskData) => t.status === "completed"),
        }
        setTasks(groupedTasks)
      } catch (error) {
        console.error("[v0] Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSaveTask = async () => {
    if (!formData.title || !formData.assigneeId || !formData.dueDate) {
      alert("Please fill in all required fields")
      return
    }

    const selectedEmployee = employees.find((e) => e._id === formData.assigneeId)
    if (!selectedEmployee) return

    const taskPayload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      assignee: {
        _id: selectedEmployee._id,
        name: selectedEmployee.name,
        avatar: selectedEmployee.avatar,
        role: selectedEmployee.role,
      },
      dueDate: formData.dueDate,
      tags: [],
      status: editingTask ? editingTask.status : "todo",
    }

    try {
      if (editingTask && editingTask._id) {
        // Update existing task
        const response = await fetch(`/api/tasks/${editingTask._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        })
        if (!response.ok) throw new Error("Failed to update task")

        // Update local state
        setTasks((prev) => {
          const newTasks = { ...prev }
          Object.keys(newTasks).forEach((col) => {
            newTasks[col] = newTasks[col].map((t) => (t._id === editingTask._id ? { ...t, ...taskPayload } : t))
          })
          return newTasks
        })
      } else {
        // Create new task
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        })
        if (!response.ok) throw new Error("Failed to create task")
        const newTask = await response.json()

        setTasks((prev) => ({
          ...prev,
          todo: [...prev.todo, newTask],
        }))
      }

      // Reset form
      setFormData({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "" })
      setEditingTask(null)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error saving task:", error)
      alert("Failed to save task")
    }
  }

  const handleDeleteTask = async (task: TaskData, sourceColumn: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete task")

      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter((t) => t._id !== task._id),
      }))
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
      alert("Failed to delete task")
    }
  }

  const handleEditTask = (task: TaskData) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeId: task.assignee._id,
      dueDate: task.dueDate,
    })
    setIsCreateDialogOpen(true)
  }

  const handleDragStart = (task: TaskData, sourceColumn: string) => {
    setDraggedTask({ task, sourceColumn })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetColumn: string) => {
    if (!draggedTask) return

    const { task, sourceColumn } = draggedTask
    if (sourceColumn === targetColumn) {
      setDraggedTask(null)
      return
    }

    // Update UI optimistically
    setTasks((prev) => {
      const newTasks = { ...prev }
      newTasks[sourceColumn] = prev[sourceColumn].filter((t) => t._id !== task._id)
      newTasks[targetColumn] = [...prev[targetColumn], { ...task, status: targetColumn as any }]
      return newTasks
    })

    // Update database
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetColumn }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update task status")
      }
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
      // Revert on error
      loadTasks()
    }

    setDraggedTask(null)
  }

  const loadTasks = async () => {
    try {
      const tasksResponse = await fetch("/api/tasks")
      const tasksData = await tasksResponse.json()
      const groupedTasks = {
        todo: tasksData.filter((t: TaskData) => t.status === "todo"),
        inProgress: tasksData.filter((t: TaskData) => t.status === "inProgress"),
        completed: tasksData.filter((t: TaskData) => t.status === "completed"),
      }
      setTasks(groupedTasks)
    } catch (error) {
      console.error("[v0] Failed to reload tasks:", error)
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingTask(null)
    setFormData({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${Object.values(tasks).flat().length} tasks total`}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {editingTask ? "Update the task details." : "Add a new task to your board."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee *</Label>
                  <Select
                    value={formData.assigneeId}
                    onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>{editingTask ? "Update Task" : "Create Task"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-muted/30 rounded-xl p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-3 h-3 rounded-full", column.color)} />
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {tasks[column.id]?.length || 0}
              </Badge>
            </div>

            <div className="space-y-3">
              {tasks[column.id]?.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  className="bg-card rounded-lg border border-border/50 p-4 shadow-sm cursor-move hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground text-sm line-clamp-2">{task.title}</h4>
                        <Badge className={cn("status-pill flex-shrink-0", priorityStyles[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {task.tags?.map((tag, i) => (
                          <span
                            key={tag}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              tagColors[i % tagColors.length],
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {task.assignee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">
                              {task.assignee.name}
                            </span>
                            {task.assignee.role && (
                              <span className="text-xs text-muted-foreground block truncate">{task.assignee.role}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEditTask(task)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTask(task, column.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                className="w-full border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                onClick={() => {
                  setEditingTask(null)
                  setFormData({ title: "", description: "", priority: "medium", assigneeId: "", dueDate: "" })
                  setIsCreateDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks
