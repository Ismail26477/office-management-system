"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import type { Company } from "@/types/invoice"

interface NewInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateInvoice: (formData: any) => void
  companies: Company[]
}

const GST_RATES = [
  { label: "5%", value: 5 },
  { label: "12%", value: 12 },
  { label: "18%", value: 18 },
  { label: "28%", value: 28 },
]

export function NewInvoiceDialog({ open, onOpenChange, onCreateInvoice, companies }: NewInvoiceDialogProps) {
  const [selectedCompany, setSelectedCompany] = useState("")
  const [hasGST, setHasGST] = useState(true)
  const [gstRate, setGstRate] = useState(18)
  const [amount, setAmount] = useState("")
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("30")
  const [description, setDescription] = useState("")

  const calculateGST = (baseAmount: number) => {
    if (!hasGST) return 0
    return (baseAmount * gstRate) / 100
  }

  const baseAmount = Number.parseFloat(amount) || 0
  const gstAmount = calculateGST(baseAmount)
  const totalAmount = baseAmount + gstAmount

  const handleCreate = () => {
    if (!selectedCompany || !clientName || !projectName || !amount) {
      alert("Please fill in all required fields")
      return
    }

    onCreateInvoice({
      selectedCompany,
      hasGST,
      gstRate,
      amount: baseAmount,
      gstAmount,
      totalAmount,
      clientName,
      projectName,
      paymentTerms,
      description,
    })

    // Reset form
    setSelectedCompany("")
    setHasGST(true)
    setGstRate(18)
    setAmount("")
    setClientName("")
    setProjectName("")
    setPaymentTerms("30")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>Create a new invoice for your company with GST calculation support</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex flex-col">
                      <span>{company.name}</span>
                      <span className="text-xs text-muted-foreground">GST: {company.gstNumber}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input
                id="client-name"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Invoice Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in INR"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">₹ {baseAmount.toLocaleString("en-IN")}</p>
          </div>

          {/* GST Section */}
          <Card className="p-4 bg-secondary/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold cursor-pointer">Apply GST (Goods & Services Tax)</Label>
                <Switch checked={hasGST} onCheckedChange={setHasGST} />
              </div>

              {hasGST && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select GST Rate</Label>
                  <RadioGroup value={gstRate.toString()} onValueChange={(val) => setGstRate(Number.parseInt(val))}>
                    <div className="grid grid-cols-2 gap-3">
                      {GST_RATES.map((rate) => (
                        <div key={rate.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={rate.value.toString()} id={`gst-${rate.value}`} />
                          <Label htmlFor={`gst-${rate.value}`} className="font-normal cursor-pointer">
                            {rate.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* GST Calculation Display */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Base Amount</span>
                      <span className="font-semibold">₹ {baseAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GST ({gstRate}%)</span>
                      <span className="font-semibold">
                        ₹ {gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-primary/10 p-2 rounded font-semibold">
                      <span>Total Amount</span>
                      <span>₹ {totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms (Days)</Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Due on Receipt</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="15">15 Days</SelectItem>
                <SelectItem value="30">30 Days (Net 30)</SelectItem>
                <SelectItem value="45">45 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add invoice description or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Required Fields Note */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
            <Badge variant="outline" className="mb-2">
              Info
            </Badge>
            <p className="text-xs text-foreground">
              Fields marked with * are required. Make sure to select a company and fill in all client details for proper
              invoice generation.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
