import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    // Add cache headers for GET requests
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120")
    
    const db = await connectDB()
    const { id, limit = 100, skip = 0 } = req.query

    if (req.method === "GET") {
      if (id) {
        const record = await db.collection("attendancerecords").findOne({ _id: new ObjectId(String(id)) })
        if (!record) {
          return res.status(404).json({ error: "Attendance record not found" })
        }
        return res.json(record)
      }
      
      // Get count and paginated data in parallel for better performance
      const [attendanceRecords, totalCount] = await Promise.all([
        db.collection("attendancerecords")
          .find({})
          .sort({ createdAt: -1 }) // Most recent first
          .limit(parseInt(limit as string))
          .skip(parseInt(skip as string))
          .toArray(),
        db.collection("attendancerecords").countDocuments({})
      ])
      
      return res.json({
        data: attendanceRecords,
        total: totalCount,
        limit: parseInt(limit as string),
        skip: parseInt(skip as string)
      })
    }

    if (req.method === "POST") {
      const result = await db.collection("attendancerecords").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db
        .collection("attendancerecords")
        .updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("attendancerecords").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Attendance record deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
