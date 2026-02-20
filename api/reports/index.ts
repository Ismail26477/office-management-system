import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { period = "month", type = "summary" } = req.query

    if (req.method === "GET") {
      if (type === "summary") {
        // Get all attendance records
        const attendanceRecords = await db.collection("attendancerecords").find({}).toArray()

        if (attendanceRecords.length === 0) {
          return res.json({
            employees: [],
            trends: [],
            overallStats: {
              totalEmployees: 0,
              avgAttendance: 0,
              avgHours: 0,
            },
          })
        }

        // Group by employee and calculate stats
        const employeeStats: any = {}

        attendanceRecords.forEach((record: any) => {
          const empName = record.employeeName || "Unknown"
          if (!employeeStats[empName]) {
            employeeStats[empName] = {
              employeeName: empName,
              totalDays: 0,
              presentDays: 0,
              absentDays: 0,
              lateDays: 0,
              earlyLeaveDays: 0,
              totalHours: 0,
              expectedHours: 0,
              records: [],
            }
          }

          const emp = employeeStats[empName]
          emp.totalDays += 1
          emp.records.push(record)

          // Count status
          if (record.status === "present" || record.status === "checked-out") {
            emp.presentDays += 1
          } else if (record.status === "absent") {
            emp.absentDays += 1
          } else if (record.status === "late") {
            emp.lateDays += 1
            emp.presentDays += 1
          }

          // Check for late arrival (after 10:15 AM)
          if (record.checkInTime) {
            const checkInDate = new Date(record.checkInTime)
            if (checkInDate.getHours() > 10 || (checkInDate.getHours() === 10 && checkInDate.getMinutes() > 15)) {
              emp.lateDays += 1
            }
          }

          // Check for early leave (before 6 PM)
          if (record.checkOutTime) {
            const checkOutDate = new Date(record.checkOutTime)
            if (checkOutDate.getHours() < 18) {
              emp.earlyLeaveDays += 1
            }
          }

          // Calculate hours worked
          if (record.checkInTime && record.checkOutTime) {
            const checkIn = new Date(record.checkInTime)
            const checkOut = new Date(record.checkOutTime)
            const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
            emp.totalHours += hours
          } else if (record.totalHours) {
            emp.totalHours += record.totalHours
          }

          emp.expectedHours += 8 // 10 AM to 6 PM = 8 hours
        })

        // Convert to array and calculate percentages
        const employees = Object.values(employeeStats).map((emp: any) => {
          const attendancePercentage =
            emp.totalDays > 0 ? Math.round(((emp.presentDays) / emp.totalDays) * 100) : 0
          return {
            ...emp,
            attendancePercentage,
            totalHours: Math.round(emp.totalHours * 100) / 100,
            records: undefined, // Remove raw records
          }
        })

        // Generate trend data by week
        const trendMap: any = {}
        attendanceRecords.forEach((record: any) => {
          const date = new Date(record.createdAt || record.date)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay() + 1)
          const weekKey = weekStart.toISOString().split("T")[0]

          if (!trendMap[weekKey]) {
            trendMap[weekKey] = {
              week: `Week of ${weekStart.getDate()}`,
              attendance: 0,
              hours: 0,
              count: 0,
            }
          }

          if (record.status === "present" || record.status === "checked-out") {
            trendMap[weekKey].attendance += 1
          }

          if (record.checkInTime && record.checkOutTime) {
            const checkIn = new Date(record.checkInTime)
            const checkOut = new Date(record.checkOutTime)
            const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
            trendMap[weekKey].hours += hours
          } else if (record.totalHours) {
            trendMap[weekKey].hours += record.totalHours
          }

          trendMap[weekKey].count += 1
        })

        const trends = Object.values(trendMap)
          .map((t: any) => ({
            ...t,
            attendance: Math.round((t.attendance / t.count) * 100),
            hours: Math.round(t.hours * 100) / 100,
          }))
          .slice(0, 5)

        // Calculate overall stats
        const totalEmployees = Object.keys(employeeStats).length
        const avgAttendance =
          employees.length > 0
            ? Math.round(
                (employees.reduce((sum: number, emp: any) => sum + emp.attendancePercentage, 0) /
                  employees.length) * 100,
              ) / 100
            : 0

        const avgHours =
          employees.length > 0
            ? Math.round(
                (employees.reduce((sum: number, emp: any) => sum + emp.totalHours, 0) / employees.length) * 100,
              ) / 100
            : 0

        return res.json({
          employees: employees.sort((a: any, b: any) => b.attendancePercentage - a.attendancePercentage),
          trends,
          overallStats: {
            totalEmployees,
            avgAttendance,
            avgHours,
            totalRecords: attendanceRecords.length,
          },
        })
      }
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    console.error("Report generation error:", error)
    res.status(500).json({ error: error.message })
  }
}
