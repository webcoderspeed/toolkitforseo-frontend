"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Menu,
  Home,
  Search,
  BarChart2,
  LinkIcon,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  User,
  History,
  ChevronDown,
  ChevronRight,
  CreditCard,
  TrendingUp,
  Users,
  Wrench,
  FileText,
  Globe,
  Shield,
  Target,
  Edit,
  CheckCircle,
  Gauge,
  Eye,
  Hash,
  Type,
  Repeat,
  AlertTriangle,
  Link2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Suspense } from "react";
import { SignOutButton, useUser } from "@clerk/nextjs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCreditStats = async () => {
      try {
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setCredits(data.currentCredits);
        }
      } catch (error) {
        console.error("Error fetching credit stats:", error);
      }
    };
    fetchCreditStats();
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
    setIsLoading(false);
  }, [router, isSignedIn]);

  const handleLogout = async () => {
    try {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });

      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again.",
      });
      return;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileMenu = document.getElementById("profile-menu");
      if (
        isProfileMenuOpen &&
        profileMenu &&
        !profileMenu.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Auto-close tools menu on mobile when sidebar closes
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsToolsMenuOpen(false);
    }
  }, [isSidebarOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const tools = [
    { name: "AI Content Detector", path: "/dashboard/tools/ai-content-detector", icon: Eye },
    { name: "Anchor Text Distribution", path: "/dashboard/tools/anchor-text-distribution", icon: Link2 },
    { name: "Article Rewriter", path: "/dashboard/tools/article-rewriter", icon: Edit },
    { name: "Backlink Checker", path: "/dashboard/tools/backlink-checker", icon: LinkIcon },
    { name: "Backlink Maker", path: "/dashboard/tools/backlink-maker", icon: Link2 },
    { name: "Competitor Analysis", path: "/dashboard/tools/competitor-analysis", icon: Users },
    { name: "Essay Rewriter", path: "/dashboard/tools/essay-rewriter", icon: FileText },
    { name: "Grammar Checker", path: "/dashboard/tools/free-grammar-checker", icon: CheckCircle },
    { name: "Google Index Checker", path: "/dashboard/tools/google-index-checker", icon: Globe },
    { name: "Keyword Competition", path: "/dashboard/tools/keyword-competition-tool", icon: Target },
    { name: "Keyword Research", path: "/dashboard/tools/keyword-research-tool", icon: Search },
    { name: "Live Keyword Analyzer", path: "/dashboard/tools/live-keyword-analyzer-tool", icon: Activity },
    { name: "Long Tail Keyword Suggestion", path: "/dashboard/tools/long-tail-keyword-suggestion-tool", icon: Search },
    { name: "Meta Tag Generator", path: "/dashboard/tools/meta-tag-generator", icon: Hash },
    { name: "Online Proofreader", path: "/dashboard/tools/online-proofreader", icon: Eye },
    { name: "Page Speed Test", path: "/dashboard/tools/page-speed-test", icon: Gauge },
    { name: "Paraphrasing Tool", path: "/dashboard/tools/paraphrasing-tool", icon: Repeat },
    { name: "Plagiarism Checker", path: "/dashboard/tools/plagiarism-checker", icon: Shield },
    { name: "Rank Tracker", path: "/dashboard/tools/rank-tracker", icon: TrendingUp },
    { name: "SEO Keyword Competition", path: "/dashboard/tools/seo-keyword-competition-analysis", icon: Target },
    { name: "Sentence Checker", path: "/dashboard/tools/sentence-checker", icon: Type },
    { name: "Sentence Rephraser", path: "/dashboard/tools/sentence-rephraser", icon: Edit },
    { name: "SSL Checker", path: "/dashboard/tools/ssl-checker", icon: Shield },
    { name: "Text Summarizer", path: "/dashboard/tools/text-summarizer", icon: FileText },
    { name: "Valuable Backlink Checker", path: "/dashboard/tools/valuable-backlink-checker", icon: AlertTriangle },
    { name: "Website Link Count", path: "/dashboard/tools/website-link-count-checker", icon: Hash },
    { name: "Website SEO Score", path: "/dashboard/tools/website-seo-score-checker", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900">
                ToolkitForSEO
              </span>
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              AI-Powered SEO Platform
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                isActive("/dashboard") && pathname === "/dashboard"
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : ""
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {/* Tools Submenu */}
            <div>
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={`flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                  isActive("/dashboard/tools")
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5" />
                  <span>SEO Tools</span>
                </div>
                {isToolsMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {isToolsMenuOpen && (
                <div className="ml-6 mt-1 space-y-1 max-h-64 overflow-y-auto">
                  {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-emerald-600 text-sm ${
                          isActive(tool.path)
                            ? "bg-emerald-50 text-emerald-600 font-medium"
                            : ""
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tool.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                  isActive("/dashboard/profile")
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : ""
                }`}
              >
                <User className="h-5 w-5" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/dashboard/subscription-history"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                  isActive("/dashboard/subscription-history")
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : ""
                }`}
              >
                <History className="h-5 w-5" />
                <span>Billing History</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                  isActive("/dashboard/settings")
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : ""
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <Link
                href="/dashboard/help"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 hover:text-emerald-600 ${
                  isActive("/dashboard/help")
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : ""
                }`}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help & Support</span>
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-slate-700 hover:bg-slate-100 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
                AI SEO Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {credits} Credits
                </span>
              </Button>

              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      {user?.primaryEmailAddress?.emailAddress?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>

                {isProfileMenuOpen && (
                  <div
                    id="profile-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 z-50"
                  >
                    <div className="py-1">
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <User className="h-4 w-4 inline mr-2" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Settings className="h-4 w-4 inline mr-2" />
                        Settings
                      </Link>
                      <Link
                        href="/dashboard/subscription-history"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <CreditCard className="h-4 w-4 inline mr-2" />
                        Billing & Subscription
                      </Link>
                      <div className="border-t border-slate-200 my-1"></div>
                      <SignOutButton>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Logout
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 md:p-6">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
