import { connectDB, ObjectId } from "../db.js"
import bcrypt from "bcryptjs"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    // Handle GET for single employee or all employees
    if (req.method === "GET") {
      if (id) {
        const employee = await db.collection("users").findOne({ _id: new ObjectId(String(id)) })
        if (!employee) {
          return res.status(404).json({ error: "Employee not found" })
        }
        return res.json(employee)
      }
      const employees = await db.collection("users").find({}).toArray()
      return res.json(employees)
    }

    // Handle POST to create new employee
    if (req.method === "POST") {
      const employeeData = {
        ...req.body,
        password: await bcrypt.hash(req.body.password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await db.collection("users").insertOne(employeeData)
      return res.json({ _id: result.insertedId, ...employeeData })
    }

    // Handle PUT to update employee
    if (req.method === "PUT" && id) {
      const updateData = { ...req.body }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      }

      updateData.updatedAt = new Date()
      const result = await db.collection("users").updateOne({ _id: new ObjectId(String(id)) }, { $set: updateData })

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Employee not found" })
      }

      return res.json({ _id: id, ...updateData })
    }

    // Handle DELETE to remove employee
    if (req.method === "DELETE" && id) {
      await db.collection("users").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Employee deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    console.error("Error:", error)
    res.status(500).json({ error: error.message })
  }
}
