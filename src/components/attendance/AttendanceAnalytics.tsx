import React from "react"
import { AlertCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AnalyticsProps {
  records: any[]
  isLate: (time: string) => boolean
  calculateWorkingHours: (checkInTime: string, checkOutTime: string) => any
  formatDate: (date: string) => string
  formatTime: (time: string) => string
}

export const AttendanceAnalytics: React.FC<AnalyticsProps> = ({
  records,
  isLate,
  calculateWorkingHours,
  formatDate,
  formatTime,
}) => {
  const allLateArrivals = records.filter((r: any) => isLate(r.checkInTime))
  const lateByEmployee = allLateArrivals.reduce(
    (acc: any, record: any) => {
      const name = record.employeeName || record.name || "Unknown"
      if (!acc[name]) {
        acc[name] = { count: 0, records: [] }
      }
      acc[name].count += 1
      acc[name].records.push(record)
      return acc
    },
    {} as Record<string, any>
  )

  return (
    <div className="space-y-6">
      {/* Late Arrivals Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600" />
            Late Arrivals Report
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Employees who arrived after 10:15 AM (office timing: 10 AM - 6 PM)
          </p>
        </div>

        {Object.keys(lateByEmployee).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Employee
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Times Late
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Latest Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Latest Time
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Hours Worked
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(lateByEmployee)
                  .sort((a: any, b: any) => b[1].count - a[1].count)
                  .map(([name, data]: any) => {
                    const latestRecord = data.records[data.records.length - 1]
                    const hours = calculateWorkingHours(latestRecord.checkInTime, latestRecord.checkOutTime)
                    return (
                      <tr key={name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                          {name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <Badge className="bg-yellow-500 text-white border-0 text-xs">{data.count}</Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                          {formatDate(latestRecord.date || latestRecord.createdAt)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-yellow-600">
                          {formatTime(latestRecord.checkInTime)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                          {hours.actual} hrs
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">No late arrivals recorded</p>
          </div>
        )}
      </div>

      {/* Performance Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
            Employee Performance
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overtime hours and working patterns for today
          </p>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Employee
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Expected
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Actual
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Overtime
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records
                  .map((r: any) => ({
                    ...r,
                    ...calculateWorkingHours(r.checkInTime, r.checkOutTime),
                  }))
                  .sort((a: any, b: any) => b.overtime - a.overtime)
                  .map((record: any) => (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-foreground">
                        {record.employeeName || record.name || "Unknown"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground">
                        {record.expected} hrs
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-blue-600">
                        {record.actual} hrs
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-green-600">
                        {record.overtime > 0 ? `+${record.overtime} hrs` : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge
                          className={`text-white border-0 text-xs ${
                            record.overtime > 0
                              ? "bg-green-500"
                              : record.actual < record.expected
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        >
                          {record.overtime > 0
                            ? "Overtime"
                            : record.actual < record.expected
                              ? "Undertime"
                              : "On target"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">No performance data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
