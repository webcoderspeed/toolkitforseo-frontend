"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, CheckCircle, Mail, MapPin, Phone, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">ToolkitForSEO</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              100% Free Tools
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Contact Us</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions about our tools? Need help with your SEO strategy? Or just want to say hello? We'd love to
              hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Email</h3>
              <p className="text-slate-600 text-center">
                <a href="mailto:support@toolkitforseo.com" className="text-emerald-600 hover:underline">
                  support@toolkitforseo.com
                </a>
              </p>
              <p className="text-slate-600 text-center">
                <a href="mailto:info@toolkitforseo.com" className="text-emerald-600 hover:underline">
                  info@toolkitforseo.com
                </a>
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Phone</h3>
              <p className="text-slate-600 text-center">
                <a href="tel:+1-800-123-4567" className="text-emerald-600 hover:underline">
                  +1 (800) 123-4567
                </a>
              </p>
              <p className="text-slate-600 text-center">Monday-Friday, 9am-5pm PST</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Address</h3>
              <p className="text-slate-600 text-center">
                123 SEO Street
                <br />
                San Francisco, CA 94107
                <br />
                United States
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-slate-700">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    rows={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-slate-600 mb-6">
                  Your message has been sent successfully. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: "", email: "", subject: "", message: "" })
                  }}
                  variant="outline"
                >
                  Send Another Message
                </Button>
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need immediate help?</h2>
            <p className="text-slate-600 mb-6">
              Check out our comprehensive knowledge base or explore our tools to find what you need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tools">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Explore Our Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline">
                Visit Knowledge Base
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span className="text-lg font-bold">ToolkitForSEO</span>
              </div>
              <p className="text-slate-400 text-sm">
                The complete toolkit for SEO professionals and website owners to improve search rankings and drive
                organic traffic.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="/tools/text-and-content/plagiarism-checker"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Plagiarism Checker
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/keyword-research/keyword-research-tool"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Keyword Research
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/backlink-analysis/backlink-checker"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Backlink Checker
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/seo-utilities/website-seo-score-checker"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    SEO Score Checker
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/about" className="hover:text-emerald-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-emerald-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} ToolkitForSEO. All rights reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-emerald-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}
