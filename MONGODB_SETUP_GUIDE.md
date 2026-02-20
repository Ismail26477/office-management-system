# MongoDB Setup Guide

## Your Current Configuration
Your app is already configured with MongoDB! Here's what's set up:

- **Database Host:** MongoDB Atlas (cloud-based)
- **Database Name:** `office_management`
- **Connection:** Already in `.env` file

## How to Verify Your Connection

### Step 1: Make sure dependencies are installed
\`\`\`bash
npm install
\`\`\`

### Step 2: Start the backend server
\`\`\`bash
npm run dev:backend
\`\`\`

You should see:
\`\`\`
✅ Connected to MongoDB
📦 Database: office_management
🚀 Backend server running on http://localhost:5000
\`\`\`

### Step 3: Test the connection
Open your browser and visit:
\`\`\`
http://localhost:5000/api/health
\`\`\`

You should see:
\`\`\`json
{
  "status": "ok",
  "message": "Backend server is running and MongoDB is connected"
}
\`\`\`

## MongoDB Collections

Your database has these collections ready:
- `employees` - Store employee information
- `tasks` - Store task data
- `projects` - Store project information
- `invoices` - Store invoice data

## If Connection Fails

### Error: "MongoDB connection error"

**Solution 1:** Check your internet connection
- Make sure you're connected to the internet (MongoDB Atlas requires it)

**Solution 2:** Verify the MongoDB URI
- The URI in `.env` should work as-is if you're using the default credentials
- If you want to use your own MongoDB account:
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create a free account
  3. Create a cluster
  4. Get your connection string
  5. Replace the `MONGODB_URI` in `.env` with your connection string

**Solution 3:** Allow Network Access
- If using MongoDB Atlas, make sure your IP is whitelisted:
  1. Go to MongoDB Atlas → Network Access
  2. Click "Add IP Address"
  3. Select "Allow access from anywhere" OR add your current IP

## Running the Full App

To run both frontend and backend together:
\`\`\`bash
npm run dev
\`\`\`

This will:
- Start MongoDB connection
- Start backend server on port 5000
- Start frontend on port 5173 (Vite)

## API Endpoints Available

- `GET /api/health` - Check if server is running
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

Same patterns for `/api/tasks`, `/api/projects`, and `/api/invoices`
