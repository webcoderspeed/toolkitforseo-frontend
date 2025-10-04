"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, Zap, Check, X, Loader2, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe"

interface UserSubscription {
  id: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    price: number
    interval: string
    features: string[]
  }
}

export default function SubscriptionPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()
      
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create subscription')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateSubscription = async (planId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Your subscription has been updated successfully"
        })
        fetchSubscription()
      } else {
        throw new Error(data.error || 'Failed to update subscription')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled. You'll have access until the end of your current billing period."
        })
        fetchSubscription()
      } else {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
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
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
                  <p className="text-muted-foreground">
                    ${subscription.plan.price}/{subscription.plan.interval}
                  </p>
                </div>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Next billing: {subscription.cancelAtPeriodEnd ? 'Cancelled' : new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Your subscription is set to cancel at the end of the current billing period.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Available Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              {subscription ? 'Upgrade or downgrade your subscription' : 'Choose a plan to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
                const isCurrentPlan = subscription?.plan.id === planKey
                const isUpgrade = subscription && plan.price > subscription.plan.price
                const isDowngrade = subscription && plan.price < subscription.plan.price

                return (
                  <div
                    key={planKey}
                    className={`relative p-6 border rounded-lg ${
                      isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {isCurrentPlan && (
                      <Badge className="absolute -top-2 left-4 bg-blue-500">
                        Current Plan
                      </Badge>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4">
                        {!subscription ? (
                          <Button
                            className="w-full"
                            onClick={() => handleSubscribe(planKey)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Subscribe
                          </Button>
                        ) : isCurrentPlan ? (
                          <Button className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={isUpgrade ? "default" : "outline"}
                            onClick={() => handleUpdateSubscription(planKey)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isUpgrade ? 'Upgrade' : 'Downgrade'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}