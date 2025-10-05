"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, Key, Shield, Bell, Loader2, Check, X, Info, AlertTriangle, Zap, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useStripe } from "@/hooks/useStripe"

export default function SettingsPage() {
  const { toast } = useToast()
  const { purchaseCredits, createSubscription, manageSubscription, loading: stripeLoading } = useStripe()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("subscription")

  const [subscriptionPlan, setSubscriptionPlan] = useState("free")
  const [subscription, setSubscription] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    gemini: "",
    anthropic: "",
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    weeklyReport: true,
    newFeatures: true,
  })

  const [credits, setCredits] = useState(0)
  const [creditsUsedThisMonth, setCreditsUsedThisMonth] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [processingCredits, setProcessingCredits] = useState<number | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {

      const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        setCredits(user.credits)
        setCreditsUsedThisMonth(user.creditsUsedThisMonth)
        setCurrentBalance(user.currentBalance)
        setPaymentMethod(user.paymentMethod)
        setSubscription(user.subscription)
        setSubscriptionPlan(user.subscription ? 'pro' : 'free')
        setNotifications({
          email: user.preferences.emailNotifications,
          push: false,
          marketing: false,
          weeklyReport: true,
          newFeatures: true
        })
        
        // Load API keys if available
        if (user.apiKeys) {
          setApiKeys({
            openai: user.apiKeys.openai || "",
            gemini: user.apiKeys.gemini || "",
            anthropic: user.apiKeys.anthropic || "",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

    fetchUserSettings()
  }, [])



  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApiKeys((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveApiKeys = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKeys: {
            openai: apiKeys.openai,
            gemini: apiKeys.gemini,
            anthropic: apiKeys.anthropic,
          }
        })
      })

      if (response.ok) {
        toast({
          title: "API keys saved",
          description: "Your API keys have been updated successfully.",
        })
      } else {
        throw new Error('Failed to save API keys')
      }
    } catch (error) {
      console.error('Error saving API keys:', error)
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleNotification = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            emailNotifications: notifications.email,
            defaultAiVendor: 'gemini'
          }
        })
      })

      if (response.ok) {
        toast({
          title: "Notification preferences saved",
          description: "Your notification settings have been updated.",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubscribe = async (plan: "pro" | "enterprise") => {
    setProcessingPlan(plan)
    try {
      await createSubscription(plan)
      // The subscription will be updated via webhook after successful payment
      toast({
        title: "Redirecting to Checkout",
        description: `You'll be redirected to complete your ${plan} subscription.`,
      })
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    setProcessingPlan("free")
    try {
      await manageSubscription("cancel")
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will be cancelled at the end of the current billing period.",
      })
    } catch (error) {
      console.error("Cancellation error:", error)
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleBuyCredits = async (amount: number, price: number) => {
    setProcessingCredits(amount)
    try {
      // Map credit amounts to package types
      let packageType = "small"
      if (amount === 1500) packageType = "medium"
      if (amount === 3000) packageType = "large"
      
      await purchaseCredits(packageType)
      // Credits will be updated via webhook after successful payment
      toast({
        title: "Redirecting to Checkout",
        description: `You'll be redirected to complete your purchase of ${amount} credits.`,
      })
    } catch (error) {
      console.error("Credit purchase error:", error)
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your credit purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingCredits(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

       <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Use your own API keys</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        If you prefer to use your own API keys instead of a buying credits, you can configure them in the
                        API Keys tab.
                      </p>
                    </div>
                  </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Credits & Wallet</CardTitle>
                  <CardDescription>Manage your credits and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Zap className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                            <h3 className="text-2xl font-bold text-slate-900">{credits}</h3>
                            <p className="text-sm text-slate-600">Available Credits</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900">{creditsUsedThisMonth.toLocaleString()}</h3>
                            <p className="text-sm text-slate-600">Credits Used This Month</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="font-medium mb-3">Buy Additional Credits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className="border rounded-lg p-4 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => handleBuyCredits(500, 9)}
                        >
                          <div className="text-center">
                            <h4 className="font-medium">500 Credits</h4>
                            <p className="text-2xl font-bold my-2">$9</p>
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              {processingCredits === 500 ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Buy Now"
                              )}
                            </Button>
                          </div>
                        </div>

                        <div
                          className="border rounded-lg p-4 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => handleBuyCredits(1500, 19)}
                        >
                          <div className="text-center">
                            <h4 className="font-medium">1500 Credits</h4>
                            <p className="text-2xl font-bold my-2">$19</p>
                            <p className="text-xs text-emerald-600 mb-2">Best Value</p>
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              {processingCredits === 1500 ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Buy Now"
                              )}
                            </Button>
                          </div>
                        </div>

                        <div
                          className="border rounded-lg p-4 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => handleBuyCredits(3000, 29)}
                        >
                          <div className="text-center">
                            <h4 className="font-medium">3000 Credits</h4>
                            <p className="text-2xl font-bold my-2">$29</p>
                            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              {processingCredits === 3000 ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Buy Now"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Configure your own API keys for AI services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Using your own API keys</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        When you provide your own API keys, you'll be billed directly by the respective AI service
                        providers. This option is ideal if you already have existing accounts with these services.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai">OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="openai"
                          name="openai"
                          type="password"
                          placeholder="sk-..."
                          value={apiKeys.openai}
                          onChange={handleApiKeyChange}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Get your OpenAI API key from the{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          OpenAI dashboard
                        </a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gemini">Google Gemini API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gemini"
                          name="gemini"
                          type="password"
                          placeholder="AIza..."
                          value={apiKeys.gemini}
                          onChange={handleApiKeyChange}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Get your Gemini API key from the{" "}
                        <a
                          href="https://ai.google.dev/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveApiKeys}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save API Keys"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="font-normal">
                            Email Notifications
                          </Label>
                          <p className="text-xs text-slate-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notifications.email}
                          onCheckedChange={(checked) => handleToggleNotification("email", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-report" className="font-normal">
                            Weekly SEO Report
                          </Label>
                          <p className="text-xs text-slate-500">Receive a weekly summary of your SEO performance</p>
                        </div>
                        <Switch
                          id="weekly-report"
                          checked={notifications.weeklyReport}
                          onCheckedChange={(checked) => handleToggleNotification("weeklyReport", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="new-features" className="font-normal">
                            New Features
                          </Label>
                          <p className="text-xs text-slate-500">Get notified about new features and updates</p>
                        </div>
                        <Switch
                          id="new-features"
                          checked={notifications.newFeatures}
                          onCheckedChange={(checked) => handleToggleNotification("newFeatures", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Push Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications" className="font-normal">
                            Push Notifications
                          </Label>
                          <p className="text-xs text-slate-500">Receive notifications in your browser</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notifications.push}
                          onCheckedChange={(checked) => handleToggleNotification("push", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Change Password</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Update Password</Button>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium mb-4">Sessions</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-slate-500">Chrome on Windows • New York, USA</p>
                            <p className="text-xs text-slate-500 mt-1">Started 2 hours ago</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        Log Out of All Devices
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-medium mb-4 text-red-600">Danger Zone</h3>
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-medium text-red-800">Delete Account</p>
                        <p className="text-sm text-red-700 mt-1">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <div className="mt-3">
                          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
