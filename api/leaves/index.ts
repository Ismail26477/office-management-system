import { Router } from "express"
import { connectDB } from "../db"

const router = Router()

// Get all leaves for an employee or all employees
router.get("/", async (req, res) => {
  try {
    const { employeeId, status, leaveType, startDate, endDate } = req.query
    const db = await connectDB()
    const leavesCollection = db.collection("leaves")

    let filter: any = {}

    if (employeeId) filter.employeeId = employeeId
    if (status) filter.status = status
    if (leaveType) filter.leaveType = leaveType

    if (startDate || endDate) {
      filter.startDate = {}
      if (startDate) filter.startDate.$gte = new Date(startDate as string)
      if (endDate) filter.startDate.$lte = new Date(endDate as string)
    }

    const leaves = await leavesCollection.find(filter).sort({ startDate: -1 }).toArray()
    res.json(leaves)
  } catch (error) {
    console.error("Error fetching leaves:", error)
    res.status(500).json({ error: "Failed to fetch leaves" })
  }
})

// Create a new leave request
router.post("/", async (req, res) => {
  try {
    const { employeeId, employeeName, leaveType, startDate, endDate, reason } = req.body

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const db = await connectDB()
    const leavesCollection = db.collection("leaves")

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const leave = {
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await leavesCollection.insertOne(leave)
    res.status(201).json({ _id: result.insertedId, ...leave })
  } catch (error) {
    console.error("Error creating leave:", error)
    res.status(500).json({ error: "Failed to create leave request" })
  }
})

// Approve or reject a leave request
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status, approvedBy } = req.body

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const db = await connectDB()
    const leavesCollection = db.collection("leaves")
    const { ObjectId } = await import("mongodb")

    const result = await leavesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          approvedBy,
          approvedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return res.status(404).json({ error: "Leave request not found" })
    }

    res.json(result.value)
  } catch (error) {
    console.error("Error updating leave:", error)
    res.status(500).json({ error: "Failed to update leave request" })
  }
})

// Delete a leave request (only pending)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const db = await connectDB()
    const leavesCollection = db.collection("leaves")
    const { ObjectId } = await import("mongodb")

    const leave = await leavesCollection.findOne({ _id: new ObjectId(id) })
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" })
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ error: "Cannot delete approved or rejected leaves" })
    }

    await leavesCollection.deleteOne({ _id: new ObjectId(id) })
    res.json({ message: "Leave request deleted successfully" })
  } catch (error) {
    console.error("Error deleting leave:", error)
    res.status(500).json({ error: "Failed to delete leave request" })
  }
})

export default router
