import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    if (req.method === "GET") {
      if (id) {
        const project = await db.collection("projects").findOne({ _id: new ObjectId(String(id)) })
        if (!project) {
          return res.status(404).json({ error: "Project not found" })
        }
        return res.json(project)
      }
      const projects = await db.collection("projects").find({}).toArray()
      return res.json(projects)
    }

    if (req.method === "POST") {
      const result = await db.collection("projects").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db.collection("projects").updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("projects").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Project deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
