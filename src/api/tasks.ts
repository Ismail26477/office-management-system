const API_URL = "/api"

export async function fetchTasks(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/tasks`)
    if (!response.ok) throw new Error("Failed to fetch tasks")
    return await response.json()
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

export async function fetchTasksByStatus(status: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/tasks?status=${status}`)
    if (!response.ok) throw new Error("Failed to fetch tasks by status")
    return await response.json()
  } catch (error) {
    console.error("Error fetching tasks by status:", error)
    return []
  }
}

export async function createTask(taskData: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    })
    if (!response.ok) throw new Error("Failed to create task")
    return await response.json()
  } catch (error) {
    console.error("Error creating task:", error)
    return null
  }
}

export async function updateTaskStatus(id: string, status: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error("Failed to update task")
    return await response.json()
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}
