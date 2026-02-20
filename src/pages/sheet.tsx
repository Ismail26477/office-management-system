"use client"
import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Clock, AlertCircle, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { apiClient } from "@/lib/api"
import * as XLSX from "xlsx"

interface DailyTask {
  _id: string
  employeeId: string
  employeeName?: string
  date: string
  project: string
  workingTime: number
  taskDone: string
  researchDone: string
  remarks?: {
    managerRemarks?: string
    managerComplains?: string
  }
  approvalStatus: "approved" | "pending" | "rejected"
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

interface EditorSheet {
  _id: string
  employeeId: string
  employeeName: string
  sheetName: string
  title?: string
  content?: string
  author?: string
  lastModified?: string
  tasks?: any[]
  createdAt: string
  updatedAt: string
  link?: string
}

const Sheet = () => {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [editorSheets, setEditorSheets] = useState<EditorSheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [employees, setEmployees] = useState<string[]>([])
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [selectedSheetEmployee, setSelectedSheetEmployee] = useState<string>("")
  const [selectedSheetName, setSelectedSheetName] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [sheetEmployees, setSheetEmployees] = useState<string[]>([])
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedEditorSheet, setSelectedEditorSheet] = useState<EditorSheet | null>(null)
  const [isEditorSheetModalOpen, setIsEditorSheetModalOpen] = useState(false)
  const [taskStartDate, setTaskStartDate] = useState<string>("")
  const [taskEndDate, setTaskEndDate] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [tasksData, sheetsData] = await Promise.all([apiClient.getDailyTasks(), apiClient.getEditorSheets()])
        setDailyTasks(tasksData || [])
        setEditorSheets(sheetsData || [])

        // Extract unique employee names for task filtering
        const uniqueEmployees = Array.from(new Set(tasksData?.map((t) => t.employeeName || t.employeeId) || []))
        setEmployees(uniqueEmployees as string[])

        const uniqueSheetEmployees = Array.from(new Set(sheetsData?.map((s) => s.employeeName || s.employeeId) || []))
        const uniqueSheetNames = Array.from(new Set(sheetsData?.map((s) => s.sheetName || s.title) || []))
        setSheetEmployees(uniqueSheetEmployees as string[])
        setSheetNames(uniqueSheetNames as string[])
      } catch (err) {
        console.error("[v0] Failed to load sheet data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredAndSortedTasks = dailyTasks
    .filter(
      (task) => !selectedEmployee || task.employeeName === selectedEmployee || task.employeeId === selectedEmployee,
    )
    .filter((task) => {
      if (!taskStartDate || !taskEndDate) return true
      const taskDate = new Date(task.date)
      return taskDate >= new Date(taskStartDate) && taskDate <= new Date(taskEndDate)
    })
    .sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return (a.taskDone || "").localeCompare(b.taskDone || "")
    })

  const filteredEditorSheets = editorSheets
    .filter((sheet) => !selectedSheetEmployee || sheet.employeeName === selectedSheetEmployee)
    .filter((sheet) => !selectedSheetName || sheet.sheetName === selectedSheetName || sheet.title === selectedSheetName)
    .filter((sheet) => {
      if (!startDate || !endDate) return true
      const sheetDate = new Date(sheet.lastModified || sheet.createdAt)
      return sheetDate >= new Date(startDate) && sheetDate <= new Date(endDate)
    })
    .sort(
      (a, b) => new Date(b.lastModified || b.createdAt).getTime() - new Date(a.lastModified || a.createdAt).getTime(),
    )

  const handleTaskClick = (task: DailyTask) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleApproveTask = async (taskId: string) => {
    try {
      setApprovalLoading(true)
      const response = await fetch(`/api/daily-tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: "Admin",
        }),
      })
      if (!response.ok) throw new Error("Failed to approve task")

      // Update local state
      setDailyTasks(
        dailyTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                approvalStatus: "approved",
                approvedAt: new Date().toISOString(),
                approvedBy: "Admin",
              }
            : task,
        ),
      )

      // Update selected task
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({
          ...selectedTask,
          approvalStatus: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: "Admin",
        })
      }
    } catch (err) {
      console.error("[v0] Failed to approve task:", err)
      setError("Failed to approve task. Please try again.")
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleRejectTask = async (taskId: string) => {
    try {
      setApprovalLoading(true)
      const response = await fetch(`/api/daily-tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: "rejected",
          approvedAt: new Date().toISOString(),
          approvedBy: "Admin",
        }),
      })
      if (!response.ok) throw new Error("Failed to reject task")

      // Update local state
      setDailyTasks(
        dailyTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                approvalStatus: "rejected",
                approvedAt: new Date().toISOString(),
                approvedBy: "Admin",
              }
            : task,
        ),
      )

      // Update selected task
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({
          ...selectedTask,
          approvalStatus: "rejected",
          approvedAt: new Date().toISOString(),
          approvedBy: "Admin",
        })
      }
    } catch (err) {
      console.error("[v0] Failed to reject task:", err)
      setError("Failed to reject task. Please try again.")
    } finally {
      setApprovalLoading(false)
    }
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const handleEditorSheetClick = (sheet: EditorSheet) => {
    setSelectedEditorSheet(sheet)
    setIsEditorSheetModalOpen(true)
  }

  const exportDailyTasksToExcel = () => {
    const data = filteredAndSortedTasks.map((task) => ({
      Date: formatDate(task.date),
      Task: task.taskDone || "Untitled",
      Employee: task.employeeName || task.employeeId,
      Project: task.project,
      Hours: task.workingTime,
      Status: task.approvalStatus.charAt(0).toUpperCase() + task.approvalStatus.slice(1),
      "Manager Remarks": task.remarks?.managerRemarks || "-",
      "Manager Complains": task.remarks?.managerComplains || "-",
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Tasks")
    XLSX.writeFile(workbook, `daily-tasks-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const exportEditorSheetsToExcel = () => {
    const data = filteredEditorSheets.map((sheet) => ({
      Date: formatDate(sheet.updatedAt || sheet.createdAt),
      Title: sheet.title || "Untitled",
      Employee: sheet.employeeName || sheet.employeeId,
      "Sheet Name": sheet.sheetName,
      Author: sheet.author || "-",
      Link: sheet.link || "-",
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Editor Sheets")
    XLSX.writeFile(workbook, `editor-sheets-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading sheet data...</div>
  }

  if (error && !isModalOpen && !isEditorSheetModalOpen) {
    return <div className="flex items-center justify-center h-96 text-destructive">{error}</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sheet Management</h1>
          <p className="text-muted-foreground mt-1">View and manage daily tasks and editor sheets</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Sheet
        </Button>
      </div>

      {/* Daily Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daily Tasks</h2>
            <p className="text-sm text-muted-foreground">Employee daily work entries and approval status</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-border">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground block mb-2">Filter by Employee:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="text-sm font-medium text-foreground block mb-2">From Date:</label>
            <input
              type="date"
              value={taskStartDate}
              onChange={(e) => setTaskStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex-1 min-w-40">
            <label className="text-sm font-medium text-foreground block mb-2">To Date:</label>
            <input
              type="date"
              value={taskEndDate}
              onChange={(e) => setTaskEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedEmployee("")
                setTaskStartDate("")
                setTaskEndDate("")
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition text-sm font-medium"
            >
              Clear Filters
            </button>

            <button
              onClick={exportDailyTasksToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No daily tasks found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Task</TableHead>
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <TableCell className="font-medium">{formatDate(task.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.taskDone || "Untitled"}</TableCell>
                    <TableCell>{task.employeeName || task.employeeId}</TableCell>
                    <TableCell>{task.project}</TableCell>
                    <TableCell>{task.workingTime}h</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusBadgeColor(task.approvalStatus)}`}>
                        {task.approvalStatus.charAt(0).toUpperCase() + task.approvalStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(task)
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Editor Sheets Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Editor Sheets</h2>
          <p className="text-sm text-muted-foreground">Documents and sheets assigned for editing and review</p>
        </div>

        <div className="flex flex-wrap gap-4 items-end bg-muted/30 p-4 rounded-lg border border-border">
          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground block mb-2">Filter by Employee:</label>
            <select
              value={selectedSheetEmployee}
              onChange={(e) => setSelectedSheetEmployee(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="">All Employees</option>
              {sheetEmployees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="text-sm font-medium text-foreground block mb-2">Filter by Sheet:</label>
            <select
              value={selectedSheetName}
              onChange={(e) => setSelectedSheetName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="">All Sheets</option>
              {sheetNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="text-sm font-medium text-foreground block mb-2">From Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex-1 min-w-40">
            <label className="text-sm font-medium text-foreground block mb-2">To Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedSheetEmployee("")
                setSelectedSheetName("")
                setStartDate("")
                setEndDate("")
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition text-sm font-medium"
            >
              Clear Filters
            </button>

            <button
              onClick={exportEditorSheetsToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {filteredEditorSheets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No editor sheets found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Sheet Name</TableHead>
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Link</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEditorSheets.map((sheet) => (
                  <TableRow key={sheet._id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell>{formatDate(sheet.updatedAt || sheet.createdAt)}</TableCell>
                    <TableCell>{sheet.title || "-"}</TableCell>
                    <TableCell>{sheet.employeeName || sheet.employeeId}</TableCell>
                    <TableCell>{sheet.sheetName}</TableCell>
                    <TableCell>{sheet.author || "-"}</TableCell>
                    <TableCell>
                      {sheet.link ? (
                        <a
                          href={sheet.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm truncate max-w-xs block"
                        >
                          View Document
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditorSheetClick(sheet)
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {isEditorSheetModalOpen && selectedEditorSheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Sheet Details</h2>
                <p className="text-purple-100 mt-1">{selectedEditorSheet.title || selectedEditorSheet.sheetName}</p>
              </div>
              <button
                onClick={() => setIsEditorSheetModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Date Modified</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedEditorSheet.lastModified || selectedEditorSheet.createdAt)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Employee</p>
                  <p className="font-semibold text-gray-900">
                    {selectedEditorSheet.employeeName || selectedEditorSheet.employeeId}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Sheet Name</p>
                  <p className="font-semibold text-gray-900">{selectedEditorSheet.sheetName}</p>
                </div>
              </div>

              {/* Sheet Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sheet Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Title</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedEditorSheet.title || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Author</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedEditorSheet.author || "-"}</p>
                  </div>
                  {selectedEditorSheet.link && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-medium">Document Link</p>
                      <a
                        href={selectedEditorSheet.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium break-all bg-gray-50 rounded-lg p-3 block"
                      >
                        {selectedEditorSheet.link}
                      </a>
                    </div>
                  )}
                  {selectedEditorSheet.content && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-medium">Content</p>
                      <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedEditorSheet.content}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Count */}
              {selectedEditorSheet.tasks && selectedEditorSheet.tasks.length > 0 && (
                <div className="border-t pt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Associated Tasks</p>
                  <p className="font-semibold text-gray-900">
                    {selectedEditorSheet.tasks.length} task{selectedEditorSheet.tasks.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Action Buttons */}
            <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditorSheetModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Task Details */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Task Details</h2>
                <p className="text-blue-100 mt-1">{selectedTask.taskDone}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Key Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedTask.date)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Employee</p>
                  <p className="font-semibold text-gray-900">{selectedTask.employeeName || selectedTask.employeeId}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Project</p>
                  <p className="font-semibold text-gray-900">{selectedTask.project}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="font-semibold text-gray-900">{selectedTask.workingTime}h</p>
                </div>
              </div>

              {/* Task Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Task Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Task Done</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedTask.taskDone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Research Done</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedTask.researchDone || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              {(selectedTask.remarks?.managerRemarks || selectedTask.remarks?.managerComplains) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Manager Notes</h3>
                  <div className="space-y-4">
                    {selectedTask.remarks?.managerRemarks && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Remarks</p>
                        <p className="text-gray-900 bg-blue-50 rounded-lg p-3 border border-blue-200">
                          {selectedTask.remarks.managerRemarks}
                        </p>
                      </div>
                    )}
                    {selectedTask.remarks?.managerComplains && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">Complains</p>
                        <p className="text-gray-900 bg-red-50 rounded-lg p-3 border border-red-200">
                          {selectedTask.remarks.managerComplains}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Approval Status</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Status</p>
                      <Badge className={`text-sm ${getStatusBadgeColor(selectedTask.approvalStatus)}`}>
                        {selectedTask.approvalStatus.charAt(0).toUpperCase() + selectedTask.approvalStatus.slice(1)}
                      </Badge>
                    </div>
                    {selectedTask.approvedAt && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Approved On</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedTask.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>

              {selectedTask.approvalStatus !== "approved" && (
                <button
                  onClick={() => handleApproveTask(selectedTask._id)}
                  disabled={approvalLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {approvalLoading ? "Processing..." : "Approve"}
                </button>
              )}

              {selectedTask.approvalStatus !== "rejected" && (
                <button
                  onClick={() => handleRejectTask(selectedTask._id)}
                  disabled={approvalLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {approvalLoading ? "Processing..." : "Reject"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sheet
