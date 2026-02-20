"use client"

import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FolderKanban,
  CheckSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  SheetIcon,
  X,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Employees", icon: Users, path: "/employees" },
  { name: "Attendance", icon: Calendar, path: "/attendance" },
  { name: "Leaves", icon: AlertCircle, path: "/leaves" },
  { name: "Reports", icon: BarChart3, path: "/reports" },
  { name: "Projects", icon: FolderKanban, path: "/projects" },
  { name: "Tasks", icon: CheckSquare, path: "/tasks" },
  { name: "Sheet", icon: SheetIcon, path: "/sheet" },
  { name: "Invoices", icon: FileText, path: "/invoices" },
  { name: "Calendar", icon: Calendar, path: "/calendar" },
  { name: "Notifications", icon: Bell, path: "/notifications" },
  { name: "Settings", icon: Settings, path: "/settings" },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileMenuOpen: boolean
  onMobileMenuClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onMobileMenuClose} aria-hidden="true" />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 lg:z-auto h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          "lg:h-screen lg:overflow-y-auto",
          mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
          <div className={cn("flex items-center gap-3", collapsed && !mobileMenuOpen && "justify-center w-full")}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            {(!collapsed || mobileMenuOpen) && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg text-foreground">Veda AI</h1>
                <p className="text-xs text-muted-foreground">Office Management</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={mobileMenuOpen ? onMobileMenuClose : onToggle}
            className="text-muted-foreground hover:text-foreground lg:relative absolute right-2"
            aria-label={mobileMenuOpen ? "Close menu" : "Toggle sidebar"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          {collapsed && !mobileMenuOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border shadow-sm h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hidden lg:flex"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={mobileMenuOpen ? onMobileMenuClose : undefined}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active",
                  collapsed && !mobileMenuOpen && "justify-center px-3",
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                {(!collapsed || mobileMenuOpen) && <span className="animate-fade-in">{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile */}
        <div
          className={cn(
            "p-4 border-t border-sidebar-border flex-shrink-0",
            collapsed && !mobileMenuOpen && "flex justify-center",
          )}
        >
          {collapsed && !mobileMenuOpen ? (
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center gap-3 animate-fade-in">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
