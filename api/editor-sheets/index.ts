import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    if (req.method === "GET") {
      if (id) {
        const sheet = await db.collection("editorsheets").findOne({ _id: new ObjectId(String(id)) })
        if (!sheet) {
          return res.status(404).json({ error: "Editor sheet not found" })
        }
        return res.json(sheet)
      }

      const sheets = await db
        .collection("editorsheets")
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "employeeId",
              foreignField: "_id",
              as: "employeeInfo",
            },
          },
          {
            $addFields: {
              employeeName: {
                $cond: [
                  { $gt: [{ $size: "$employeeInfo" }, 0] },
                  { $arrayElemAt: ["$employeeInfo.name", 0] },
                  "Unknown",
                ],
              },
            },
          },
          {
            $project: {
              employeeInfo: 0,
            },
          },
        ])
        .toArray()

      return res.json(sheets)
    }

    if (req.method === "POST") {
      const result = await db.collection("editorsheets").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db
        .collection("editorsheets")
        .updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("editorsheets").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Editor sheet deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
