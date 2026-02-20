import { Router } from "express"
import { connectDB } from "../db"

const router = Router()

// Get leave balance for an employee
router.get("/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params
    const currentYear = new Date().getFullYear()

    const db = await connectDB()
    const balanceCollection = db.collection("leaveBalance")

    let balance = await balanceCollection.findOne({
      employeeId,
      year: currentYear,
    })

    if (!balance) {
      // Create default balance if not exists
      balance = {
        employeeId,
        year: currentYear,
        sickLeave: { total: 10, used: 0, remaining: 10 },
        casualLeave: { total: 12, used: 0, remaining: 12 },
        paidLeave: { total: 20, used: 0, remaining: 20 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await balanceCollection.insertOne(balance)
    }

    res.json(balance)
  } catch (error) {
    console.error("Error fetching leave balance:", error)
    res.status(500).json({ error: "Failed to fetch leave balance" })
  }
})

// Update leave balance after leave approval
router.patch("/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params
    const { leaveType, daysUsed } = req.body

    if (!leaveType || !daysUsed) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const currentYear = new Date().getFullYear()
    const db = await connectDB()
    const balanceCollection = db.collection("leaveBalance")

    const key = `${leaveType}.used`
    const remainingKey = `${leaveType}.remaining`

    const result = await balanceCollection.findOneAndUpdate(
      { employeeId, year: currentYear },
      {
        $inc: {
          [key]: daysUsed,
          [remainingKey]: -daysUsed,
        },
        $set: {
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return res.status(404).json({ error: "Leave balance not found" })
    }

    res.json(result.value)
  } catch (error) {
    console.error("Error updating leave balance:", error)
    res.status(500).json({ error: "Failed to update leave balance" })
  }
})

// Get all employees' leave balances
router.get("/", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear()
    const db = await connectDB()
    const balanceCollection = db.collection("leaveBalance")

    const balances = await balanceCollection.find({ year: currentYear }).toArray()
    res.json(balances)
  } catch (error) {
    console.error("Error fetching leave balances:", error)
    res.status(500).json({ error: "Failed to fetch leave balances" })
  }
})

export default router
