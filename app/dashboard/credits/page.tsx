"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, CreditCard, Check, Loader2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { CREDIT_PACKAGES } from "@/lib/stripe"

interface UserData {
  credits: number
  subscription: {
    plan: {
      name: string
      credits: number
    }
  } | null
}

export default function CreditsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setUserData({
          credits: data.credits,
          subscription: data.subscription
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseCredits = async (packageKey: string) => {
    setIsPurchasing(true)
    try {
      const response = await fetch('/api/stripe/create-credit-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: packageKey })
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create credit purchase')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase credits",
        variant: "destructive"
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Credits</h1>
          <p className="text-muted-foreground">Purchase additional credits for your SEO tools</p>
        </div>
      </div>

      {/* Current Credits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {userData?.credits?.toLocaleString() || 0} Credits
                </div>
                {userData?.subscription && (
                  <p className="text-muted-foreground mt-1">
                    {userData.subscription.plan.name} - {userData.subscription.plan.credits?.toLocaleString()} credits/month
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Available
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credit Packages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Purchase Additional Credits
            </CardTitle>
            <CardDescription>
              One-time credit packages to boost your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(CREDIT_PACKAGES).map(([packageKey, creditPackage]) => {
                const pricePerCredit = (creditPackage.price / creditPackage.credits).toFixed(3)
                
                return (
                  <div
                    key={packageKey}
                    className="relative p-6 border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">{creditPackage.name}</h3>
                        <div className="flex items-baseline justify-center gap-1 mt-2">
                          <span className="text-3xl font-bold">${creditPackage.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${pricePerCredit} per credit
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          <Zap className="h-4 w-4" />
                          {creditPackage.credits.toLocaleString()} Credits
                        </div>
                      </div>

                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          One-time purchase
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          Credits never expire
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          Use with any tool
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          Instant activation
                        </li>
                      </ul>

                      <Button
                        className="w-full"
                        onClick={() => handlePurchaseCredits(packageKey)}
                        disabled={isPurchasing}
                      >
                        {isPurchasing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Purchase Credits
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How Credits Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>How Credits Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Credit Usage</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Keyword Research: 1-5 credits per search</li>
                  <li>• Backlink Analysis: 2-10 credits per domain</li>
                  <li>• SEO Audit: 5-15 credits per page</li>
                  <li>• AI Content Tools: 1-3 credits per use</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Credit Benefits</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Credits never expire</li>
                  <li>• Use across all tools</li>
                  <li>• Instant activation</li>
                  <li>• Secure payment processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}