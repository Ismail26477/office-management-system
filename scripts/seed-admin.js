import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/?appName=vedaa-Ai"
const DB_NAME = process.env.DB_NAME || "office_management"

async function seedAdmin() {
  let client = null
  try {
    console.log("🔄 Connecting to MongoDB...")
    client = new MongoClient(MONGO_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("users")

    // Hash the admin password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Admin user data
    const adminUser = {
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      department: "Management",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: "admin@gmail.com" })

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists")
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Role: ${existingAdmin.role}`)
    } else {
      // Insert admin user
      const result = await usersCollection.insertOne(adminUser)
      console.log("✅ Admin user created successfully!")
      console.log(`   ID: ${result.insertedId}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Password: admin123`)
    }

    console.log("\n📌 LOGIN CREDENTIALS:")
    console.log("   Email: admin@gmail.com")
    console.log("   Password: admin123")
    console.log("   Role: Admin (Full Access)")
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("\n🔌 MongoDB connection closed")
    }
  }
}

seedAdmin()
