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

export default function SettingsPage() {
  const { toast } = useToast()
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
  const [processingCredits, setProcessingCredits] = useState<number | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        const user = data.user
        
        setCredits(user.credits)
        setSubscription(user.subscription)
        setSubscriptionPlan(user.subscription ? 'pro' : 'free')
        setNotifications({
          email: user.preferences.emailNotifications,
          push: false,
          marketing: false,
          weeklyReport: true,
          newFeatures: true
        })
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApiKeys((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveApiKeys = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)

      toast({
        title: "API keys saved",
        description: "Your API keys have been updated successfully.",
      })
    }, 1500)
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

  const handleSubscribe = (plan: string) => {
    setProcessingPlan(plan)

    // Simulate API call
    setTimeout(() => {
      setSubscriptionPlan(plan)
      setProcessingPlan(null)

      toast({
        title: "Subscription updated",
        description: `You are now subscribed to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
      })
    }, 1500)
  }

  const handleBuyCredits = (amount: number, price: number) => {
    setProcessingCredits(amount)

    // Simulate API call
    setTimeout(() => {
      setCredits(credits + amount)
      setProcessingCredits(null)

      toast({
        title: "Credits purchased",
        description: `You have successfully purchased ${amount} credits for $${price}.`,
      })
    }, 1500)
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
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Current Plan</h3>
                        <p className="text-sm text-slate-500">
                          {subscriptionPlan === "free"
                            ? "Free Plan"
                            : subscriptionPlan === "pro"
                              ? "Pro Plan ($19/month)"
                              : "Enterprise Plan ($49/month)"}
                        </p>
                      </div>
                      <Badge
                        className={
                          subscriptionPlan === "free"
                            ? "bg-slate-100 text-slate-800"
                            : subscriptionPlan === "pro"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                        }
                      >
                        {subscriptionPlan === "free" ? "Free" : subscriptionPlan === "pro" ? "Pro" : "Enterprise"}
                      </Badge>
                    </div>

                    {subscriptionPlan !== "free" && (
                      <div className="mt-4 text-sm">
                        <p className="text-slate-600">Next billing date: June 15, 2023</p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel Subscription
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Plan */}
                    <Card className={`border ${subscriptionPlan === "free" ? "border-slate-400" : "border-slate-200"}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Free</CardTitle>
                        <CardDescription>Basic features for personal use</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          $0<span className="text-sm font-normal text-slate-500">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>100 Credits</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Basic SEO tools</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>1 project</span>
                          </li>
                          <li className="flex items-center">
                            <X className="h-4 w-4 text-slate-400 mr-2" />
                            <span className="text-slate-500">AI recommendations</span>
                          </li>
                          <li className="flex items-center">
                            <X className="h-4 w-4 text-slate-400 mr-2" />
                            <span className="text-slate-500">Advanced analytics</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        {subscriptionPlan === "free" ? (
                          <Button disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSubscribe("free")}
                            disabled={processingPlan !== null}
                          >
                            {processingPlan === "free" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Downgrade"
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card
                      className={`border ${subscriptionPlan === "pro" ? "border-emerald-400" : "border-slate-200"}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Pro</CardTitle>
                            <CardDescription>Advanced features for professionals</CardDescription>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800">Popular</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          $19<span className="text-sm font-normal text-slate-500">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>2500 Credits</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>All SEO tools</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>10 projects</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>AI recommendations</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Advanced analytics</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        {subscriptionPlan === "pro" ? (
                          <Button disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleSubscribe("pro")}
                            disabled={processingPlan !== null}
                          >
                            {processingPlan === "pro" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : subscriptionPlan === "enterprise" ? (
                              "Downgrade"
                            ) : (
                              "Upgrade"
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>

                    {/* Enterprise Plan */}
                    <Card
                      className={`border ${subscriptionPlan === "enterprise" ? "border-purple-400" : "border-slate-200"}`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Enterprise</CardTitle>
                        <CardDescription>Premium features for teams</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">
                          $49<span className="text-sm font-normal text-slate-500">/month</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Unlimited Credits</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>All SEO tools</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Unlimited projects</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Priority AI recommendations</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-emerald-600 mr-2" />
                            <span>Team collaboration</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        {subscriptionPlan === "enterprise" ? (
                          <Button disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSubscribe("enterprise")}
                            disabled={processingPlan !== null}
                          >
                            {processingPlan === "enterprise" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Upgrade"
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Use your own API keys</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        If you prefer to use your own API keys instead of a subscription, you can configure them in the
                        API Keys tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <h3 className="text-2xl font-bold text-slate-900">1,250</h3>
                            <p className="text-sm text-slate-600">Credits Used This Month</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900">$19.00</h3>
                            <p className="text-sm text-slate-600">Current Balance</p>
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

                    <div>
                      <h3 className="font-medium mb-3">Payment Methods</h3>
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded">
                              <CreditCard className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-xs text-slate-500">Expires 12/25</p>
                            </div>
                          </div>
                          <Badge>Default</Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" size="sm">
                          Add Payment Method
                        </Button>
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
