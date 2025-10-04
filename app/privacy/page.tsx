import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">
              ToolkitForSEO
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              100% Free Tools
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
              Legal
            </Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Privacy Statement
            </h1>
            <p className="text-slate-600">Last updated: June 1, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <p>
              This Privacy Statement is a simplified version of our full{" "}
              <Link
                href="/privacy-policy"
                className="text-emerald-600 hover:underline"
              >
                Privacy Policy
              </Link>
              . It provides a high-level overview of how we collect, use, and
              protect your data.
            </p>

            <h2>What Information We Collect</h2>
            <ul>
              <li>Information you provide to us (name, email, etc.)</li>
              <li>Usage information when you interact with our tools</li>
              <li>Device and browser information</li>
              <li>Website data you analyze using our tools</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>To provide and improve our services</li>
              <li>To communicate with you about our services</li>
              <li>To ensure the security of our platform</li>
              <li>To analyze usage patterns and optimize user experience</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your
              personal data from unauthorized access, alteration, disclosure, or
              destruction.
            </p>

            <h2>Cookies</h2>
            <p>
              We use cookies to enhance your experience, analyze usage, and
              assist in our marketing efforts. You can control cookies through
              your browser settings.
            </p>

            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 my-8">
              <h3 className="text-emerald-800 font-bold mb-2">
                Our Commitment
              </h3>
              <p className="text-emerald-700 mb-0">
                We are committed to protecting your privacy and being
                transparent about our data practices. If you have any questions
                or concerns, please{" "}
                <Link
                  href="/contact"
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  contact us
                </Link>
                .
              </p>
            </div>

            <p>
              For more detailed information about our privacy practices, please
              read our full{" "}
              <Link
                href="/privacy-policy"
                className="text-emerald-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="text-center">
            <Link href="/privacy-policy">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Read Full Privacy Policy
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
                The complete toolkit for SEO professionals and website owners to
                improve search rankings and drive organic traffic.
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
                  <Link
                    href="/about"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-emerald-400 transition-colors"
                  >
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
          </div>
        </div>
      </footer>
    </div>
  );
}
