"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Employees from "./pages/Employees"
import Attendance from "./pages/Attendance"
import Projects from "./pages/Projects"
import Tasks from "./pages/Tasks"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import Invoices from "./pages/Invoices"
import Calendar from "./pages/Calendar"
import Sheet from "./pages/sheet" // Changed import path from "./pages/Sheet" to "./pages/sheet" (lowercase) to match actual file name
import Leaves from "./pages/Leaves"
import Reports from "./pages/Reports"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/sheet" element={<Sheet />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
