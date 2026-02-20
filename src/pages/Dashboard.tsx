"use client"

import { useState, useEffect } from "react"
import {
  Users,
  FolderKanban,
  Building2,
  IndianRupee,
  CheckCircle2,
  UserPlus,
  Briefcase,
  TrendingUp,
  Target,
  CalendarIcon,
  X,
} from "lucide-react"
import { KPICard } from "@/components/dashboard/KPICard"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { PerformanceChart } from "@/components/dashboard/PerformanceChart"
import { HoursWorkedChart } from "@/components/dashboard/HoursWorkedChart"
import { TeamMembersList } from "@/components/dashboard/TeamMembersList"
import { TasksList } from "@/components/dashboard/TasksList"
import { NotificationsFeed } from "@/components/dashboard/NotificationsFeed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { fetchEmployeeStats, fetchEmployees } from "@/api/employees"
import { fetchProjects } from "@/api/projects"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const [employeeMetrics, setEmployeeMetrics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    averageSalary: 0,
    departmentDistribution: [],
  })
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        console.log("[v0] Loading dashboard data...")
        const [employees, stats, projectsData] = await Promise.all([
          fetchEmployees(),
          fetchEmployeeStats(),
          fetchProjects(),
        ])

        console.log("[v0] Employees fetched:", employees.length)
        console.log("[v0] Stats fetched:", stats)
        console.log("[v0] Projects fetched:", projectsData.length)

        // Prefer stats endpoint data, fallback to calculated values
        const totalEmployees = stats?.totalEmployees || employees.length
        const presentToday = stats?.presentToday || 0
        const onLeave = stats?.onLeave || 0

        let averageSalary = 0
        if (stats?.averageSalary) {
          averageSalary = stats.averageSalary
        } else if (employees.length > 0) {
          averageSalary = employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0) / employees.length
        }

        setEmployeeMetrics({
          totalEmployees,
          presentToday,
          onLeave,
          averageSalary,
          departmentDistribution: stats?.departmentDistribution || [],
        })

        setProjects(projectsData || [])

        console.log("[v0] Employee metrics updated:", {
          totalEmployees,
          presentToday,
          onLeave,
          averageSalary,
        })
        console.log("[v0] Projects state updated with", projectsData?.length || 0, "projects")
      } catch (error) {
        console.error("[v0] Error loading dashboard data:", error)
        setEmployeeMetrics({
          totalEmployees: 0,
          presentToday: 0,
          onLeave: 0,
          averageSalary: 0,
          departmentDistribution: [],
        })
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Tabs - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <TabsList className="bg-muted/50 w-full sm:w-auto">
                <TabsTrigger
                  value="overview"
                  className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Deals
                </TabsTrigger>
                <TabsTrigger
                  value="employee"
                  className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Employee
                </TabsTrigger>
              </TabsList>

              <Button
                variant={showCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start text-xs sm:text-sm"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
            </div>

            {/* Calendar Panel - Mobile optimized */}
            {showCalendar && (
              <div className="mt-3 sm:mt-4 bg-card rounded-lg sm:rounded-xl border border-border/50 shadow-sm p-3 sm:p-4 animate-scale-in">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Select Date</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
                <KPICard
                  title="Attendance Rate"
                  value="92%"
                  change={2.5}
                  icon={Users}
                  iconColor="text-success"
                  iconBgColor="bg-success/10"
                  delay={0}
                />
                <KPICard
                  title="Total Projects"
                  value="24"
                  change={8}
                  icon={FolderKanban}
                  iconColor="text-primary"
                  iconBgColor="bg-primary/10"
                  delay={1}
                />
                <KPICard
                  title="Total Clients"
                  value="156"
                  change={12}
                  icon={Building2}
                  iconColor="text-purple"
                  iconBgColor="bg-purple/10"
                  delay={2}
                />
                <KPICard
                  title="Revenue"
                  value="₹23.4L"
                  change={15.3}
                  icon={IndianRupee}
                  iconColor="text-accent"
                  iconBgColor="bg-accent/10"
                  delay={3}
                />
                <KPICard
                  title="Tasks Completed"
                  value="847"
                  change={5.2}
                  icon={CheckCircle2}
                  iconColor="text-info"
                  iconBgColor="bg-info/10"
                  delay={4}
                />
                <KPICard
                  title="New Hires"
                  value="12"
                  change={-3}
                  icon={UserPlus}
                  iconColor="text-warning"
                  iconBgColor="bg-warning/10"
                  delay={5}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <AttendanceChart />
                <PerformanceChart />
                <HoursWorkedChart />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <TeamMembersList />
                <TasksList />
                <NotificationsFeed />
              </div>
            </TabsContent>

            {/* Deals Dashboard Tab */}
            <TabsContent value="deals" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <KPICard
                  title="Total Deals"
                  value="48"
                  change={12}
                  icon={Briefcase}
                  iconColor="text-primary"
                  iconBgColor="bg-primary/10"
                  delay={0}
                />
                <KPICard
                  title="Won Deals"
                  value="32"
                  change={8.5}
                  icon={Target}
                  iconColor="text-success"
                  iconBgColor="bg-success/10"
                  delay={1}
                />
                <KPICard
                  title="Pipeline Value"
                  value="₹1.2Cr"
                  change={18}
                  icon={TrendingUp}
                  iconColor="text-info"
                  iconBgColor="bg-info/10"
                  delay={2}
                />
                <KPICard
                  title="Closed Revenue"
                  value="₹85L"
                  change={22.5}
                  icon={IndianRupee}
                  iconColor="text-accent"
                  iconBgColor="bg-accent/10"
                  delay={3}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-card rounded-lg sm:rounded-xl border border-border/50 shadow-sm p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-4">Recent Deals</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {projects.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3">No projects found</p>
                    ) : (
                      projects.slice(0, 4).map((project: any) => (
                        <div
                          key={project._id || project.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-muted/30 rounded-lg gap-2"
                        >
                          <div>
                            <p className="font-medium text-foreground text-xs sm:text-sm">{project.name || "Unnamed Project"}</p>
                            <p className="text-xs text-muted-foreground">
                              {project.budget ? `₹${project.budget}` : "No budget info"}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 w-fit",
                              (project.status === "completed" || project.status === "Won") && "bg-success/10 text-success",
                              (project.status === "in_progress" || project.status === "In Progress") && "bg-info/10 text-info",
                              (project.status === "pending" || project.status === "Negotiation") && "bg-warning/10 text-warning",
                              !["completed", "in_progress", "pending", "Won", "In Progress", "Negotiation"].includes(
                                project.status
                              ) && "bg-muted/50 text-muted-foreground",
                            )}
                          >
                            {project.status || "Pending"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <PerformanceChart />
              </div>
            </TabsContent>

            {/* Employee Dashboard Tab */}
            <TabsContent value="employee" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <KPICard
                  title="Total Employees"
                  value={isLoading ? "-" : employeeMetrics.totalEmployees.toString()}
                  change={5}
                  icon={Users}
                  iconColor="text-primary"
                  iconBgColor="bg-primary/10"
                  delay={0}
                />
                <KPICard
                  title="Present Today"
                  value={isLoading ? "-" : employeeMetrics.presentToday.toString()}
                  change={2.1}
                  icon={CheckCircle2}
                  iconColor="text-success"
                  iconBgColor="bg-success/10"
                  delay={1}
                />
                <KPICard
                  title="On Leave"
                  value={isLoading ? "-" : employeeMetrics.onLeave.toString()}
                  change={-12}
                  icon={CalendarIcon}
                  iconColor="text-warning"
                  iconBgColor="bg-warning/10"
                  delay={2}
                />
                <KPICard
                  title="Avg Salary"
                  value={isLoading ? "-" : `₹${(employeeMetrics.averageSalary / 100000).toFixed(1)}L`}
                  change={6}
                  icon={IndianRupee}
                  iconColor="text-accent"
                  iconBgColor="bg-accent/10"
                  delay={3}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                <AttendanceChart />
                <TeamMembersList />
                <div className="bg-card rounded-lg sm:rounded-xl border border-border/50 shadow-sm p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-4">Department Distribution</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {isLoading || employeeMetrics.departmentDistribution.length === 0
                      ? [
                          { dept: "Engineering", count: 52, color: "bg-primary" },
                          { dept: "Design", count: 18, color: "bg-purple" },
                          { dept: "Marketing", count: 24, color: "bg-info" },
                          { dept: "Sales", count: 32, color: "bg-success" },
                          { dept: "HR", count: 12, color: "bg-warning" },
                          { dept: "Finance", count: 18, color: "bg-accent" },
                        ].map((dept, i) => (
                          <div key={i} className="flex items-center gap-2 sm:gap-3">
                            <div className={cn("w-2 sm:w-3 h-2 sm:h-3 rounded-full flex-shrink-0", dept.color)} />
                            <span className="flex-1 text-xs sm:text-sm text-foreground">{dept.dept}</span>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">
                              {dept.count}
                            </span>
                          </div>
                        ))
                      : employeeMetrics.departmentDistribution.map((dept: any, i: number) => {
                          const colors = ["bg-primary", "bg-purple", "bg-info", "bg-success", "bg-warning", "bg-accent"]
                          return (
                            <div key={i} className="flex items-center gap-2 sm:gap-3">
                              <div
                                className={cn(
                                  "w-2 sm:w-3 h-2 sm:h-3 rounded-full flex-shrink-0",
                                  colors[i % colors.length],
                                )}
                              />
                              <span className="flex-1 text-xs sm:text-sm text-foreground">{dept.name}</span>
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground flex-shrink-0">
                                {dept.count}
                              </span>
                            </div>
                          )
                        })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
