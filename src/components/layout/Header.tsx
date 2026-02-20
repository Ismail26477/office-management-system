"use client"

import { Search, Bell, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate">
            Welcome back, {user?.name || "User"}! Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 w-48 lg:w-64 input-search rounded-full" />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative flex-shrink-0">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New employee onboarded</span>
              <span className="text-xs text-muted-foreground">Sarah Wilson joined the Design team</span>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Project deadline approaching</span>
              <span className="text-xs text-muted-foreground">Website Redesign due in 2 days</span>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Leave request approved</span>
              <span className="text-xs text-muted-foreground">Your leave for Dec 25-26 is approved</span>
              <span className="text-xs text-muted-foreground">3 hours ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-2 flex-shrink-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                <AvatarFallback>{getInitials(user?.name || "User")}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "employee"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <span className="text-xs">Email: {user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <span className="text-xs capitalize">Role: {user?.role}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
