const API_URL = "/api"

export async function fetchInvoices(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/invoices`)
    if (!response.ok) throw new Error("Failed to fetch invoices")
    return await response.json()
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
}

export async function fetchInvoicesByCompany(companyId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/invoices?companyId=${companyId}`)
    if (!response.ok) throw new Error("Failed to fetch invoices by company")
    return await response.json()
  } catch (error) {
    console.error("Error fetching invoices by company:", error)
    return []
  }
}

export async function createInvoice(invoiceData: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    })
    if (!response.ok) throw new Error("Failed to create invoice")
    return await response.json()
  } catch (error) {
    console.error("Error creating invoice:", error)
    return null
  }
}
