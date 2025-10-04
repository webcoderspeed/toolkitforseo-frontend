import { ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function CookiesPage() {
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
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Legal</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
            <p className="text-slate-600">Last updated: June 1, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit a website.
              They help websites remember information about your visit, which can make it easier to visit the site again
              and make the site more useful to you.
            </p>

            <h2>How We Use Cookies</h2>
            <p>We use cookies for several purposes:</p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable basic functions like page
              navigation and access to secure areas of the website. The website cannot function properly without these
              cookies.
            </p>
            <ul>
              <li>Session management</li>
              <li>Security features</li>
              <li>Load balancing</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting
              information anonymously. This helps us improve our website and services.
            </p>
            <ul>
              <li>Page views and user sessions</li>
              <li>Popular tools and features</li>
              <li>User journey analysis</li>
              <li>Performance monitoring</li>
            </ul>

            <h3>Functional Cookies</h3>
            <p>
              These cookies enable the website to provide enhanced functionality and personalization. They may be set by
              us or by third-party providers whose services we have added to our pages.
            </p>
            <ul>
              <li>User preferences and settings</li>
              <li>Tool configurations</li>
              <li>Language preferences</li>
              <li>Theme selections</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>
              We may use third-party services that set their own cookies. These services help us provide better
              functionality and analyze our website performance:
            </p>
            <ul>
              <li>
                <strong>Google Analytics:</strong> For website analytics and performance monitoring
              </li>
              <li>
                <strong>Social Media Platforms:</strong> For social sharing functionality
              </li>
              <li>
                <strong>CDN Services:</strong> For faster content delivery
              </li>
            </ul>

            <h2>Managing Cookies</h2>
            <p>
              You can control and manage cookies in various ways. Please note that removing or blocking cookies can
              impact your user experience and parts of our website may no longer be fully accessible.
            </p>

            <h3>Browser Settings</h3>
            <p>Most web browsers allow you to:</p>
            <ul>
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Get notified when a cookie is set</li>
            </ul>

            <h3>Browser-Specific Instructions</h3>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Chrome</h4>
                <p className="text-sm text-slate-600">Settings → Privacy and Security → Cookies and other site data</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Firefox</h4>
                <p className="text-sm text-slate-600">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Safari</h4>
                <p className="text-sm text-slate-600">Preferences → Privacy → Manage Website Data</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Edge</h4>
                <p className="text-sm text-slate-600">
                  Settings → Cookies and site permissions → Cookies and site data
                </p>
              </div>
            </div>

            <h2>Cookie Retention</h2>
            <p>Different types of cookies are stored for different periods:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Typically stored for 2 years
              </li>
              <li>
                <strong>Functional Cookies:</strong> Stored for up to 1 year
              </li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
              updated policy on our website.
            </p>

            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 my-8">
              <h3 className="text-emerald-800 font-bold mb-2">Your Consent</h3>
              <p className="text-emerald-700 mb-0">
                By continuing to use our website, you consent to our use of cookies as described in this policy. You can
                withdraw your consent at any time by adjusting your browser settings or
                <Link href="/contact" className="text-emerald-600 font-semibold hover:underline ml-1">
                  contacting us
                </Link>
                .
              </p>
            </div>

            <h2>Contact Us</h2>
            <p>If you have any questions about our use of cookies, please contact us:</p>
            <ul>
              <li>Email: privacy@toolkitforseo.com</li>
              <li>Phone: +1 (800) 123-4567</li>
              <li>Address: 123 SEO Street, San Francisco, CA 94107, United States</li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/privacy-policy">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Read Privacy Policy
                <ArrowRight className="ml-2 h-4 w-4" />
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
