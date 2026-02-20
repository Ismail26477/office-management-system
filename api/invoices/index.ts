import { connectDB, ObjectId } from "../db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    const { id } = req.query

    if (req.method === "GET") {
      if (id) {
        const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(String(id)) })
        if (!invoice) {
          return res.status(404).json({ error: "Invoice not found" })
        }
        return res.json(invoice)
      }
      const invoices = await db.collection("invoices").find({}).toArray()
      return res.json(invoices)
    }

    if (req.method === "POST") {
      const result = await db.collection("invoices").insertOne(req.body)
      return res.json({ _id: result.insertedId, ...req.body })
    }

    if (req.method === "PUT" && id) {
      const result = await db.collection("invoices").updateOne({ _id: new ObjectId(String(id)) }, { $set: req.body })
      return res.json({ _id: id, ...req.body })
    }

    if (req.method === "DELETE" && id) {
      await db.collection("invoices").deleteOne({ _id: new ObjectId(String(id)) })
      return res.json({ message: "Invoice deleted" })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
