const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

// Helper function with retry logic and timeout
const fetchWithTimeout = async (url: string, options = {}, maxRetries = 2, timeout = 8000) => {
  let lastError
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
      }
    }
  }
  throw lastError
}

export const apiClient = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error("Failed to login")
    return response.json()
  },

  async getEmployees() {
    return fetchWithTimeout(`${API_BASE_URL}/employees`)
  },

  async getTasks() {
    return fetchWithTimeout(`${API_BASE_URL}/tasks`)
  },

  async getProjects() {
    return fetchWithTimeout(`${API_BASE_URL}/projects`)
  },

  async getInvoices() {
    return fetchWithTimeout(`${API_BASE_URL}/invoices`)
  },

  async getAttendance() {
    try {
      const data = await fetchWithTimeout(`${API_BASE_URL}/attendance?limit=1000`, {}, 2, 8000)
      // Handle both new format (with data key) and old format (direct array)
      return Array.isArray(data) ? data : (data.data || [])
    } catch (error) {
      console.error("[v0] Attendance fetch error:", error)
      return []
    }
  },

  async getDailyTasks() {
    const response = await fetch(`${API_BASE_URL}/daily-tasks`)
    if (!response.ok) throw new Error("Failed to fetch daily tasks")
    return response.json()
  },

  async getEditorSheets() {
    const response = await fetch(`${API_BASE_URL}/editor-sheets`)
    if (!response.ok) throw new Error("Failed to fetch editor sheets")
    return response.json()
  },

  async updateDailyTask(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/daily-tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update daily task")
    return response.json()
  },
}
