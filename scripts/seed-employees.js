import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/?appName=vedaa-Ai"
const DB_NAME = process.env.DB_NAME || "office_management"

// Sample employee data matching your table structure
const sampleEmployees = [
  {
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@company.com",
    department: "Engineering",
    position: "Senior Developer",
    status: "active",
    joinDate: "2023-01-15",
    salary: 85000,
  },
  {
    name: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    email: "sarah.johnson@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    status: "active",
    joinDate: "2023-03-20",
    salary: 72000,
  },
  {
    name: "Michael Chen",
    phone: "+1 (555) 345-6789",
    email: "michael.chen@company.com",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    joinDate: "2023-06-10",
    salary: 78000,
  },
  {
    name: "Emily Davis",
    phone: "+1 (555) 456-7890",
    email: "emily.davis@company.com",
    department: "HR",
    position: "HR Specialist",
    status: "active",
    joinDate: "2023-02-28",
    salary: 65000,
  },
  {
    name: "Robert Wilson",
    phone: "+1 (555) 567-8901",
    email: "robert.wilson@company.com",
    department: "Sales",
    position: "Sales Executive",
    status: "active",
    joinDate: "2023-04-05",
    salary: 70000,
  },
  {
    name: "Jessica Brown",
    phone: "+1 (555) 678-9012",
    email: "jessica.brown@company.com",
    department: "Finance",
    position: "Accountant",
    status: "active",
    joinDate: "2023-05-12",
    salary: 68000,
  },
  {
    name: "David Martinez",
    phone: "+1 (555) 789-0123",
    email: "david.martinez@company.com",
    department: "Engineering",
    position: "Backend Developer",
    status: "on_leave",
    joinDate: "2023-07-18",
    salary: 80000,
  },
  {
    name: "Lisa Anderson",
    phone: "+1 (555) 890-1234",
    email: "lisa.anderson@company.com",
    department: "Operations",
    position: "Operations Manager",
    status: "active",
    joinDate: "2023-01-30",
    salary: 75000,
  },
]

async function seedEmployees() {
  let client = null
  try {
    console.log("🔄 Connecting to MongoDB...")
    client = new MongoClient(MONGO_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    const employeesCollection = db.collection("employees")

    // Clear existing employees (optional - remove if you want to keep existing data)
    // await employeesCollection.deleteMany({})
    // console.log("🗑️  Cleared existing employees")

    // Insert sample employees
    const result = await employeesCollection.insertMany(sampleEmployees)
    console.log(`✅ Successfully inserted ${result.insertedIds.length} employees`)
    console.log("📊 Sample employees added:")
    sampleEmployees.forEach((emp) => {
      console.log(`  - ${emp.name} (${emp.department})`)
    })
  } catch (error) {
    console.error("❌ Error seeding employees:", error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 MongoDB connection closed")
    }
  }
}

seedEmployees()
