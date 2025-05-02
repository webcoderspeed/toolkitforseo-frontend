"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileEdit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ArticleRewriter() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [rewrittenText, setRewrittenText] = useState("")
  const [style, setStyle] = useState("professional")
  const [isRewriting, setIsRewriting] = useState(false)
  const [activeTab, setActiveTab] = useState("original")

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to rewrite.",
        variant: "destructive",
      })
      return
    }

    setIsRewriting(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock rewritten text based on style
      let rewritten = ""

      if (style === "professional") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [Professional rewrite of your content would appear here with formal language and industry-specific terminology. The content would maintain the same meaning while using more sophisticated vocabulary and structure.]`
      } else if (style === "casual") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [Casual rewrite of your content would appear here with conversational tone and approachable language. The content would feel friendly and easy to read while maintaining the original meaning.]`
      } else if (style === "creative") {
        rewritten = `${originalText.split(" ").slice(0, 5).join(" ")}... [Creative rewrite of your content would appear here with engaging language and vivid descriptions. The content would be more expressive and use metaphors or analogies where appropriate.]`
      }

      setRewrittenText(rewritten)
      setActiveTab("rewritten")
      setIsRewriting(false)

      toast({
        title: "Rewrite complete",
        description: "Your article has been rewritten successfully.",
      })
    }, 3000)
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
          <FileEdit className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Article Rewriter</h1>
          <p className="text-slate-600">Rewrite your content with different styles using AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Enter your article to rewrite</CardDescription>
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
                    placeholder="Enter or paste your article here..."
                    className="min-h-[300px] resize-none"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="rewritten" className="mt-0">
                  <Textarea
                    placeholder="Rewritten content will appear here..."
                    className="min-h-[300px] resize-none"
                    value={rewrittenText}
                    readOnly
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">{originalText.length} characters</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} disabled={isRewriting}>
                  Clear
                </Button>
                <Button
                  onClick={handleRewrite}
                  disabled={isRewriting || !originalText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    "Rewrite Article"
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
              <CardDescription>Configure the rewriting style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Writing Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {style === "professional" && "Formal language suitable for business or academic content"}
                  {style === "casual" && "Conversational tone for blogs and social media"}
                  {style === "creative" && "Engaging and expressive language for storytelling"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
