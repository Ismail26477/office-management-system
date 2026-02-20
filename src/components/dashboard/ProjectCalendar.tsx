"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProjectDate {
  date: Date
  type: "deadline" | "invoice" | "milestone"
  project: string
  description: string
  color: string
  amount?: number
  gst?: number
  invoiceNumber?: string
}

// Project dates data
const projectDates: ProjectDate[] = [
  {
    date: new Date(2024, 11, 5),
    type: "invoice",
    project: "Marketing Campaign",
    description: "INV-004 Due",
    color: "destructive",
    invoiceNumber: "INV-004",
    amount: 50000,
    gst: 9000,
  },
  {
    date: new Date(2024, 11, 10),
    type: "deadline",
    project: "HR System Integration",
    description: "Project Deadline",
    color: "warning",
  },
  {
    date: new Date(2024, 11, 10),
    type: "invoice",
    project: "HR System Integration",
    description: "INV-003 Due",
    color: "success",
    invoiceNumber: "INV-003",
    amount: 75000,
    gst: 13500,
  },
  {
    date: new Date(2024, 11, 20),
    type: "deadline",
    project: "Website Redesign",
    description: "Project Deadline",
    color: "info",
  },
  {
    date: new Date(2024, 11, 20),
    type: "invoice",
    project: "Website Redesign",
    description: "INV-001 Due",
    color: "success",
    invoiceNumber: "INV-001",
    amount: 120000,
    gst: 21600,
  },
  {
    date: new Date(2024, 11, 25),
    type: "milestone",
    project: "Data Migration",
    description: "Phase 2 Complete",
    color: "info",
  },
  {
    date: new Date(2024, 11, 25),
    type: "invoice",
    project: "Data Migration",
    description: "INV-005 Due",
    color: "warning",
    invoiceNumber: "INV-005",
    amount: 95000,
    gst: 17100,
  },
  {
    date: new Date(2025, 0, 15),
    type: "deadline",
    project: "Mobile App Development",
    description: "Project Deadline",
    color: "info",
  },
  {
    date: new Date(2025, 0, 15),
    type: "invoice",
    project: "Mobile App Development",
    description: "INV-002 Due",
    color: "warning",
    invoiceNumber: "INV-002",
    amount: 150000,
    gst: 27000,
  },
]

const typeIcons = {
  deadline: "📋",
  invoice: "💳",
  milestone: "⭐",
}

const typeLabels = {
  deadline: "Deadline",
  invoice: "Invoice",
  milestone: "Milestone",
}

const ProjectCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getDateKey = (date: Date) => date.toDateString()

  const dateMap = new Map<string, ProjectDate[]>()
  projectDates.forEach((pd) => {
    const key = getDateKey(pd.date)
    if (!dateMap.has(key)) {
      dateMap.set(key, [])
    }
    dateMap.get(key)!.push(pd)
  })

  const goToPrevious = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  // Empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  const selectedDateEvents = selectedDate ? dateMap.get(getDateKey(selectedDate)) || [] : []

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const events = day ? dateMap.get(getDateKey(day)) || [] : []
            const isSelected = day && selectedDate && getDateKey(day) === getDateKey(selectedDate)
            const isToday = day && day.toDateString() === new Date().toDateString()

            return (
              <div key={index}>
                {day ? (
                  <button
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "w-full aspect-square p-2 rounded-lg border border-border/50 text-sm transition-all hover:bg-accent",
                      isSelected && "bg-primary text-primary-foreground border-primary",
                      isToday && !isSelected && "bg-muted border-primary/30",
                      events.length > 0 && !isSelected && "bg-accent border-primary/50",
                    )}
                  >
                    <div className="font-medium">{day.getDate()}</div>
                    {events.length > 0 && (
                      <div className="text-xs mt-1 flex gap-0.5 flex-wrap justify-center">
                        {events.slice(0, 2).map((e, i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                        {events.length > 2 && <span className="text-xs">+{events.length - 2}</span>}
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="w-full aspect-square" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Details Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardContent className="pt-6">
            {selectedDate ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Selected Date</p>
                  <p className="text-lg font-semibold">
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-sm font-medium">
                      {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "Event" : "Events"}
                    </p>
                    {selectedDateEvents.map((event, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border/50 space-y-2 hover:border-border transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{typeIcons[event.type]}</span>
                          <div className="flex-1 min-w-0">
                            <Badge className="status-pill mb-1">{typeLabels[event.type]}</Badge>
                            <p className="text-sm font-medium text-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.project}</p>

                            {event.type === "invoice" && event.amount && (
                              <div className="mt-2 pt-2 border-t border-border/50 space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Amount:</span>
                                  <span className="font-semibold">₹{event.amount.toLocaleString("en-IN")}</span>
                                </div>
                                {event.gst && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">GST (18%):</span>
                                    <span className="font-semibold">₹{event.gst.toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                                {event.amount && event.gst && (
                                  <div className="flex justify-between pt-1 border-t border-border/50 font-bold">
                                    <span>Total:</span>
                                    <span>₹{(event.amount + event.gst).toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No events on this date</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Select a date to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectCalendar
