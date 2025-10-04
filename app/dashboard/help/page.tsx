"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  HelpCircle,
  FileText,
  MessageSquare,
  Video,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Send,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface FAQ {
  question: string
  answer: string
  category: string
  expanded: boolean
}

export default function HelpPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("faqs")
  const [searchQuery, setSearchQuery] = useState("")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "How do I interpret the SEO score?",
      answer:
        "The SEO score is a comprehensive metric that evaluates your website's search engine optimization. A score above 70 is considered good, 50-70 needs improvement, and below 50 requires significant attention. The score is calculated based on various factors including content quality, technical SEO, backlinks, and user experience metrics.",
      category: "seo",
      expanded: false,
    },
    {
      question: "How often should I run an SEO analysis?",
      answer:
        "For most websites, running a full SEO analysis once a month is sufficient. However, if you're actively making changes to improve your SEO or if you've recently published important content, you might want to run analyses more frequently to track the impact of your changes.",
      category: "seo",
      expanded: false,
    },
    {
      question: "What's the difference between follow and nofollow backlinks?",
      answer:
        "Follow backlinks pass link equity (ranking power) from one page to another, helping the target page rank higher in search results. Nofollow backlinks include a rel='nofollow' attribute that tells search engines not to pass link equity. While nofollow links don't directly improve rankings, they can still drive traffic and may indirectly benefit SEO.",
      category: "backlinks",
      expanded: false,
    },
    {
      question: "How can I improve my website's domain authority?",
      answer:
        "Improving domain authority takes time and consistent effort. Focus on creating high-quality content, earning backlinks from reputable websites in your industry, ensuring your site has a solid technical foundation, providing a good user experience, and maintaining an active social media presence. Remember that domain authority is a comparative metric, so it's relative to other websites in your space.",
      category: "seo",
      expanded: false,
    },
    {
      question: "What keywords should I target for my business?",
      answer:
        "The best keywords to target are those that balance search volume, competition, and relevance to your business. Start by identifying keywords that your potential customers might use when looking for your products or services. Focus on long-tail keywords (more specific phrases) for newer websites, as they typically have less competition. Use our Keyword Research tool to discover opportunities based on search volume and difficulty.",
      category: "keywords",
      expanded: false,
    },
    {
      question: "How do I export my analysis results?",
      answer:
        "You can export your analysis results by clicking the 'Export' or 'Download Report' button available on most tool pages. Reports are exported in CSV format, which can be opened in Excel or Google Sheets. Premium users can also export in PDF format for client presentations.",
      category: "general",
      expanded: false,
    },
    {
      question: "What's the difference between the free and paid plans?",
      answer:
        "The free plan includes basic SEO tools with limited usage, while paid plans offer more comprehensive features, higher usage limits, and advanced analytics. Pro plans include all SEO tools, AI recommendations, and support for multiple projects. Enterprise plans add team collaboration features, white-label reports, and priority support.",
      category: "billing",
      expanded: false,
    },
    {
      question: "How do credits work?",
      answer:
        "Credits are used to run various tools and analyses. Different tools require different amounts of credits. Free users get 100 credits per month, Pro users get 2,500, and Enterprise users have unlimited credits. You can also purchase additional credits if needed without upgrading your plan.",
      category: "billing",
      expanded: false,
    },
  ])

  const toggleFAQ = (index: number) => {
    setFaqs(
      faqs.map((faq, i) => {
        if (i === index) {
          return { ...faq, expanded: !faq.expanded }
        }
        return faq
      }),
    )
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      toast({
        title: "Message sent",
        description: "We've received your message and will respond shortly.",
      })
    }, 1500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-600">Find answers to common questions or contact our support team</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Video Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Contact Us</span>
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50"
                        onClick={() => toggleFAQ(index)}
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{faq.question}</h3>
                          <Badge
                            variant="outline"
                            className={
                              faq.category === "seo"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : faq.category === "backlinks"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : faq.category === "keywords"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : faq.category === "billing"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-50 text-slate-700 border-slate-200"
                            }
                          >
                            {faq.category}
                          </Badge>
                        </div>
                        {faq.expanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      {faq.expanded && (
                        <div className="p-4 bg-slate-50 border-t">
                          <p className="text-slate-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No results found</h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto">
                      We couldn't find any FAQs matching your search. Try different keywords or browse our
                      documentation.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-slate-500 text-sm">
                Can't find what you're looking for?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("contact")}>
                  Contact our support team
                </Button>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Comprehensive guides and reference materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Getting Started Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Learn the basics of our platform and how to set up your first project.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Platform Overview</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Creating Your First Project</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Understanding Your Dashboard</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">SEO Tools Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Detailed documentation for each of our SEO tools and features.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Keyword Research Tool</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>SEO Analysis Tool</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Backlink Analysis Tool</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Advanced SEO Techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Learn advanced strategies to improve your website's search engine rankings.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Technical SEO Optimization</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Content Optimization Strategies</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Link Building Techniques</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">API Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      Technical documentation for developers integrating with our API.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>API Overview</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Authentication</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-between text-sm hover:text-emerald-600 hover:underline"
                      >
                        <span>Endpoints Reference</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tutorials Tab */}
        <TabsContent value="tutorials">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Learn how to use our platform with step-by-step video guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/seo-tutorial-thumbnail.png"
                      alt="Getting Started Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Getting Started with ToolkitForSEO</h3>
                  <p className="text-sm text-slate-600">
                    A complete walkthrough of our platform and its core features.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>10:25</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/placeholder.svg?key=xxcm5"
                      alt="Keyword Research Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Mastering Keyword Research</h3>
                  <p className="text-sm text-slate-600">
                    Learn how to find the best keywords for your content strategy.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>15:42</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/placeholder.svg?key=gnpo0"
                      alt="Backlink Analysis Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Backlink Analysis Deep Dive</h3>
                  <p className="text-sm text-slate-600">Discover how to analyze and improve your backlink profile.</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>12:18</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/placeholder.svg?key=1399h"
                      alt="SEO Analysis Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Website SEO Analysis</h3>
                  <p className="text-sm text-slate-600">
                    How to run a comprehensive SEO audit and interpret the results.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>18:05</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/placeholder.svg?key=pon08"
                      alt="Content Optimization Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Content Optimization Strategies</h3>
                  <p className="text-sm text-slate-600">Tips and techniques for creating SEO-friendly content.</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>14:37</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                    <img
                      src="/placeholder.svg?key=n08k1"
                      alt="AI Recommendations Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium">Using AI SEO Recommendations</h3>
                  <p className="text-sm text-slate-600">
                    How to leverage our AI-powered recommendations for better results.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>11:52</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Us Tab */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Send us a message and we'll get back to you as soon as possible</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={contactForm.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is your message about?"
                        value={contactForm.subject}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="How can we help you?"
                        rows={6}
                        value={contactForm.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Other ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-medium">Email Support</h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <a href="mailto:support@toolkitforseo.com" className="text-emerald-600 hover:underline">
                        support@toolkitforseo.com
                      </a>
                    </div>
                    <p className="text-sm text-slate-600">
                      For general inquiries and support requests. We typically respond within 24 hours.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Phone Support</h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <a href="tel:+18005551234" className="text-emerald-600 hover:underline">
                        +1 (800) 555-1234
                      </a>
                    </div>
                    <p className="text-sm text-slate-600">
                      Available Monday-Friday, 9am-5pm EST. Premium support available for Pro and Enterprise customers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Live Chat</h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <MessageSquare className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span>Available in your dashboard</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Get real-time assistance from our support team through the chat widget in your dashboard.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="font-medium mb-3">Support Hours</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>9:00 AM - 8:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>10:00 AM - 6:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
