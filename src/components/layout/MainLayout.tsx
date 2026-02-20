"use client"

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/notifications": "Notifications",
  "/settings": "Settings",
}

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || "Dashboard"

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr] w-full min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-col w-full min-h-screen lg:overflow-hidden">
        <Header
          onMenuClick={() => {
            if (window.innerWidth < 1024) {
              setMobileMenuOpen(!mobileMenuOpen)
            } else {
              setSidebarCollapsed(!sidebarCollapsed)
            }
          }}
          title={title}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
