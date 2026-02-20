import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb+srv://vedaa:vedaa123@vedaa-ai.blmd84r.mongodb.net/?appName=vedaa-Ai"
const DB_NAME = process.env.DB_NAME || "office_management"
const PORT = process.env.PORT || 5000

let db = null
let client = null

// Connect to MongoDB with retry logic
async function connectDB() {
  try {
    console.log("[v0] Attempting MongoDB connection...")
    console.log("[v0] URI:", MONGO_URI.substring(0, 50) + "...")

    client = new MongoClient(MONGO_URI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    db = client.db(DB_NAME)

    // Test the connection
    await db.admin().ping()

    console.log("✅ Connected to MongoDB successfully")
    console.log(`📦 Database: ${DB_NAME}`)
    return true
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    console.error("⚠️  Waiting 5 seconds before retry...")
    // Retry after 5 seconds instead of exiting
    setTimeout(connectDB, 5000)
    return false
  }
}

// Health check
app.get("/api/health", async (req, res) => {
  if (db) {
    res.json({
      status: "ok",
      message: "Backend server is running and MongoDB is connected",
      database: DB_NAME,
    })
  } else {
    res.status(503).json({
      status: "error",
      message: "MongoDB is not connected yet. Retrying connection...",
    })
  }
})

// EMPLOYEES ENDPOINTS
app.get("/api/employees", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: "Database not connected" })
    }
    const employees = await db.collection("users").find({}).toArray()
    console.log("[v0] Fetched", employees.length, "employees from users collection")
    res.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/employees/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const employee = await db.collection("users").findOne({ _id: new ObjectId(req.params.id) })
    if (!employee) return res.status(404).json({ error: "Employee not found" })
    res.json(employee)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/employees", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const employeeData = {
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(employeeData)
    res.json({ _id: result.insertedId, ...employeeData })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/employees/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("users").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
    res.json({ _id: req.params.id, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/employees/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: "Employee deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// EMPLOYEE STATS ENDPOINT
app.get("/api/employees/stats", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    // Get total employees
    const totalEmployees = await db.collection("users").countDocuments()

    // Get employees by status
    const statusCounts = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get department distribution
    const departmentDistribution = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Calculate average salary
    const salaryResult = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: null,
            averageSalary: { $avg: "$salary" },
          },
        },
      ])
      .toArray()

    const averageSalary = salaryResult[0]?.averageSalary || 0

    // Get present today and on leave from status
    const presentToday = statusCounts.find((s) => s._id === "active")?.count || 0
    const onLeave = statusCounts.find((s) => s._id === "on_leave")?.count || 0

    console.log("[v0] Employee stats - Total:", totalEmployees, "Present:", presentToday, "Leave:", onLeave)

    res.json({
      totalEmployees,
      presentToday,
      onLeave,
      averageSalary: Math.round(averageSalary),
      departmentDistribution: departmentDistribution.map((dept) => ({
        name: dept._id || "Unassigned",
        count: dept.count,
      })),
    })
  } catch (error) {
    console.error("Error fetching employee stats:", error)
    res.status(500).json({
      error: error.message,
      totalEmployees: 0,
      presentToday: 0,
      onLeave: 0,
      averageSalary: 0,
      departmentDistribution: [],
    })
  }
})

app.post("/api/login", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

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

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/employees", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleEmployees = [
      {
        name: "John Smith",
        phone: "+1-555-0101",
        department: "Engineering",
        status: "active",
        email: "john.smith@company.com",
        salary: 85000,
        joinDate: "2023-01-15",
        joiningDate: "2023-01-15",
        role: "Senior Developer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Johnson",
        phone: "+1-555-0102",
        department: "Marketing",
        status: "active",
        email: "sarah.johnson@company.com",
        salary: 72000,
        joinDate: "2023-03-20",
        joiningDate: "2023-03-20",
        role: "Marketing Manager",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mike Chen",
        phone: "+1-555-0103",
        department: "Engineering",
        status: "active",
        email: "mike.chen@company.com",
        salary: 90000,
        joinDate: "2022-11-10",
        joiningDate: "2022-11-10",
        role: "Lead Engineer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Emily Davis",
        phone: "+1-555-0104",
        department: "HR",
        status: "active",
        email: "emily.davis@company.com",
        salary: 65000,
        joinDate: "2023-05-01",
        joiningDate: "2023-05-01",
        role: "HR Specialist",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Robert Wilson",
        phone: "+1-555-0105",
        department: "Finance",
        status: "on_leave",
        email: "robert.wilson@company.com",
        salary: 80000,
        joinDate: "2023-02-14",
        joiningDate: "2023-02-14",
        role: "Financial Analyst",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Lisa Anderson",
        phone: "+1-555-0106",
        department: "Engineering",
        status: "active",
        email: "lisa.anderson@company.com",
        salary: 88000,
        joinDate: "2023-04-03",
        joiningDate: "2023-04-03",
        role: "Frontend Developer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Clear existing employees first
    await db.collection("users").deleteMany({})

    // Insert sample data into users collection
    const result = await db.collection("users").insertMany(sampleEmployees)
    console.log(`✅ Seeded ${result.insertedIds.length} employees into users collection`)

    res.json({
      message: "Sample employees added successfully to users collection",
      count: result.insertedIds.length,
      employees: sampleEmployees,
    })
  } catch (error) {
    console.error("Error seeding employees:", error)
    res.status(500).json({ error: error.message })
  }
})

// TASKS ENDPOINTS
app.get("/api/tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const tasks = await db.collection("tasks").find({}).toArray()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("tasks").insertOne(req.body)
    res.json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/tasks/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const objectId = new ObjectId(req.params.id)
    const updateData = {}

    // Only allow specific fields to be updated
    if (req.body.status) updateData.status = req.body.status
    if (req.body.title) updateData.title = req.body.title
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.priority) updateData.priority = req.body.priority
    if (req.body.assignee) updateData.assignee = req.body.assignee
    if (req.body.dueDate) updateData.dueDate = req.body.dueDate
    if (req.body.tags) updateData.tags = req.body.tags

    updateData.updatedAt = new Date()

    const result = await db.collection("tasks").updateOne({ _id: objectId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ _id: req.params.id, ...updateData })
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("tasks").deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: "Task deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleTasks = [
      {
        id: 1,
        title: "Complete Project Proposal",
        description: "Finalize and submit the Q2 project proposal to management",
        priority: "high",
        status: "inProgress",
        assignee: { name: "John Smith", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["proposal", "important"],
      },
      {
        id: 2,
        title: "Client Presentation",
        description: "Prepare and deliver presentation to new client about our services",
        priority: "high",
        status: "todo",
        assignee: { name: "Sarah Johnson", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["client", "presentation"],
      },
      {
        id: 3,
        title: "Update Documentation",
        description: "Update API documentation with new endpoints and parameters",
        priority: "medium",
        status: "todo",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-16",
        tags: ["documentation"],
      },
      {
        id: 4,
        title: "Code Review",
        description: "Review pull requests from junior developers",
        priority: "high",
        status: "inProgress",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["code", "review"],
      },
      {
        id: 5,
        title: "Bug Fixes",
        description: "Fix critical bugs reported in the latest release",
        priority: "high",
        status: "inProgress",
        assignee: { name: "John Smith", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-16",
        tags: ["bugs", "critical"],
      },
      {
        id: 6,
        title: "Database Optimization",
        description: "Optimize slow queries in the user dashboard",
        priority: "medium",
        status: "todo",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-17",
        tags: ["database", "performance"],
      },
      {
        id: 7,
        title: "Training Session",
        description: "Conduct training session on new development tools",
        priority: "low",
        status: "completed",
        assignee: { name: "Sarah Johnson", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-14",
        tags: ["training"],
      },
    ]

    // Clear existing tasks first
    await db.collection("tasks").deleteMany({})

    // Insert sample data into tasks collection
    const result = await db.collection("tasks").insertMany(sampleTasks)
    console.log(`✅ Seeded ${result.insertedIds.length} tasks`)

    res.json({
      message: "Sample tasks added successfully",
      count: result.insertedIds.length,
      tasks: sampleTasks,
    })
  } catch (error) {
    console.error("Error seeding tasks:", error)
    res.status(500).json({ error: error.message })
  }
})

// PROJECTS ENDPOINTS
app.get("/api/projects", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const projects = await db.collection("projects").find({}).toArray()
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/projects", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("projects").insertOne(req.body)
    res.json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/projects/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("projects").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
    res.json({ _id: req.params.id, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/projects/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("projects").deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: "Project deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/projects", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleProjects = [
      {
        id: "proj-001",
        name: "Website Redesign",
        description: "Complete redesign of company website with modern UI/UX",
        progress: 75,
        status: "in_progress",
        priority: "high",
        deadline: "2024-02-28",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 12, completed: 9 },
      },
      {
        id: "proj-002",
        name: "Mobile App Development",
        description: "Develop cross-platform mobile application for iOS and Android",
        progress: 45,
        status: "in_progress",
        priority: "high",
        deadline: "2024-04-15",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 20, completed: 9 },
      },
      {
        id: "proj-003",
        name: "API Integration",
        description: "Integrate third-party APIs for enhanced functionality",
        progress: 100,
        status: "completed",
        priority: "medium",
        deadline: "2024-01-10",
        team: ["/placeholder-user.jpg"],
        tasks: { total: 8, completed: 8 },
      },
      {
        id: "proj-004",
        name: "Database Migration",
        description: "Migrate legacy database to modern cloud infrastructure",
        progress: 60,
        status: "in_progress",
        priority: "high",
        deadline: "2024-03-30",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 15, completed: 9 },
      },
      {
        id: "proj-005",
        name: "Security Audit",
        description: "Comprehensive security audit and vulnerability assessment",
        progress: 30,
        status: "on_hold",
        priority: "medium",
        deadline: "2024-05-20",
        team: ["/placeholder-user.jpg"],
        tasks: { total: 10, completed: 3 },
      },
      {
        id: "proj-006",
        name: "Performance Optimization",
        description: "Optimize application performance and reduce load times",
        progress: 50,
        status: "in_progress",
        priority: "medium",
        deadline: "2024-02-15",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 14, completed: 7 },
      },
    ]

    // Clear existing projects first
    await db.collection("projects").deleteMany({})

    // Insert sample data into projects collection
    const result = await db.collection("projects").insertMany(sampleProjects)
    console.log(`✅ Seeded ${result.insertedIds.length} projects`)

    res.json({
      message: "Sample projects added successfully",
      count: result.insertedIds.length,
      projects: sampleProjects,
    })
  } catch (error) {
    console.error("Error seeding projects:", error)
    res.status(500).json({ error: error.message })
  }
})

// INVOICES ENDPOINTS
app.get("/api/invoices", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const invoices = await db.collection("invoices").find({}).toArray()
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/invoices", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("invoices").insertOne(req.body)
    res.json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/invoices/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("invoices").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
    res.json({ _id: req.params.id, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/invoices/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("invoices").deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: "Invoice deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/invoices", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleInvoices = [
      {
        id: "INV-001",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Website Redesign",
        client: "ABC Corporation",
        amount: 500000,
        gstAmount: 90000,
        totalAmount: 590000,
        hasGST: true,
        gstPercentage: 18,
        status: "paid",
        dueDate: "Jan 15, 2024",
        issuedDate: "Dec 15, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-002",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Mobile App Development",
        client: "XYZ Enterprises",
        amount: 800000,
        gstAmount: 144000,
        totalAmount: 944000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 20, 2024",
        issuedDate: "Dec 20, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-003",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "API Integration",
        client: "Global Tech Co",
        amount: 350000,
        gstAmount: 63000,
        totalAmount: 413000,
        hasGST: true,
        gstPercentage: 18,
        status: "overdue",
        dueDate: "Dec 20, 2023",
        issuedDate: "Nov 20, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-004",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "Database Migration",
        client: "CloudBase Systems",
        amount: 600000,
        gstAmount: 108000,
        totalAmount: 708000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 25, 2024",
        issuedDate: "Dec 25, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-005",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Security Audit",
        client: "FinanceHub Inc",
        amount: 250000,
        gstAmount: 45000,
        totalAmount: 295000,
        hasGST: true,
        gstPercentage: 18,
        status: "paid",
        dueDate: "Jan 10, 2024",
        issuedDate: "Dec 10, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-006",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "Performance Optimization",
        client: "SpeedTech Co",
        amount: 400000,
        gstAmount: 72000,
        totalAmount: 472000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 30, 2024",
        issuedDate: "Dec 30, 2023",
        clientImage: "/placeholder-user.jpg",
      },
    ]

    // Clear existing invoices first
    await db.collection("invoices").deleteMany({})

    // Insert sample data into invoices collection
    const result = await db.collection("invoices").insertMany(sampleInvoices)
    console.log(`✅ Seeded ${result.insertedIds.length} invoices`)

    res.json({
      message: "Sample invoices added successfully",
      count: result.insertedIds.length,
      invoices: sampleInvoices,
    })
  } catch (error) {
    console.error("Error seeding invoices:", error)
    res.status(500).json({ error: error.message })
  }
})

// DAILY TASKS ENDPOINTS
app.get("/api/daily-tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

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

    res.json(dailyTasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/daily-tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("dailytasks").insertOne(req.body)
    res.json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/daily-tasks/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("dailytasks").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
    res.json({ _id: req.params.id, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/daily-tasks/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    await db.collection("dailytasks").deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ message: "Daily task deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Seed endpoint for daily tasks with sample data
app.post("/api/seed/daily-tasks", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleDailyTasks = [
      {
        title: "Complete Project Proposal",
        description: "Finalize and submit the Q2 project proposal to management",
        priority: "high",
        status: "in_progress",
        assignedTo: "John Smith",
        dueDate: "2024-01-15",
      },
      {
        title: "Client Presentation",
        description: "Prepare and deliver presentation to new client about our services",
        priority: "high",
        status: "pending",
        assignedTo: "Sarah Johnson",
        dueDate: "2024-01-15",
      },
      {
        title: "Update Documentation",
        description: "Update API documentation with new endpoints and parameters",
        priority: "medium",
        status: "pending",
        assignedTo: "Mike Chen",
        dueDate: "2024-01-16",
      },
      {
        title: "Team Meeting",
        description: "Weekly sync meeting with engineering team",
        priority: "medium",
        status: "pending",
        assignedTo: "Emily Davis",
        dueDate: "2024-01-15",
      },
      {
        title: "Code Review",
        description: "Review pull requests from junior developers",
        priority: "high",
        status: "in_progress",
        assignedTo: "Mike Chen",
        dueDate: "2024-01-15",
      },
      {
        title: "Bug Fixes",
        description: "Fix critical bugs reported in the latest release",
        priority: "high",
        status: "in_progress",
        assignedTo: "John Smith",
        dueDate: "2024-01-16",
      },
      {
        title: "Database Optimization",
        description: "Optimize slow queries in the user dashboard",
        priority: "medium",
        status: "pending",
        assignedTo: "Mike Chen",
        dueDate: "2024-01-17",
      },
      {
        title: "Training Session",
        description: "Conduct training session on new development tools",
        priority: "low",
        status: "completed",
        assignedTo: "Sarah Johnson",
        dueDate: "2024-01-14",
      },
    ]

    // Clear existing daily tasks first
    await db.collection("dailytasks").deleteMany({})

    // Insert sample data into dailytasks collection
    const result = await db.collection("dailytasks").insertMany(sampleDailyTasks)
    console.log(`✅ Seeded ${result.insertedIds.length} daily tasks`)

    res.json({
      message: "Sample daily tasks added successfully",
      count: result.insertedIds.length,
      tasks: sampleDailyTasks,
    })
  } catch (error) {
    console.error("Error seeding daily tasks:", error)
    res.status(500).json({ error: error.message })
  }
})

// ATTENDANCE RECORDS ENDPOINTS
app.get("/api/attendance", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const attendanceRecords = await db.collection("attendancerecords").find({}).toArray()
    res.json(attendanceRecords)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/attendance", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("attendancerecords").insertOne(req.body)
    res.json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    console.error("Error creating attendance record:", error)
    res.status(500).json({ error: error.message })
  }
})

app.put("/api/attendance/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const { id } = req.params
    const result = await db.collection("attendancerecords").updateOne({ _id: new ObjectId(id) }, { $set: req.body })
    res.json(result)
  } catch (error) {
    console.error("Error updating attendance:", error)
    res.status(500).json({ error: error.message })
  }
})

app.delete("/api/attendance/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const { id } = req.params
    const result = await db.collection("attendancerecords").deleteOne({ _id: new ObjectId(id) })
    res.json(result)
  } catch (error) {
    console.error("Error deleting attendance:", error)
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/attendance", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    const sampleAttendance = [
      {
        employeeId: "emp-001",
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:55 AM",
        clockOut: "06:02 PM",
        status: "present",
        hours: "9h 7m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-002",
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        clockIn: "09:15 AM",
        clockOut: "-",
        status: "late",
        hours: "7h 45m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-003",
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:30 AM",
        clockOut: "05:45 PM",
        status: "present",
        hours: "9h 15m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-004",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        clockIn: "-",
        clockOut: "-",
        status: "absent",
        hours: "-",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-005",
        name: "Lisa Thompson",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:45 AM",
        clockOut: "-",
        status: "present",
        hours: "8h 15m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-006",
        name: "John Smith",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        clockIn: "09:00 AM",
        clockOut: "06:30 PM",
        status: "present",
        hours: "9h 30m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-007",
        name: "Amanda Foster",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:20 AM",
        clockOut: "05:00 PM",
        status: "present",
        hours: "8h 40m",
        date: "2024-12-30",
      },
    ]

    // Clear existing attendance records first
    await db.collection("attendancerecords").deleteMany({})

    // Insert sample data into attendancerecords collection
    const result = await db.collection("attendancerecords").insertMany(sampleAttendance)
    console.log(`✅ Seeded ${result.insertedIds.length} attendance records`)

    res.json({
      message: "Sample attendance records added successfully",
      count: result.insertedIds.length,
      records: sampleAttendance,
    })
  } catch (error) {
    console.error("Error seeding attendance:", error)
    res.status(500).json({ error: error.message })
  }
})

// EDITOR-SHEETS ENDPOINTS
app.get("/api/editor-sheets", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

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
              $cond: [{ $gt: [{ $size: "$employeeInfo" }, 0] }, { $arrayElemAt: ["$employeeInfo.name", 0] }, "Unknown"],
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

    res.json(sheets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/editor-sheets", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    const result = await db.collection("editorsheets").insertOne(req.body)
    res.status(201).json({ _id: result.insertedId, ...req.body })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post("/api/seed/editor-sheets", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    // Get list of employees first
    const employees = await db.collection("users").find({}).toArray()

    if (employees.length === 0) {
      return res.status(400).json({ error: "No employees found. Please seed employees first." })
    }

    const editorSheets = [
      {
        title: "Design Document",
        sheetName: "week",
        link: "https://docs.google.com/document/d/1example",
        content: "Detailed design document for the new website",
        author: "John Smith",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        tasks: [],
      },
      {
        title: "Marketing Strategy",
        sheetName: "Vipul bhaiya",
        link: "https://docs.google.com/document/d/2example",
        content: "Marketing strategy for the upcoming campaign",
        author: "Sarah Johnson",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-14"),
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14"),
        tasks: [],
      },
      {
        title: "Code Review Notes",
        sheetName: "Mam",
        link: "https://docs.google.com/document/d/3example",
        content: "Notes from the code review session",
        author: "Mike Chen",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-13"),
        createdAt: new Date("2024-01-13"),
        updatedAt: new Date("2024-01-13"),
        tasks: [],
      },
    ]

    // Delete existing editor sheets and insert new ones with correct fields
    await db.collection("editorsheets").deleteMany({})
    const result = await db.collection("editorsheets").insertMany(editorSheets)

    res.json({
      message: "✅ Editor sheets seeded successfully",
      count: result.insertedIds.length,
      sheets: editorSheets,
    })
  } catch (error) {
    console.error("Error seeding editor sheets:", error)
    res.status(500).json({ error: error.message })
  }
})

// REPORTS ENDPOINTS

// EMPLOYEE DETAIL ENDPOINT (must be BEFORE /api/reports for proper route matching)
app.get("/api/reports/employee", async (req, res) => {
  try {
    console.log("[v0] Employee endpoint called with query:", req.query)
    
    if (!db) {
      console.log("[v0] Database not connected")
      return res.status(503).json({ error: "Database not connected" })
    }

    const { employeeName, period = "month" } = req.query

    if (!employeeName) {
      console.log("[v0] Employee name not provided")
      return res.status(400).json({ error: "Employee name is required" })
    }

    console.log(`[v0] Fetching records for employee: ${employeeName}, period: ${period}`)

    // Get all attendance records for this employee
    const allRecords = await db
      .collection("attendancerecords")
      .find({ employeeName: String(employeeName) })
      .sort({ date: -1 })
      .toArray()

    console.log(`[v0] Found ${allRecords.length} records for employee: ${employeeName}`)

    // Filter records based on period
    const now = new Date()
    const filteredRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.date || new Date())

      if (period === "day") {
        return recordDate.toDateString() === now.toDateString()
      } else if (period === "week") {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        return recordDate >= weekStart
      } else if (period === "month") {
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
      } else if (period === "year") {
        return recordDate.getFullYear() === now.getFullYear()
      }

      return true
    })

    // Calculate stats
    let stats = {
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalHours: 0,
    }

    filteredRecords.forEach((record) => {
      const status = (record.status || "").toLowerCase().trim()

      if (status === "present" || status === "checked-out" || status === "p") {
        stats.presentDays += 1
      } else if (status === "absent" || status === "a") {
        stats.absentDays += 1
      } else if (status === "late" || status === "l") {
        stats.lateDays += 1
      }

      if (record.hours && record.hours !== "-" && record.hours !== "N/A") {
        const hoursMatch = String(record.hours).match(/(\d+\.?\d*)\s*h/)
        if (hoursMatch) {
          stats.totalHours += parseFloat(hoursMatch[1])
        }
      }
    })

    res.json({
      records: filteredRecords.map((r) => ({
        date: r.date,
        status: r.status,
        checkInTime: r.checkInTime || r.checkIn,
        checkOutTime: r.checkOutTime || r.checkOut,
        hours: r.hours,
        employeeName: r.employeeName,
        department: r.department,
      })),
      stats: {
        ...stats,
        totalHours: Math.round(stats.totalHours * 100) / 100,
      },
    })
  } catch (error) {
    console.error("Employee detail error:", error)
    res.status(500).json({ error: error.message })
  }
})

// General reports endpoint
app.get("/api/reports", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })
    
    const { period = "month", type = "summary" } = req.query

    if (type === "summary") {
      // Get all attendance records
      const attendanceRecords = await db.collection("attendancerecords").find({}).toArray()
      console.log("[v0] Total attendance records fetched:", attendanceRecords.length)
      console.log("[v0] Sample record:", attendanceRecords[0])

      if (attendanceRecords.length === 0) {
        return res.json({
          employees: [],
          trends: [],
          overallStats: {
            totalEmployees: 0,
            avgAttendance: 0,
            avgHours: 0,
            totalRecords: 0,
          },
        })
      }

      // Group by employee and calculate stats
      const employeeStats = {}

      attendanceRecords.forEach((record) => {
        const empName = record.employeeName || record.name || "Unknown"
        if (!employeeStats[empName]) {
          employeeStats[empName] = {
            employeeName: empName,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            earlyLeaveDays: 0,
            totalHours: 0,
            expectedHours: 0,
            department: record.department || "—",
            records: [],
          }
        }

        const emp = employeeStats[empName]
        emp.totalDays += 1
        emp.records.push(record)

        // Count status - handle various status formats
        const status = (record.status || "").toLowerCase().trim()
        if (status === "present" || status === "checked-out" || status === "p") {
          emp.presentDays += 1
        } else if (status === "absent" || status === "a") {
          emp.absentDays += 1
        } else if (status === "late" || status === "l") {
          emp.lateDays += 1
          emp.presentDays += 1
        }

        // Calculate hours worked from the hours field - handle various formats
        let hoursWorked = 0
        if (record.hours && record.hours !== "-" && record.hours !== "N/A") {
          // Try to match hours in format like "8h", "8 hours", "8.5h"
          const hoursMatch = String(record.hours).match(/(\d+\.?\d*)\s*h/)
          if (hoursMatch) {
            hoursWorked = parseFloat(hoursMatch[1])
            emp.totalHours += hoursWorked
          }
        }

        emp.expectedHours += 8 // 10 AM to 6 PM = 8 hours
      })

      console.log("[v0] Unique employees:", Object.keys(employeeStats).length)

      // Convert to array and calculate percentages
      const employees = Object.values(employeeStats).map((emp) => {
        const attendancePercentage = emp.totalDays > 0 ? Math.round((emp.presentDays / emp.totalDays) * 100) : 0
        return {
          ...emp,
          attendancePercentage,
          totalHours: Math.round(emp.totalHours * 100) / 100,
          avgHoursPerDay: emp.totalDays > 0 ? Math.round((emp.totalHours / emp.totalDays) * 100) / 100 : 0,
          records: undefined, // Remove raw records
        }
      })

      // Generate trend data by week
      const trendMap = {}
      attendanceRecords.forEach((record) => {
        const date = new Date(record.date || new Date())
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay() + 1)
        const weekKey = weekStart.toISOString().split("T")[0]

        if (!trendMap[weekKey]) {
          trendMap[weekKey] = {
            week: `Week of ${weekStart.getDate()}`,
            attendance: 0,
            hours: 0,
            count: 0,
          }
        }

        if (record.status === "present" || record.status === "checked-out") {
          trendMap[weekKey].attendance += 1
        }

        if (record.hours && record.hours !== "-") {
          const hoursMatch = record.hours.match(/(\d+)h/)
          if (hoursMatch) {
            trendMap[weekKey].hours += parseInt(hoursMatch[1])
          }
        }

        trendMap[weekKey].count += 1
      })

      const trends = Object.values(trendMap)
        .map((t) => ({
          ...t,
          attendance: Math.round((t.attendance / t.count) * 100),
          hours: Math.round(t.hours * 100) / 100,
        }))
        .slice(0, 5)

      // Calculate overall stats
      const totalEmployees = Object.keys(employeeStats).length
      const avgAttendance = employees.length > 0 
        ? Math.round((employees.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / employees.length) * 100) / 100
        : 0

      const avgHours = employees.length > 0
        ? Math.round((employees.reduce((sum, emp) => sum + emp.totalHours, 0) / employees.length) * 100) / 100
        : 0

      return res.json({
        employees: employees.sort((a, b) => b.attendancePercentage - a.attendancePercentage),
        trends,
        overallStats: {
          totalEmployees,
          avgAttendance,
          avgHours,
          totalRecords: attendanceRecords.length,
        },
      })
    }

    res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    console.error("Report generation error:", error)
    res.status(500).json({ error: error.message })
  }
})

async function seedDatabase() {
  try {
    const results = {}

    // Get list of employees first
    const employees = await db.collection("users").find({ role: "employee" }).toArray()

    if (employees.length === 0) {
      console.log("No employees found to link editor sheets")
      return results
    }

    const editorSheets = [
      {
        title: "Design Document",
        sheetName: "week",
        link: "https://docs.google.com/document/d/1example",
        content: "Detailed design document for the new website",
        author: "John Smith",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        tasks: [],
      },
      {
        title: "Marketing Strategy",
        sheetName: "Vipul bhaiya",
        link: "https://docs.google.com/document/d/2example",
        content: "Marketing strategy for the upcoming campaign",
        author: "Sarah Johnson",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-14"),
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14"),
        tasks: [],
      },
      {
        title: "Code Review Notes",
        sheetName: "Mam",
        link: "https://docs.google.com/document/d/3example",
        content: "Notes from the code review session",
        author: "Mike Chen",
        employeeId: employees[0]._id,
        lastModified: new Date("2024-01-13"),
        createdAt: new Date("2024-01-13"),
        updatedAt: new Date("2024-01-13"),
        tasks: [],
      },
    ]

    await db.collection("editorsheets").deleteMany({})
    const sheetResult = await db.collection("editorsheets").insertMany(editorSheets)
    results.editorSheets = sheetResult.insertedIds.length

    return results
  } catch (error) {
    console.error("Error seeding editor sheets:", error)
    return { error: error.message }
  }
}

app.post("/api/seed/all", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not connected" })

    // Call all seed endpoints
    const results = {}

    // Seed employees
    const employees = [
      {
        name: "John Smith",
        phone: "+1-555-0101",
        department: "Engineering",
        status: "active",
        email: "john.smith@company.com",
        salary: 85000,
        joinDate: "2023-01-15",
        joiningDate: "2023-01-15",
        role: "Senior Developer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Johnson",
        phone: "+1-555-0102",
        department: "Marketing",
        status: "active",
        email: "sarah.johnson@company.com",
        salary: 72000,
        joinDate: "2023-03-20",
        joiningDate: "2023-03-20",
        role: "Marketing Manager",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mike Chen",
        phone: "+1-555-0103",
        department: "Engineering",
        status: "active",
        email: "mike.chen@company.com",
        salary: 90000,
        joinDate: "2022-11-10",
        joiningDate: "2022-11-10",
        role: "Lead Engineer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Emily Davis",
        phone: "+1-555-0104",
        department: "HR",
        status: "active",
        email: "emily.davis@company.com",
        salary: 65000,
        joinDate: "2023-05-01",
        joiningDate: "2023-05-01",
        role: "HR Specialist",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Robert Wilson",
        phone: "+1-555-0105",
        department: "Finance",
        status: "on_leave",
        email: "robert.wilson@company.com",
        salary: 80000,
        joinDate: "2023-02-14",
        joiningDate: "2023-02-14",
        role: "Financial Analyst",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Lisa Anderson",
        phone: "+1-555-0106",
        department: "Engineering",
        status: "active",
        email: "lisa.anderson@company.com",
        salary: 88000,
        joinDate: "2023-04-03",
        joiningDate: "2023-04-03",
        role: "Frontend Developer",
        avatar: "/placeholder-user.jpg",
        password: await bcrypt.hash("password123", 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("users").deleteMany({})
    const empResult = await db.collection("users").insertMany(employees)
    results.employees = empResult.insertedIds.length

    // Seed tasks
    const tasks = [
      {
        id: 1,
        title: "Complete Project Proposal",
        description: "Finalize and submit the Q2 project proposal to management",
        priority: "high",
        status: "inProgress",
        assignee: { name: "John Smith", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["proposal", "important"],
      },
      {
        id: 2,
        title: "Client Presentation",
        description: "Prepare and deliver presentation to new client about our services",
        priority: "high",
        status: "todo",
        assignee: { name: "Sarah Johnson", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["client", "presentation"],
      },
      {
        id: 3,
        title: "Update Documentation",
        description: "Update API documentation with new endpoints and parameters",
        priority: "medium",
        status: "todo",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-16",
        tags: ["documentation"],
      },
      {
        id: 4,
        title: "Code Review",
        description: "Review pull requests from junior developers",
        priority: "high",
        status: "inProgress",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-15",
        tags: ["code", "review"],
      },
      {
        id: 5,
        title: "Bug Fixes",
        description: "Fix critical bugs reported in the latest release",
        priority: "high",
        status: "inProgress",
        assignee: { name: "John Smith", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-16",
        tags: ["bugs", "critical"],
      },
      {
        id: 6,
        title: "Database Optimization",
        description: "Optimize slow queries in the user dashboard",
        priority: "medium",
        status: "todo",
        assignee: { name: "Mike Chen", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-17",
        tags: ["database", "performance"],
      },
      {
        id: 7,
        title: "Training Session",
        description: "Conduct training session on new development tools",
        priority: "low",
        status: "completed",
        assignee: { name: "Sarah Johnson", avatar: "/placeholder-user.jpg" },
        dueDate: "2024-01-14",
        tags: ["training"],
      },
    ]

    await db.collection("tasks").deleteMany({})
    const taskResult = await db.collection("tasks").insertMany(tasks)
    results.tasks = taskResult.insertedIds.length

    // Seed projects
    const projects = [
      {
        id: "proj-001",
        name: "Website Redesign",
        description: "Complete redesign of company website with modern UI/UX",
        progress: 75,
        status: "in_progress",
        priority: "high",
        deadline: "2024-02-28",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 12, completed: 9 },
      },
      {
        id: "proj-002",
        name: "Mobile App Development",
        description: "Develop cross-platform mobile application for iOS and Android",
        progress: 45,
        status: "in_progress",
        priority: "high",
        deadline: "2024-04-15",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 20, completed: 9 },
      },
      {
        id: "proj-003",
        name: "API Integration",
        description: "Integrate third-party APIs for enhanced functionality",
        progress: 100,
        status: "completed",
        priority: "medium",
        deadline: "2024-01-10",
        team: ["/placeholder-user.jpg"],
        tasks: { total: 8, completed: 8 },
      },
      {
        id: "proj-004",
        name: "Database Migration",
        description: "Migrate legacy database to modern cloud infrastructure",
        progress: 60,
        status: "in_progress",
        priority: "high",
        deadline: "2024-03-30",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 15, completed: 9 },
      },
      {
        id: "proj-005",
        name: "Security Audit",
        description: "Comprehensive security audit and vulnerability assessment",
        progress: 30,
        status: "on_hold",
        priority: "medium",
        deadline: "2024-05-20",
        team: ["/placeholder-user.jpg"],
        tasks: { total: 10, completed: 3 },
      },
      {
        id: "proj-006",
        name: "Performance Optimization",
        description: "Optimize application performance and reduce load times",
        progress: 50,
        status: "in_progress",
        priority: "medium",
        deadline: "2024-02-15",
        team: ["/placeholder-user.jpg", "/placeholder-user.jpg"],
        tasks: { total: 14, completed: 7 },
      },
    ]

    await db.collection("projects").deleteMany({})
    const projResult = await db.collection("projects").insertMany(projects)
    results.projects = projResult.insertedIds.length

    // Seed invoices
    const invoices = [
      {
        id: "INV-001",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Website Redesign",
        client: "ABC Corporation",
        amount: 500000,
        gstAmount: 90000,
        totalAmount: 590000,
        hasGST: true,
        gstPercentage: 18,
        status: "paid",
        dueDate: "Jan 15, 2024",
        issuedDate: "Dec 15, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-002",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Mobile App Development",
        client: "XYZ Enterprises",
        amount: 800000,
        gstAmount: 144000,
        totalAmount: 944000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 20, 2024",
        issuedDate: "Dec 20, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-003",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "API Integration",
        client: "Global Tech Co",
        amount: 350000,
        gstAmount: 63000,
        totalAmount: 413000,
        hasGST: true,
        gstPercentage: 18,
        status: "overdue",
        dueDate: "Dec 20, 2023",
        issuedDate: "Nov 20, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-004",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "Database Migration",
        client: "CloudBase Systems",
        amount: 600000,
        gstAmount: 108000,
        totalAmount: 708000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 25, 2024",
        issuedDate: "Dec 25, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-005",
        company: "Tech Solutions Inc",
        companyId: "comp-001",
        project: "Security Audit",
        client: "FinanceHub Inc",
        amount: 250000,
        gstAmount: 45000,
        totalAmount: 295000,
        hasGST: true,
        gstPercentage: 18,
        status: "paid",
        dueDate: "Jan 10, 2024",
        issuedDate: "Dec 10, 2023",
        clientImage: "/placeholder-user.jpg",
      },
      {
        id: "INV-006",
        company: "Digital Services Ltd",
        companyId: "comp-002",
        project: "Performance Optimization",
        client: "SpeedTech Co",
        amount: 400000,
        gstAmount: 72000,
        totalAmount: 472000,
        hasGST: true,
        gstPercentage: 18,
        status: "pending",
        dueDate: "Jan 30, 2024",
        issuedDate: "Dec 30, 2023",
        clientImage: "/placeholder-user.jpg",
      },
    ]

    await db.collection("invoices").deleteMany({})
    const invResult = await db.collection("invoices").insertMany(invoices)
    results.invoices = invResult.insertedIds.length

    // Seed attendance records
    const attendanceRecords = [
      {
        employeeId: "emp-001",
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:55 AM",
        clockOut: "06:02 PM",
        status: "present",
        hours: "9h 7m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-002",
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        clockIn: "09:15 AM",
        clockOut: "-",
        status: "late",
        hours: "7h 45m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-003",
        name: "Emily Rodriguez",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:30 AM",
        clockOut: "05:45 PM",
        status: "present",
        hours: "9h 15m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-004",
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        clockIn: "-",
        clockOut: "-",
        status: "absent",
        hours: "-",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-005",
        name: "Lisa Thompson",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:45 AM",
        clockOut: "-",
        status: "present",
        hours: "8h 15m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-006",
        name: "John Smith",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        clockIn: "09:00 AM",
        clockOut: "06:30 PM",
        status: "present",
        hours: "9h 30m",
        date: "2024-12-30",
      },
      {
        employeeId: "emp-007",
        name: "Amanda Foster",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        clockIn: "08:20 AM",
        clockOut: "05:00 PM",
        status: "present",
        hours: "8h 40m",
        date: "2024-12-30",
      },
    ]

    await db.collection("attendancerecords").deleteMany({})
    const attResult = await db.collection("attendancerecords").insertMany(attendanceRecords)
    results.attendanceRecords = attResult.insertedIds.length

    // Seed editor sheets
    const editorSheets = [
      {
        title: "Design Document",
        sheetName: "week",
        link: "https://docs.google.com/document/d/1example",
        content: "Detailed design document for the new website",
        author: "John Smith",
        employeeId: empResult.insertedIds[0],
        lastModified: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        tasks: [],
      },
      {
        title: "Marketing Strategy",
        sheetName: "Vipul bhaiya",
        link: "https://docs.google.com/document/d/2example",
        content: "Marketing strategy for the upcoming campaign",
        author: "Sarah Johnson",
        employeeId: empResult.insertedIds[0],
        lastModified: new Date("2024-01-14"),
        createdAt: new Date("2024-01-14"),
        updatedAt: new Date("2024-01-14"),
        tasks: [],
      },
      {
        title: "Code Review Notes",
        sheetName: "Mam",
        link: "https://docs.google.com/document/d/3example",
        content: "Notes from the code review session",
        author: "Mike Chen",
        employeeId: empResult.insertedIds[0],
        lastModified: new Date("2024-01-13"),
        createdAt: new Date("2024-01-13"),
        updatedAt: new Date("2024-01-13"),
        tasks: [],
      },
    ]

    await db.collection("editorsheets").deleteMany({})
    const sheetResult = await db.collection("editorsheets").insertMany(editorSheets)
    results.editorSheets = sheetResult.insertedIds.length

    console.log("✅ All collections seeded successfully", results)

    res.json({
      message: "✅ All collections seeded successfully with sample data",
      results,
      summary: `Seeded ${empResult.insertedIds.length} employees, ${taskResult.insertedIds.length} tasks, ${projResult.insertedIds.length} projects, ${invResult.insertedIds.length} invoices, ${attResult.insertedIds.length} attendance records, and ${results.editorSheets} editor sheets`,
    })
  } catch (error) {
    console.error("Error seeding all collections:", error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
async function startServer() {
  console.log("🚀 Starting backend server...")
  await connectDB()

  app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`)
    console.log(`📝 MongoDB Database: ${DB_NAME}`)
    console.log(`✅ All API endpoints are ready`)
    console.log(`🔗 Frontend should connect to http://localhost:${PORT}`)
    console.log(`\n📌 SEED YOUR DATA:`)
    console.log(`   GET http://localhost:${PORT}/api/seed/all`)
    console.log(`\n Or individually:`)
    console.log(`   GET http://localhost:${PORT}/api/seed/employees`)
    console.log(`   GET http://localhost:${PORT}/api/seed/tasks`)
    console.log(`   GET http://localhost:${PORT}/api/seed/projects`)
    console.log(`   GET http://localhost:${PORT}/api/seed/invoices`)
    console.log(`   GET http://localhost:${PORT}/api/seed/attendance`)
    console.log(`   GET http://localhost:${PORT}/api/seed/editor-sheets`)
  })
}

startServer()
