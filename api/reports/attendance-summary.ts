import { Router } from "express"
import { connectDB } from "../db"

const router = Router()

// Helper function to get start and end dates
const getDateRange = (period: "week" | "month" | "year") => {
  const today = new Date()
  let startDate = new Date()

  if (period === "week") {
    // Get Monday of current week
    startDate.setDate(today.getDate() - today.getDay() + 1)
  } else if (period === "month") {
    // Get first day of month
    startDate.setDate(1)
  } else if (period === "year") {
    // Get first day of year
    startDate.setMonth(0)
    startDate.setDate(1)
  }

  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

// Get attendance summary for a specific period
router.get("/:employeeId/:period", async (req, res) => {
  try {
    const { employeeId, period } = req.params

    if (!["week", "month", "year"].includes(period)) {
      return res.status(400).json({ error: "Invalid period. Use: week, month, or year" })
    }

    const db = await connectDB()
    const attendanceCollection = db.collection("attendancerecords")

    const { startDate, endDate } = getDateRange(period as "week" | "month" | "year")

    // Aggregate attendance data
    const pipeline = [
      {
        $match: {
          employeeId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["checked-in", "checked-out", "present"],
                  ],
                },
                1,
                0,
              ],
            },
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
            },
          },
          lateDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "late"] }, 1, 0],
            },
          },
          totalHours: {
            $sum: { $toDouble: "$totalHours" },
          },
        },
      },
    ]

    const results = await attendanceCollection.aggregate(pipeline).toArray()

    if (results.length === 0) {
      return res.json({
        employeeId,
        period,
        startDate,
        endDate,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalHours: 0,
        attendancePercentage: 0,
      })
    }

    const data = results[0]
    const expectedHours = data.totalDays * 8 // 8 hours per day
    const attendancePercentage = (data.presentDays / data.totalDays) * 100

    res.json({
      employeeId,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays: data.totalDays,
      presentDays: data.presentDays,
      absentDays: data.absentDays,
      lateDays: data.lateDays,
      earlyLeaveDays: 0, // This would need to be calculated from check-out times
      totalHours: Math.round(data.totalHours * 100) / 100,
      expectedHours,
      overtimeHours: Math.max(0, Math.round((data.totalHours - expectedHours) * 100) / 100),
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    res.status(500).json({ error: "Failed to generate attendance summary" })
  }
})

// Get summary for all employees
router.get("/:period/all", async (req, res) => {
  try {
    const { period } = req.params

    if (!["week", "month", "year"].includes(period)) {
      return res.status(400).json({ error: "Invalid period. Use: week, month, or year" })
    }

    const db = await connectDB()
    const attendanceCollection = db.collection("attendancerecords")
    const employeesCollection = db.collection("employees")

    const { startDate, endDate } = getDateRange(period as "week" | "month" | "year")

    // Get all unique employees
    const employees = await employeesCollection.find({}).toArray()

    // Get summary for each employee
    const summaries = await Promise.all(
      employees.map(async (emp) => {
        const pipeline = [
          {
            $match: {
              employeeId: emp._id.toString(),
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalDays: { $sum: 1 },
              presentDays: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$status",
                        ["checked-in", "checked-out", "present"],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              absentDays: {
                $sum: {
                  $cond: [{ $eq: ["$status", "absent"] }, 1, 0],
                },
              },
              lateDays: {
                $sum: {
                  $cond: [{ $eq: ["$status", "late"] }, 1, 0],
                },
              },
              totalHours: {
                $sum: { $toDouble: "$totalHours" },
              },
            },
          },
        ]

        const results = await attendanceCollection.aggregate(pipeline).toArray()
        const data = results[0] || {}

        return {
          employeeId: emp._id.toString(),
          employeeName: emp.name,
          department: emp.department,
          totalDays: data.totalDays || 0,
          presentDays: data.presentDays || 0,
          absentDays: data.absentDays || 0,
          lateDays: data.lateDays || 0,
          totalHours: data.totalHours || 0,
          attendancePercentage: data.totalDays ? (data.presentDays / data.totalDays) * 100 : 0,
        }
      }),
    )

    res.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalEmployees: employees.length,
      summaries,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    res.status(500).json({ error: "Failed to generate attendance summaries" })
  }
})

export default router

