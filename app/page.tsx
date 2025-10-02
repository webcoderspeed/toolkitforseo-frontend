"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  LinkIcon,
  Anchor,
  Globe,
  GaugeIcon as Speedometer,
  Database,
  Code,
  ShieldCheck,
  Users,
  TrendingUp,
  Star,
  Award,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration errors by not rendering dynamic content until client-side
  if (!isMounted) {
    return null;
  }

  const handleToolClick = (toolName: string) => {
    const toolUrl = toolName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/tools/${toolUrl}`);
  };

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
  ];

  const keywordTools = [
    { name: "Keyword Research Tool", icon: <Search className="h-5 w-5" /> },
    { name: "Keyword Competition Tool", icon: <Crosshair className="h-5 w-5" /> },
    { name: "Long Tail Keyword Suggestion Tool", icon: <ArrowUpRight className="h-5 w-5" /> },
    { name: "SEO Keyword Competition Analysis", icon: <BarChart className="h-5 w-5" /> },
    { name: "Live Keyword Analyzer", icon: <Gauge className="h-5 w-5" /> },
  ];

  const backlinkTools = [
    { name: "Backlink Checker", icon: <LinkIcon className="h-5 w-5" /> },
    { name: "Backlink Maker", icon: <LinkIcon className="h-5 w-5" /> },
    { name: "Website Link Count Checker", icon: <Database className="h-5 w-5" /> },
    { name: "Anchor Text Distribution", icon: <Anchor className="h-5 w-5" /> },
    { name: "Valuable Backlink Checker", icon: <CheckCircle className="h-5 w-5" /> },
  ];

  const seoTools = [
    { name: "Website SEO Score Checker", icon: <Globe className="h-5 w-5" /> },
    { name: "Page Speed Test", icon: <Speedometer className="h-5 w-5" /> },
    { name: "Google Index Checker", icon: <Database className="h-5 w-5" /> },
    { name: "Meta Tag Generator", icon: <Code className="h-5 w-5" /> },
    { name: "SSL Checker", icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  const stats = [
    { number: "25+", label: "AI-Powered Tools", icon: <Zap className="h-6 w-6" /> },
    { number: "100%", label: "Free Forever", icon: <Award className="h-6 w-6" /> },
    { number: "10K+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUp className="h-6 w-6" /> },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="container mx-auto py-6 px-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
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
              🚀 Live & Ready
            </Badge>
            <SignedOut>
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </div>
            </SignedOut>
            <SignedIn>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/tools">Access Tools</Link>
              </Button>
            </SignedIn>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                <Star className="h-4 w-4" />
                Next-Gen SEO Platform - Fully Launched
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                The Complete SEO Toolkit
                <br />
                <span className="text-emerald-600">Powered by AI</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                25 professional-grade SEO tools that would cost $500+/month elsewhere. 
                <span className="font-semibold text-emerald-700"> Completely free forever.</span>
                <br />
                Join thousands of marketers, agencies, and businesses already using our platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <SignedOut>
                <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                  <Link href="/sign-up">
                    Start Using Tools Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4">
                  <Link href="/tools">
                    View All Tools
                  </Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                  <Link href="/tools">
                    Access Your Tools
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </SignedIn>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-center mb-3 text-emerald-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Tools Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Complete SEO Arsenal
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need for SEO success. No subscriptions, no limits, no catch.
              </p>
            </div>

            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="text">Content Tools</TabsTrigger>
                <TabsTrigger value="keyword">Keyword Tools</TabsTrigger>
                <TabsTrigger value="backlink">Backlink Tools</TabsTrigger>
                <TabsTrigger value="seo">SEO Utilities</TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {textTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} onClick={() => handleToolClick(tool.name)} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="keyword">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {keywordTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} onClick={() => handleToolClick(tool.name)} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="backlink">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {backlinkTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} onClick={() => handleToolClick(tool.name)} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="seo">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {seoTools.map((tool, index) => (
                    <motion.div key={index} variants={item}>
                      <ToolCard icon={tool.icon} name={tool.name} onClick={() => handleToolClick(tool.name)} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ToolkitForSEO?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              We've built what the SEO community has been asking for - professional tools without the premium price tag.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <Target className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Enterprise Quality</h3>
                <p className="text-sm opacity-90">Professional-grade tools used by Fortune 500 companies</p>
              </div>
              <div className="space-y-2">
                <Zap className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">AI-Powered</h3>
                <p className="text-sm opacity-90">Latest AI technology for accurate and fast results</p>
              </div>
              <div className="space-y-2">
                <Award className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Always Free</h3>
                <p className="text-sm opacity-90">No hidden costs, no premium tiers, no limitations</p>
              </div>
            </div>
            <SignedOut>
              <Button size="lg" variant="secondary" asChild className="bg-white text-emerald-600 hover:bg-gray-50">
                <Link href="/sign-up">
                  Join 10,000+ Users Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </SignedOut>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Supercharge Your SEO?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of marketers, agencies, and businesses who trust ToolkitForSEO for their SEO needs.
            </p>
            <SignedOut>
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                <Link href="/sign-up">
                  Get Started - It's Free Forever
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-4">
                <Link href="/tools">
                  Start Using Tools Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </SignedIn>
          </motion.div>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-emerald-400" />
              <span className="text-xl font-bold">ToolkitForSEO</span>
            </div>
            <p className="text-slate-400 mb-4">
              The world's most comprehensive free SEO toolkit. Built for professionals, accessible to everyone.
            </p>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              <span>© 2024 ToolkitForSEO</span>
              <span>•</span>
              <span>All tools free forever</span>
              <span>•</span>
              <span>No registration required for preview</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ 
  icon, 
  name, 
  onClick 
}: { 
  icon: React.ReactNode; 
  name: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
          {name}
        </span>
      </div>
    </motion.div>
  );
}
