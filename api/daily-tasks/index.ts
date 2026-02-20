import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    if (req.method === "GET") {
      if (id) {
        const dailyTask = await db.collection("dailytasks").findOne({ _id: new ObjectId(String(id)) })
        if (!dailyTask) {
          return res.status(404).json({ error: "Daily task not found" })
        }
        return res.json(dailyTask)
      }

      const dailyTasks = await db
        .collection("dailytasks")
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "employeeId",
              foreignField: "_id",
              as: "employeeDetails",
            },
          },
          {
            $addFields: {
              employeeName: {
                $cond: [
                  { $gt: [{ $size: "$employeeDetails" }, 0] },
                  { $arrayElemAt: ["$employeeDetails.name", 0] },
                  null,
                ],
              },
            },
          },
          {
            $project: {
              employeeDetails: 0,
            },
          },
        ])
        .toArray()

      return res.json(dailyTasks)
    }

    if (req.method === "POST") {
      const result = await db.collection("dailytasks").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db.collection("dailytasks").updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("dailytasks").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Daily task deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
