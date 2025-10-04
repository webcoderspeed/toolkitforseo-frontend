"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { History, Download, Loader2, CreditCard, Zap, ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Transaction {
  id: string
  date: string
  type: "credit-purchase" | "credit-usage"
  description: string
  amount: number
  status: "completed" | "pending" | "failed"
  credits?: number
}

export default function SubscriptionHistoryPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)
  const [creditStats, setCreditStats] = useState<{
    currentCredits: number
    monthlyUsage: number
  } | null>(null)

  useEffect(() => {
    fetchTransactions()
    fetchCreditStats()
  }, [])

  const fetchCreditStats = async () => {
    try {
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        setCreditStats({
          currentCredits: data.currentCredits,
          monthlyUsage: data.monthlyUsage
        })
      }
    } catch (error) {
      console.error('Error fetching credit stats:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/user/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        setFilteredTransactions(data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', response.status, response.statusText)
        setTransactions([])
        setFilteredTransactions([])
        toast({
          title: "Error",
          description: "Failed to load transaction history. Please try again later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
      setFilteredTransactions([])
      toast({
        title: "Error",
        description: "Failed to load transaction history. Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Apply filters
    let result = [...transactions]

    // Filter by type
    if (filter !== "all") {
      result = result.filter((transaction) => transaction.type === filter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) || transaction.id.toLowerCase().includes(query),
      )
    }

    setFilteredTransactions(result)
  }, [filter, searchQuery, transactions])

  const handleDownloadInvoice = (transactionId: string) => {
    // Set downloading state for this transaction
    setDownloadingInvoice(transactionId)

    // Simulate download delay
    setTimeout(() => {
      // Create a CSV content for the invoice
      const csvContent = `Transaction ID,Date,Description,Amount\n${transactionId},2023-05-15,"Credit Purchase - 1000 Credits",19.00`

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `invoice_${transactionId}.csv`)

      // Append the link to the document
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Reset downloading state
      setDownloadingInvoice(null)

      toast({
        title: "Invoice downloaded",
        description: `Invoice for transaction ${transactionId} has been downloaded as CSV.`,
      })
    }, 1000)
  }

  const downloadCSV = () => {
    const csvContent = [
      ["Date", "Type", "Description", "Amount", "Status", "Credits"],
      ...filteredTransactions.map(transaction => [
        transaction.date,
        transaction.type === "credit-purchase" ? "Credit Purchase" : "Credit Usage",
        transaction.description,
        transaction.amount > 0 ? `$${transaction.amount.toFixed(2)}` : "$0.00",
        transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
        transaction.credits?.toString() || "0"
      ])
    ]
      .map(row => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transaction-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Credit & Transaction History</h1>
        <p className="text-slate-600">View your credit purchases and usage history</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your past transactions and credit usage</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="credit-purchase">Credit Purchases</SelectItem>
                  <SelectItem value="credit-usage">Credit Usage</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[220px]"
              />
              <Button 
                variant="outline" 
                onClick={downloadCSV}
                className="w-full sm:w-auto"
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Credits</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                        <td className="py-3 px-4 text-sm font-medium">{transaction.description}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              transaction.type === "credit-purchase"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            <span className="flex items-center gap-1">
                              {transaction.type === "credit-purchase" ? (
                                <Zap className="h-3 w-3" />
                              ) : (
                                <History className="h-3 w-3" />
                              )}
                              {transaction.type === "credit-purchase" ? "Purchase" : "Usage"}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.amount > 0 ? `$${transaction.amount.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.credits ? (
                            <span
                              className={`flex items-center justify-end gap-1 ${transaction.credits > 0 ? "text-emerald-600" : "text-blue-600"}`}
                            >
                              {transaction.credits > 0 ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              {Math.abs(transaction.credits)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : transaction.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {transaction.type === "credit-purchase" && transaction.amount > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(transaction.id)}
                              disabled={downloadingInvoice === transaction.id}
                            >
                              {downloadingInvoice === transaction.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No transactions found</h3>
                <p className="text-slate-500 mt-1">
                  {searchQuery || filter !== "all"
                    ? "Try changing your search or filter criteria"
                    : "Your transaction history will appear here"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="max-w-md mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Credit Summary</CardTitle>
              <CardDescription>Overview of your credit usage and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Available Credits</h3>
                    <p className="text-2xl font-bold mt-1">
                      {creditStats ? creditStats.currentCredits.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Used This Month</h3>
                    <p className="text-2xl font-bold mt-1">
                      {creditStats ? creditStats.monthlyUsage.toLocaleString() : '...'}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/settings" className="w-full">
                   Buy More Credits
                 </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
