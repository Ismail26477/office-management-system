"use client"
import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Download, Send, Eye, Trash2, Calendar, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewInvoiceDialog } from "@/components/invoice/NewInvoiceDialog"
import type { Invoice } from "@/types/invoice"
import { apiClient } from "@/lib/api"

const statusColors = {
  paid: "status-success",
  pending: "status-warning",
  overdue: "status-destructive",
}

const statusLabels = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all")

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getInvoices()
        setInvoices(data)
      } catch (error) {
        console.error("[v0] Failed to load invoices:", error)
      } finally {
        setLoading(false)
      }
    }
    loadInvoices()
  }, [])

  const handleCreateInvoice = (formData: any) => {
    const newInvoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      company: formData.selectedCompany?.name || "",
      companyId: formData.selectedCompany?.id,
      project: formData.projectName,
      client: formData.clientName,
      amount: formData.amount,
      gstAmount: formData.gstAmount,
      totalAmount: formData.totalAmount,
      hasGST: formData.hasGST,
      gstPercentage: formData.gstRate,
      status: "pending",
      dueDate: new Date(Date.now() + Number.parseInt(formData.paymentTerms) * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-GB",
        { year: "numeric", month: "short", day: "numeric" },
      ),
      issuedDate: new Date().toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }),
    }

    setInvoices([newInvoice, ...invoices])
  }

  const filteredInvoices =
    selectedCompanyFilter === "all" ? invoices : invoices.filter((inv) => inv.companyId === selectedCompanyFilter)

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalPaid = filteredInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalOverdue = filteredInvoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-2">Manage and track all your Indian invoices with GST support</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* New Invoice Dialog */}
      <NewInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateInvoice={handleCreateInvoice}
        companies={invoices.map((inv) => ({ id: inv.companyId, name: inv.company }))}
      />

      {/* Company Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCompanyFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCompanyFilter("all")}
        >
          All Companies
        </Button>
        {invoices.map((inv) => (
          <Button
            key={inv.companyId}
            variant={selectedCompanyFilter === inv.companyId ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCompanyFilter(inv.companyId)}
            className="whitespace-nowrap"
          >
            {inv.company.split(" ")[0]}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₹ {(totalInvoiced / 100000).toFixed(1)}L</span>
                <span className="text-xs text-success">+12.5%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{filteredInvoices.length} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₹ {(totalPaid / 100000).toFixed(1)}L</span>
                <Badge className="status-pill status-success">
                  {filteredInvoices.length > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₹ {(totalOverdue / 1000).toFixed(0)}K</span>
                <Badge className="status-pill status-destructive">
                  {invoices.filter((inv) => inv.status === "overdue").length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <div className="space-y-2">
          {filteredInvoices.length === 0 ? (
            <Card className="p-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No invoices found for selected company</p>
            </Card>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <div
                key={invoice.id}
                className="bg-card rounded-lg border border-border/50 p-4 flex items-center justify-between hover:shadow-sm transition-all opacity-0 animate-slide-up"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={invoice.clientImage || "/placeholder.svg"} />
                    <AvatarFallback>{invoice.client.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{invoice.id}</p>
                      <Badge className={cn("status-pill", statusColors[invoice.status as keyof typeof statusColors])}>
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </Badge>
                      {invoice.hasGST && (
                        <Badge variant="outline" className="text-xs">
                          GST {invoice.gstPercentage}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.project} • {invoice.client}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹ {invoice.totalAmount.toLocaleString("en-IN")}</p>
                    {invoice.hasGST && (
                      <p className="text-xs text-muted-foreground">
                        (₹ {invoice.gstAmount.toLocaleString("en-IN")} GST)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                      <Calendar className="h-3 w-3" />
                      {invoice.dueDate}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Send className="h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Invoices
