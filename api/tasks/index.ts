import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    if (req.method === "GET") {
      if (id) {
        const task = await db.collection("tasks").findOne({ _id: new ObjectId(String(id)) })
        if (!task) {
          return res.status(404).json({ error: "Task not found" })
        }
        return res.json(task)
      }
      const tasks = await db.collection("tasks").find({}).toArray()
      return res.json(tasks)
    }

    if (req.method === "POST") {
      const result = await db.collection("tasks").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db.collection("tasks").updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("tasks").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Task deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
