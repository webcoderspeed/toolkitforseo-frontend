import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="container mx-auto py-6 px-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900">ToolkitForSEO</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              100% Free
            </Badge>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">{children}</main>
      <Toaster />
    </div>
  )
}
