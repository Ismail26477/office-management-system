import { connectDB } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    const db = await connectDB()

    // Get total employees
    const totalEmployees = await db.collection("users").countDocuments()

    // Get employees by status
    const statusCounts = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get department distribution
    const departmentDistribution = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Calculate average salary
    const salaryResult = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            averageSalary: { $avg: "$salary" },
          },
        },
      ])
      .toArray()

    const averageSalary = salaryResult[0]?.averageSalary || 0

    // Get present today and on leave from status
    const presentToday = statusCounts.find((s: any) => s._id === "active")?.count || 0
    const onLeave = statusCounts.find((s: any) => s._id === "on_leave")?.count || 0

    return res.json({
      totalEmployees,
      presentToday,
      onLeave,
      averageSalary: Math.round(averageSalary),
      departmentDistribution: departmentDistribution.map((dept: any) => ({
        department: dept._id || "Unassigned",
        count: dept.count,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching employee stats:", error)
    res.status(500).json({
      error: error.message,
      totalEmployees: 0,
      presentToday: 0,
      onLeave: 0,
      averageSalary: 0,
      departmentDistribution: [],
    })
  }
}
