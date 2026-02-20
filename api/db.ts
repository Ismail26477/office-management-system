import { MongoClient, ObjectId } from "mongodb"

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/?appName=vedaa-Ai"
const DB_NAME = process.env.DB_NAME || "office_management"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectDB() {
  if (cachedDb) {
    return cachedDb
  }

  try {
    cachedClient = new MongoClient(MONGO_URI, {
      retryWrites: true,
      w: "majority",
    })

    await cachedClient.connect()
    cachedDb = cachedClient.db(DB_NAME)

    // Test connection
    await cachedDb.admin().ping()

    console.log("✅ Connected to MongoDB")
    return cachedDb
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    throw error
  }
}

export { ObjectId }
