"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  LineChart,
  Users,
  Clock,
  ShieldCheck,
  Target,
  Rocket,
  Globe,
  Layers,
  Link,
  Search,
  FileText,
  Gauge,
  Lock,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { subscribeUser } from "@/app/actions"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const handleStartTrial = () => {
    router.push("/auth/signup")
  }

  const handleExploreTools = () => {
    router.push("/tools")
  }

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
    try {
      setIsSubmitting(true)
      await subscribeUser(email)
      setEmail("")
      toast({
        title: "You're on the list!",
        description: "We’ll send you product updates and growth tips.",
      })
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again in a few minutes.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => router.push("/")}
          aria-label="ToolkitForSEO Home"
        >
          <Zap className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold text-slate-900">ToolkitForSEO</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#why" className="text-slate-600 hover:text-slate-900">
            Why us
          </a>
          <a href="#product" className="text-slate-600 hover:text-slate-900">
            Product
          </a>
          <a href="#pricing" className="text-slate-600 hover:text-slate-900">
            Pricing
          </a>
          <a href="#investors" className="text-slate-600 hover:text-slate-900">
            For Investors
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleExploreTools} className="text-slate-700">
            Explore Tools
          </Button>
          <Button onClick={handleStartTrial} className="bg-emerald-600 text-white hover:bg-emerald-700">
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800">MVP launched</Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-800">
                    15‑day full access
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                  AI‑powered SEO toolkit to research, optimize, and rank faster
                </h1>
                <p className="text-lg text-slate-700">
                  Try all premium tools free for 15 days. Then continue on Pro at just{" "}
                  <span className="font-semibold text-emerald-700">₹799/month</span>. One simple plan. No hidden fees.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={handleStartTrial}
                    size="lg"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button onClick={handleExploreTools} size="lg" variant="outline">
                    See All Tools
                  </Button>
                </div>

                <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 25+ production‑ready SEO tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No credit card required to start
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Cancel anytime in one click
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Built for content teams & founders
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-r from-emerald-200/40 to-teal-200/40 blur-2xl" />
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                  {/* Product Preview */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PreviewCard
                      icon={<Search className="h-5 w-5 text-emerald-600" />}
                      title="Keyword Research"
                      desc="Find long‑tail, difficulty, and intent in seconds."
                      img="/placeholder.svg?height=200&width=300"
                    />
                    <PreviewCard
                      icon={<FileText className="h-5 w-5 text-emerald-600" />}
                      title="Content Optimization"
                      desc="AI suggestions for on‑page SEO and readability."
                      img="/placeholder.svg?height=200&width=300"
                    />
                    <PreviewCard
                      icon={<Link className="h-5 w-5 text-emerald-600" />}
                      title="Backlink Analysis"
                      desc="Identify valuable links and anchor gaps."
                      img="/placeholder.svg?height=200&width=300"
                    />
                    <PreviewCard
                      icon={<Gauge className="h-5 w-5 text-emerald-600" />}
                      title="Technical Audits"
                      desc="Fix speed, index, SSL and meta issues."
                      img="/placeholder.svg?height=200&width=300"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Traction strip */}
            <div className="mt-12 grid gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
              <Metric icon={<Users className="h-5 w-5" />} label="Early users" value="1,000+" />
              <Metric icon={<Clock className="h-5 w-5" />} label="Avg. time saved per audit" value="8–12 hrs" />
              <Metric icon={<LineChart className="h-5 w-5" />} label="Content throughput" value="3x faster" />
            </div>
          </div>
        </section>

        {/* Why us */}
        <section id="why" className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              Why teams switch to ToolkitForSEO
            </Badge>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Replace 5+ SEO tools with one AI‑first workflow
            </h2>
            <p className="mt-3 text-slate-600">
              Consolidate research, on‑page, backlinks and technical checks into one place. Lower cost, higher speed,
              and better execution.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Reason
              icon={<Sparkles className="h-6 w-6 text-emerald-600" />}
              title="AI‑assisted decisions"
              desc="From keyword selection to content briefs and link prospects—AI accelerates every step."
            />
            <Reason
              icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
              title="Reliable technical checks"
              desc="Speed, indexation, SSL and meta audits that catch issues before they cost rankings."
            />
            <Reason
              icon={<Target className="h-6 w-6 text-emerald-600" />}
              title="Outcomes, not noise"
              desc="Actionable playbooks and prioritized tasks you can execute the same day."
            />
          </div>
        </section>

        {/* Product deep dive */}
        <section id="product" className="bg-slate-50">
          <div className="container mx-auto px-4 py-16">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <DeepDive
                icon={<Search className="h-6 w-6 text-emerald-700" />}
                title="Keyword engine with intent and difficulty"
                bullets={[
                  "Long‑tail ideas, SERP intent, CPC, difficulty",
                  "Cluster by topic and prioritize by impact",
                  "Export to CSV, brief with one click",
                ]}
              />
              <DeepDive
                icon={<FileText className="h-6 w-6 text-emerald-700" />}
                title="On‑page optimizer that actually ranks"
                bullets={[
                  "Entity coverage, headings, internal links",
                  "AI rewrite suggestions that keep your tone",
                  "Live score as you edit",
                ]}
              />
              <DeepDive
                icon={<Link className="h-6 w-6 text-emerald-700" />}
                title="Backlink insights to build authority"
                bullets={[
                  "Anchor distribution, link velocity, referring domains",
                  "Quick wins from competitor gaps",
                  "Track link quality over time",
                ]}
              />
              <DeepDive
                icon={<Gauge className="h-6 w-6 text-emerald-700" />}
                title="Technical audits without the headache"
                bullets={[
                  "Core Web Vitals, index coverage, sitemaps, robots",
                  "Auto‑fix suggestions and impact estimates",
                  "Shareable reports for stakeholders",
                ]}
              />
            </div>
          </div>
        </section>

        {/* Pricing – single plan highlight */}
        <section id="pricing" className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="bg-emerald-100 text-emerald-800">Simple pricing</Badge>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">Try everything free for 15 days</h2>
            <p className="mt-3 text-slate-600">
              Continue on the Pro plan at just <span className="font-semibold text-slate-900">₹799/month</span>. One
              plan, all features.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <div className="grid items-stretch gap-6 md:grid-cols-[1.2fr,1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900">Pro — ₹799/month</h3>
                </div>
                <p className="mt-2 text-slate-600">
                  Full access to all current and upcoming tools. Perfect for founders, marketers and agencies.
                </p>
                <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> All 25+ tools unlocked
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unlimited projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Priority compute
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Export & reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Email support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Early access to new tools
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handleStartTrial} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    Start 15‑day free trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button onClick={handleExploreTools} variant="outline">
                    Explore the toolkit
                  </Button>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  No card required to start. Cancel anytime. Prices include taxes where applicable.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  What happens after trial?
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• You choose to subscribe to Pro (₹799/mo) to keep full access</li>
                  <li>• Or continue with limited free access to basic tools</li>
                  <li>• Your projects and results remain saved</li>
                </ul>

                <h4 className="mt-6 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  Coming soon
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Advanced plan for teams and API access</li>
                  <li>• Collaboration & roles</li>
                  <li>• Deeper integrations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                Loved by builders
              </Badge>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">From idea to rankings—faster</h2>
              <p className="mt-3 text-slate-600">
                Marketers, founders and agencies use ToolkitForSEO to ship consistent SEO outcomes without juggling 5
                different tools.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
              <Testimonial
                quote="We shipped a 50‑page content sprint in 3 weeks. Research and briefs were the bottleneck—until now."
                name="Aditi"
                role="Head of Content, D2C"
              />
              <Testimonial
                quote="Technical audits that translate to tasks. Our devs finally have clear, prioritized fixes."
                name="Rohit"
                role="CTO, SaaS"
              />
              <Testimonial
                quote="One login for research, on‑page and links. Our team’s throughput has doubled."
                name="Meera"
                role="Agency Partner"
              />
            </div>
          </div>
        </section>

        {/* Investors section */}
        <section id="investors" className="bg-emerald-50">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="bg-emerald-100 text-emerald-800">For Investors</Badge>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Building the operating system for SEO execution
              </h2>
              <p className="mt-3 text-slate-700">
                Fragmented workflows and generic tools slow down growth. We unify research, content, links and technical
                into an AI‑first execution layer for teams.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
              <InvestorCard
                icon={<BarChart3 className="h-5 w-5 text-emerald-700" />}
                title="Clear monetization"
                points={[
                  "Pro at ₹799/mo after 15‑day trial",
                  "Low support burden, high LTV",
                  "Expansion via team seats & API",
                ]}
              />
              <InvestorCard
                icon={<Rocket className="h-5 w-5 text-emerald-700" />}
                title="Execution advantage"
                points={[
                  "AI accelerates decisions, not replaces experts",
                  "Tasks auto‑ranked by ROI impact",
                  "Fast reports stakeholders understand",
                ]}
              />
              <InvestorCard
                icon={<Globe className="h-5 w-5 text-emerald-700" />}
                title="Market pull"
                points={[
                  "Agencies, SaaS, D2C—same problems",
                  "Consolidation lowers tool spend",
                  "Community‑led growth motion",
                ]}
              />
            </div>

            <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-emerald-200 bg-white p-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Interested in the seed round?</h3>
                  <p className="mt-1 text-sm text-slate-600">Request our latest product traction and roadmap.</p>
                </div>
                <div className="flex w-full gap-2 md:w-auto">
                  <form onSubmit={handleSubscribe} className="flex w-full items-center gap-2">
                    <Input
                      type="email"
                      placeholder="you@fund.vc"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full md:w-72"
                      disabled={isSubmitting}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Request deck"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-12 text-white">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h3 className="text-2xl font-bold md:text-3xl">Start your 15‑day free trial</h3>
              <p className="mt-2 text-white/90">
                Ship SEO outcomes faster—research, content, links and technical in one place.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleStartTrial} className="bg-white text-emerald-700 hover:bg-white/90">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleExploreTools}
                  variant="outline"
                  className="border-white text-white bg-transparent"
                >
                  Explore Tools
                </Button>
              </div>
              <p className="mt-3 text-xs text-white/80">No card required. Cancel anytime.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span className="text-lg font-bold">ToolkitForSEO</span>
              </div>
              <p className="text-sm text-slate-400">
                AI‑powered toolkit to research, optimize and rank faster—now with a 15‑day free trial.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Tools</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="/tools/keyword-research/keyword-research-tool" className="hover:text-emerald-400">
                    Keyword Research
                  </a>
                </li>
                <li>
                  <a href="/tools/text-and-content/plagiarism-checker" className="hover:text-emerald-400">
                    Plagiarism Checker
                  </a>
                </li>
                <li>
                  <a href="/tools/backlink-analysis/backlink-checker" className="hover:text-emerald-400">
                    Backlink Checker
                  </a>
                </li>
                <li>
                  <a href="/tools/seo-utilities/website-seo-score-checker" className="hover:text-emerald-400">
                    SEO Score Checker
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="/about" className="hover:text-emerald-400">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-emerald-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="hover:text-emerald-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" className="hover:text-emerald-400">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="/privacy" className="hover:text-emerald-400">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-emerald-400">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="hover:text-emerald-400">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-8 text-sm text-slate-400">
            © {new Date().getFullYear()} ToolkitForSEO. All rights reserved.
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

function PreviewCard({
  icon,
  title,
  desc,
  img,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  img: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">{icon}</div>
        <div className="font-medium text-slate-900">{title}</div>
      </div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <div className="mt-3 overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img || "/placeholder.svg"}
          alt={`${title} preview`}
          className="h-40 w-full rounded-md object-cover"
          loading="lazy"
        />
      </div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">{icon}</div>
      <div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
        <div className="text-sm text-slate-600">{label}</div>
      </div>
    </div>
  )
}

function Reason({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-slate-600">{desc}</p>
    </div>
  )
}

function DeepDive({
  icon,
  title,
  bullets,
}: {
  icon: React.ReactNode
  title: string
  bullets: string[]
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-2 text-slate-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span className="text-sm">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-slate-700">
        {"“"}
        {quote}
        {"”"}
      </p>
      <div className="mt-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{name}</span> • {role}
      </div>
    </div>
  )
}

function InvestorCard({
  icon,
  title,
  points,
}: {
  icon: React.ReactNode
  title: string
  points: string[]
}) {
  return (
    <div className="rounded-xl border border-emerald-200/60 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {points.map((p, i) => (
          <li key={i}>• {p}</li>
        ))}
      </ul>
    </div>
  )
}
