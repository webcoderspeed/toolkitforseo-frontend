import { ArrowRight, CheckCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AboutPage() {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">About Us</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Mission to Democratize SEO</h1>
            <p className="text-lg text-slate-600">
              We're making professional SEO tools accessible to everyone, regardless of budget or expertise.
            </p>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <h2>Our Story</h2>
            <p>
              ToolkitForSEO was founded in 2023 by a team of SEO professionals who were frustrated with the high cost
              and complexity of existing SEO tools. We believed that quality SEO tools should be accessible to everyone,
              not just large companies with big budgets.
            </p>
            <p>
              What started as a small project with just a few basic tools has grown into a comprehensive suite of 32
              professional-grade SEO tools that help thousands of website owners improve their search rankings every
              day.
            </p>

            <h2>Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Accessibility</h3>
                <p className="text-slate-600 text-center">
                  We believe quality SEO tools should be available to everyone, regardless of budget.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Transparency</h3>
                <p className="text-slate-600 text-center">
                  We're committed to clear, honest communication about what our tools can and cannot do.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Innovation</h3>
                <p className="text-slate-600 text-center">
                  We continuously improve our tools with the latest SEO techniques and technologies.
                </p>
              </div>
            </div>

            <h2>Our Team</h2>
            <p>
              Our team consists of SEO experts, developers, data scientists, and content strategists who are passionate
              about search engine optimization and helping businesses succeed online.
            </p>
            <p>
              We're headquartered in San Francisco with team members working remotely from around the world. This global
              perspective helps us create tools that work for websites in any market or language.
            </p>

            <h2>Our Commitment</h2>
            <p>
              We're committed to keeping our core tools free forever. While we may introduce premium features or
              services in the future, we promise that the tools you rely on today will always remain accessible at no
              cost.
            </p>
            <p>
              We also commit to respecting your privacy and security. We don't sell your data, and we're transparent
              about how we use any information you provide when using our tools.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Our Community</h2>
            <p className="text-slate-600 mb-6">
              Connect with other SEO professionals, get tips and advice, and be the first to know about new tools and
              features.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white">
                Twitter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-[#0A66C2] hover:bg-[#095196] text-white">
                LinkedIn
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button className="bg-[#1877F2] hover:bg-[#166fe5] text-white">
                Facebook
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to improve your SEO?</h2>
            <p className="text-slate-600 mb-6">
              Join thousands of website owners who are already using ToolkitForSEO to improve their search rankings.
            </p>
            <Link href="/tools">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Explore Our Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
    </div>
  )
}
