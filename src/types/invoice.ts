export interface Company {
  id: string
  name: string
  gstNumber: string
  address: string
  email: string
  phone: string
  logo?: string
}

export interface Invoice {
  id: string
  company: string
  companyId: string
  project: string
  client: string
  amount: number
  gstAmount: number
  totalAmount: number
  hasGST: boolean
  gstPercentage: number
  status: "paid" | "pending" | "overdue"
  dueDate: string
  issuedDate: string
  description?: string
  clientImage?: string
  paymentTerms?: string
  bankDetails?: {
    accountName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  }
}
