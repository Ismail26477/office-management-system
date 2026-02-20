"use client"

import type React from "react"

import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "employee"
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
