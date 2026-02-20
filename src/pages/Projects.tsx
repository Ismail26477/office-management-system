"use client"

import { useState, useEffect } from "react"
import { LayoutGrid, List, Plus, Calendar, MoreHorizontal, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewProjectDialog } from "@/components/projects/NewProjectDialog"
import { ManageTeamDialog } from "@/components/projects/ManageTeamDialog"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"

const priorityStyles = {
  high: "status-destructive",
  medium: "status-warning",
  low: "status-success",
}

const statusStyles = {
  in_progress: "status-info",
  completed: "status-success",
  on_hold: "status-warning",
}

const statusLabels = {
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
}

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showManageTeamDialog, setShowManageTeamDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("[v0] Fetching projects from API...")
        const data = await apiClient.getProjects()
        console.log("[v0] Projects received:", data)
        setProjects(data)
      } catch (error) {
        console.error("[v0] Failed to load projects:", error)
        setError("Failed to load projects. Please ensure the backend is running and data is seeded.")
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      })
      if (!response.ok) throw new Error("Failed to create project")
      const newProject = await response.json()
      setProjects([...projects, newProject])
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Failed to create project")
    }
  }

  const handleUpdateTeam = async (projectId: string, team: any[]) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team }),
      })
      if (!response.ok) throw new Error("Failed to update team")
      setProjects(projects.map((p) => (p._id === projectId ? { ...p, team } : p)))
      alert("Team updated successfully")
    } catch (error) {
      console.error("Error updating team:", error)
      alert("Failed to update team")
    }
  }

  const openManageTeam = (project: any) => {
    setSelectedProject(project)
    setShowManageTeamDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button className="gap-2" onClick={() => setShowNewProjectDialog(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        onCreateProject={handleCreateProject}
      />

      {selectedProject && (
        <ManageTeamDialog
          open={showManageTeamDialog}
          onOpenChange={setShowManageTeamDialog}
          project={selectedProject}
          onUpdateTeam={handleUpdateTeam}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <Button className="gap-2" onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4" />
            Create Your First Project
          </Button>
        </div>
      )}

      {/* Projects Grid/List */}
      {!loading && projects.length > 0 && (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4")}>
          {projects.map((project, index) => (
            <div
              key={project._id || project.id || index}
              className={cn(
                "bg-card rounded-xl border border-border/50 shadow-sm p-5 opacity-0 animate-slide-up hover:shadow-md transition-all",
                viewMode === "list" && "flex items-center gap-6",
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
            >
              <div className={cn("flex-1", viewMode === "list" && "flex items-center gap-6")}>
                <div className={cn(viewMode === "list" && "flex-1")}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openManageTeam(project)}>Manage Team</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      className={cn("status-pill", priorityStyles[project.priority as keyof typeof priorityStyles])}
                    >
                      {project.priority}
                    </Badge>
                    <Badge className={cn("status-pill", statusStyles[project.status as keyof typeof statusStyles])}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>

                <div className={cn(viewMode === "list" && "w-48")}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between mt-4 pt-4 border-t border-border/50",
                    viewMode === "list" && "mt-0 pt-0 border-0 w-64",
                  )}
                >
                  <div className="flex flex-col gap-2 flex-1">
                    {project.team && project.team.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Team ({project.team.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {project.team.slice(0, 2).map((member: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full text-xs"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{member.name?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              <span className="max-w-[100px] truncate">{member.name || "Unknown"}</span>
                            </div>
                          ))}
                          {project.team.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.team.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {project.tasks?.completed || 0}/{project.tasks?.total || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {project.deadline}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
