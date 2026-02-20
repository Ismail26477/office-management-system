import { MongoClient } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/?appName=vedaa-Ai"

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient>

if (!MONGODB_URI) {
  throw new Error('Invalid/missing environment variable: "MONGODB_URI"')
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to persist the client across hot reloads
  if (!(global as any).mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    ;(global as any).mongoClientPromise = client.connect()
  }
  clientPromise = (global as any).mongoClientPromise
} else {
  // In production, always create a new client
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export default clientPromise
