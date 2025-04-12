"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Search,
  BarChart,
  Zap,
  FileText,
  RefreshCw,
  Check,
  FileEdit,
  AlignJustify,
  FileSearch,
  Bot,
  BookOpen,
  AlertCircle,
  Edit3,
  Key,
  Crosshair,
  ArrowUpRight,
  Gauge,
  Link,
  LinkIcon,
  Anchor,
  Globe,
  GaugeIcon as Speedometer,
  Database,
  Code,
  ShieldCheck,
} from "lucide-react"
import { subscribeUser } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await subscribeUser(email)
      setIsSubscribed(true)
      setEmail("")
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing. Check your email for confirmation.",
      })
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const textTools = [
    { name: "Plagiarism Checker", icon: <FileSearch className="h-5 w-5" /> },
    { name: "Article Rewriter", icon: <FileEdit className="h-5 w-5" /> },
    { name: "Free Grammar Checker", icon: <Check className="h-5 w-5" /> },
    { name: "Paraphrasing Tool", icon: <RefreshCw className="h-5 w-5" /> },
    { name: "Sentence Rephraser", icon: <AlignJustify className="h-5 w-5" /> },
    { name: "Text Summarizer", icon: <FileText className="h-5 w-5" /> },
    { name: "AI Content Detector", icon: <Bot className="h-5 w-5" /> },
    { name: "Essay Rewriter", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Sentence Checker", icon: <AlertCircle className="h-5 w-5" /> },
    { name: "Online Proofreader", icon: <Edit3 className="h-5 w-5" /> },
  ]

  const keywordTools = [
    { name: "Keyword Research Tool", icon: <Search className="h-5 w-5" /> },
    { name: "Keyword Competition Tool", icon: <Crosshair className="h-5 w-5" /> },
    { name: "Long Tail Keyword Suggestion Tool", icon: <ArrowUpRight className="h-5 w-5" /> },
    { name: "SEO Keyword Competition Analysis", icon: <BarChart className="h-5 w-5" /> },
    { name: "Live Keyword Analyzer", icon: <Gauge className="h-5 w-5" /> },
  ]

  const backlinkTools = [
    { name: "Backlink Checker", icon: <Link className="h-5 w-5" /> },
    { name: "Backlink Maker", icon: <LinkIcon className="h-5 w-5" /> },
    { name: "Website Link Count Checker", icon: <Database className="h-5 w-5" /> },
    { name: "Anchor Text Distribution", icon: <Anchor className="h-5 w-5" /> },
    { name: "Valuable Backlink Checker", icon: <CheckCircle className="h-5 w-5" /> },
  ]

  const seoTools = [
    { name: "Website SEO Score Checker", icon: <Globe className="h-5 w-5" /> },
    { name: "Page Speed Test", icon: <Speedometer className="h-5 w-5" /> },
    { name: "Google Index Checker", icon: <Database className="h-5 w-5" /> },
    { name: "Meta Tag Generator", icon: <Code className="h-5 w-5" /> },
    { name: "SSL Checker", icon: <ShieldCheck className="h-5 w-5" /> },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Zap className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">ToolkitForSEO</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              100% Free Tools
            </Badge>
            <Button variant="outline" className="hidden sm:flex">
              Coming Soon
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 space-y-6"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                Coming Soon
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                25 Free SEO Tools <br />
                <span className="text-emerald-600">Powered by AI</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                A powerful toolkit for SEO professionals to boost productivity and efficiency using advanced AI
                technology. <span className="font-semibold text-emerald-700">All tools are 100% free to use!</span>
              </p>

              <div className="pt-4">
                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Subscribing..." : "Subscribe"}
                      {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-600"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Thank you for subscribing! Check your email for confirmation.</span>
                  </motion.div>
                )}
                <p className="text-sm text-slate-500 mt-2">We&apos;ll notify you when we launch. No spam, ever.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-25"></div>
                <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="p-6 sm:p-10">
                    <div className="grid grid-cols-2 gap-4">
                      <FeatureCard
                        icon={<FileText className="h-6 w-6 text-emerald-600" />}
                        title="Content Tools"
                        description="10 powerful tools for content optimization"
                      />
                      <FeatureCard
                        icon={<Key className="h-6 w-6 text-emerald-600" />}
                        title="Keyword Tools"
                        description="5 advanced keyword research tools"
                      />
                      <FeatureCard
                        icon={<Link className="h-6 w-6 text-emerald-600" />}
                        title="Backlink Tools"
                        description="5 comprehensive backlink analysis tools"
                      />
                      <FeatureCard
                        icon={<Globe className="h-6 w-6 text-emerald-600" />}
                        title="SEO Utilities"
                        description="5 essential website SEO tools"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">100% FREE</Badge>
              <h2 className="text-3xl font-bold text-slate-900">Explore All 25 Free SEO Tools</h2>
              <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
                Our comprehensive suite of SEO tools to help you optimize your content, research keywords, analyze
                backlinks, and improve your website's SEO performance.
              </p>
            </div>

            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger
                  value="text"
                  className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Text & Content
                </TabsTrigger>
                <TabsTrigger
                  value="keyword"
                  className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Keyword Research
                </TabsTrigger>
                <TabsTrigger
                  value="backlink"
                  className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Backlink Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="seo"
                  className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  SEO Utilities
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {textTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="keyword">
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {keywordTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="backlink">
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {backlinkTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="seo">
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {seoTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Why Choose ToolkitForSEO?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <BenefitCard
                number="01"
                title="100% Free Tools"
                description="All 25 SEO tools are completely free to use with no hidden costs or premium features"
              />
              <BenefitCard
                number="02"
                title="AI-Powered Insights"
                description="Leverage advanced AI to get actionable insights for your SEO strategy"
              />
              <BenefitCard
                number="03"
                title="All-in-One Platform"
                description="Access all the tools you need in one place without switching between services"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-24 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 md:p-12 text-white text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Be the First to Know When We Launch</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Subscribe now to get early access to all 25 free SEO tools as soon as we launch.
            </p>
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  disabled={isSubmitting}
                />
                <Button type="submit" className="bg-white text-emerald-700 hover:bg-white/90" disabled={isSubmitting}>
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-white"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Thank you for subscribing! Check your email for confirmation.</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Zap className="h-5 w-5 text-emerald-400" />
              <span className="text-lg font-bold">ToolkitForSEO</span>
            </div>
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} ToolkitForSEO. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="bg-slate-50 p-4 rounded-lg"
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </motion.div>
  )
}

function ToolCard({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className="bg-white border border-slate-100 rounded-lg p-5 flex items-center gap-4 transition-all"
    >
      <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">{icon}</div>
      <div>
        <h3 className="font-medium text-slate-900">{name}</h3>
        <Badge variant="outline" className="mt-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
          Free
        </Badge>
      </div>
    </motion.div>
  )
}

function BenefitCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="text-emerald-600 font-bold text-lg mb-2">{number}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </motion.div>
  )
}
