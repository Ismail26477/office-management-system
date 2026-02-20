// Use standard Node.js Request/Response types instead
import { connectDB } from "./db.js"
import bcrypt from "bcryptjs"

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const db = await connectDB()
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
