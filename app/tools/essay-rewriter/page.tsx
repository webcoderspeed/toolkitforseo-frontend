"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function EssayRewriter() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [rewrittenText, setRewrittenText] = useState("")
  const [academicLevel, setAcademicLevel] = useState("college")
  const [tone, setTone] = useState("formal")
  const [isRewriting, setIsRewriting] = useState(false)
  const [activeTab, setActiveTab] = useState("original")

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter an essay to rewrite.",
        variant: "destructive",
      })
      return
    }

    if (originalText.split(" ").length < 100) {
      toast({
        title: "Essay too short",
        description: "Please enter at least 100 words for better results.",
        variant: "destructive",
      })
      return
    }

    setIsRewriting(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock rewritten text based on academic level and tone
      let rewritten = ""

      if (academicLevel === "high-school") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [High school level essay with ${tone} tone. The content would be rewritten to match the appropriate academic level with simpler vocabulary and straightforward structure.]`
      } else if (academicLevel === "college") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [College level essay with ${tone} tone. The content would be rewritten with more sophisticated vocabulary, complex sentence structures, and deeper analysis.]`
      } else if (academicLevel === "graduate") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [Graduate level essay with ${tone} tone. The content would be rewritten with advanced terminology, nuanced arguments, and scholarly approach appropriate for graduate-level work.]`
      }

      setRewrittenText(rewritten)
      setActiveTab("rewritten")
      setIsRewriting(false)

      toast({
        title: "Rewrite complete",
        description: "Your essay has been rewritten successfully.",
      })
    }, 4000)
  }

  const handleClear = () => {
    setOriginalText("")
    setRewrittenText("")
    setActiveTab("original")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Essay Rewriter</h1>
          <p className="text-slate-600">Rewrite your essays with academic precision</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Essay Content</CardTitle>
              <CardDescription>Enter your essay to rewrite</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="rewritten" disabled={!rewrittenText}>
                    Rewritten
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-0">
                  <Textarea
                    placeholder="Enter or paste your essay here (minimum 100 words recommended)..."
                    className="min-h-[400px] resize-none"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="rewritten" className="mt-0">
                  <Textarea
                    placeholder="Rewritten essay will appear here..."
                    className="min-h-[400px] resize-none"
                    value={rewrittenText}
                    readOnly
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">
                {originalText.split(" ").length} words / {originalText.length} characters
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} disabled={isRewriting}>
                  Clear
                </Button>
                <Button
                  onClick={handleRewrite}
                  disabled={isRewriting || !originalText.trim() || originalText.split(" ").length < 100}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    "Rewrite Essay"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure essay rewriting options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Level</label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                    <SelectItem value="graduate">Graduate/Professional</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {academicLevel === "high-school" && "Appropriate for high school assignments"}
                  {academicLevel === "college" && "Suitable for undergraduate college papers"}
                  {academicLevel === "graduate" && "Advanced level for graduate or professional work"}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Writing Tone</label>
                <RadioGroup value={tone} onValueChange={setTone} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal">Formal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="persuasive" id="persuasive" />
                    <Label htmlFor="persuasive">Persuasive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="analytical" id="analytical" />
                    <Label htmlFor="analytical">Analytical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical">Critical</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>How to get better results</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">1</span>
                  </div>
                  <span>Provide a complete essay with clear structure</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">2</span>
                  </div>
                  <span>Include introduction, body paragraphs, and conclusion</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">3</span>
                  </div>
                  <span>Choose academic level that matches your target audience</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">4</span>
                  </div>
                  <span>Select tone that aligns with your essay's purpose</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
