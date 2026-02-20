const API_URL = "/api"

export async function fetchEmployees(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/employees`)
    if (!response.ok) throw new Error("Failed to fetch employees")
    return await response.json()
  } catch (error) {
    console.error("Error fetching employees:", error)
    return []
  }
}

export async function fetchEmployeeById(id: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`)
    if (!response.ok) throw new Error("Failed to fetch employee")
    return await response.json()
  } catch (error) {
    console.error("Error fetching employee:", error)
    return null
  }
}

export async function createEmployee(employeeData: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    })
    if (!response.ok) throw new Error("Failed to create employee")
    return await response.json()
  } catch (error) {
    console.error("Error creating employee:", error)
    return null
  }
}

export async function updateEmployee(id: string, employeeData: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    })
    if (!response.ok) throw new Error("Failed to update employee")
    return await response.json()
  } catch (error) {
    console.error("Error updating employee:", error)
    return null
  }
}

export async function deleteEmployee(id: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete employee")
    return await response.json()
  } catch (error) {
    console.error("Error deleting employee:", error)
    return null
  }
}

export async function changePassword(id: string, newPassword: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    })
    if (!response.ok) throw new Error("Failed to change password")
    return await response.json()
  } catch (error) {
    console.error("Error changing password:", error)
    return null
  }
}

export async function fetchEmployeeStats(): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/employees/stats`)
    if (!response.ok) {
      console.warn("[v0] Stats endpoint returned:", response.status)
      throw new Error(`Failed to fetch employee stats: ${response.status}`)
    }
    const data = await response.json()
    console.log("[v0] Employee stats received:", data)
    return data
  } catch (error) {
    console.error("[v0] Error fetching employee stats:", error)
    return {
      totalEmployees: 0,
      presentToday: 0,
      onLeave: 0,
      averageSalary: 0,
      departmentDistribution: [],
    }
  }
}

export async function fetchTodayAttendance(): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/attendance/today`)
    if (!response.ok) throw new Error("Failed to fetch today's attendance")
    return await response.json()
  } catch (error) {
    console.error("Error fetching today's attendance:", error)
    return {
      presentToday: 0,
      onLeave: 0,
      absent: 0,
    }
  }
}
