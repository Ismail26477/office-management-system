"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectCalendar from "@/components/dashboard/ProjectCalendar"

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-2">Project timeline, invoice dates, and milestones</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Timeline & Invoice Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectCalendar />
        </CardContent>
      </Card>
    </div>
  )
}

export default Calendar
