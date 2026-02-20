import { connectDB } from "./db.js"

export default async function handler(req: any, res: any) {
  try {
    const db = await connectDB()
    res.json({
      status: "ok",
      message: "Backend server is running and MongoDB is connected",
      database: "office_management",
    })
  } catch (error: any) {
    res.status(503).json({
      status: "error",
      message: "MongoDB is not connected",
      error: error.message,
    })
  }
}
