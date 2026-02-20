const API_URL = "/api"

export async function fetchProjects(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/projects`)
    if (!response.ok) throw new Error("Failed to fetch projects")
    return await response.json()
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function fetchProjectById(id: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`)
    if (!response.ok) throw new Error("Failed to fetch project")
    return await response.json()
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

export async function createProject(projectData: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    })
    if (!response.ok) throw new Error("Failed to create project")
    return await response.json()
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}
