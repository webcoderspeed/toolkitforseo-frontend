"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlignJustify, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SentenceRephraser() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [rephrasedText, setRephrasedText] = useState("")
  const [tone, setTone] = useState("professional")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("original")

  const handleRephrase = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter a sentence to rephrase.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock rephrased text based on tone
      let rephrased = ""

      if (tone === "professional") {
        rephrased = `${originalText.split(" ").slice(0, 3).join(" ")}... [Professional rephrasing of your sentence would appear here with formal language and business-appropriate terminology.]`
      } else if (tone === "casual") {
        rephrased = `${originalText.split(" ").slice(0, 3).join(" ")}... [Casual rephrasing of your sentence would appear here with relaxed, conversational language.]`
      } else if (tone === "academic") {
        rephrased = `${originalText.split(" ").slice(0, 3).join(" ")}... [Academic rephrasing of your sentence would appear here with scholarly language and precise terminology.]`
      } else if (tone === "creative") {
        rephrased = `${originalText.split(" ").slice(0, 3).join(" ")}... [Creative rephrasing of your sentence would appear here with vivid language and expressive phrasing.]`
      }

      setRephrasedText(rephrased)
      setActiveTab("rephrased")
      setIsProcessing(false)

      toast({
        title: "Rephrasing complete",
        description: "Your sentence has been rephrased successfully.",
      })
    }, 2000)
  }

  const handleClear = () => {
    setOriginalText("")
    setRephrasedText("")
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
          <AlignJustify className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sentence Rephraser</h1>
          <p className="text-slate-600">Rephrase your sentences with different tones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sentence Content</CardTitle>
              <CardDescription>Enter your sentence to rephrase</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="rephrased" disabled={!rephrasedText}>
                    Rephrased
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-0">
                  <Textarea
                    placeholder="Enter your sentence here..."
                    className="min-h-[200px] resize-none"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="rephrased" className="mt-0">
                  <Textarea
                    placeholder="Rephrased sentence will appear here..."
                    className="min-h-[200px] resize-none"
                    value={rephrasedText}
                    readOnly
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">{originalText.length} characters</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} disabled={isProcessing}>
                  Clear
                </Button>
                <Button
                  onClick={handleRephrase}
                  disabled={isProcessing || !originalText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rephrasing...
                    </>
                  ) : (
                    "Rephrase Sentence"
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
              <CardDescription>Choose your rephrasing tone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {tone === "professional" && "Formal language suitable for business communication"}
                  {tone === "casual" && "Relaxed, conversational tone for everyday use"}
                  {tone === "academic" && "Scholarly language for academic papers and research"}
                  {tone === "creative" && "Expressive language for creative writing"}
                </p>
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
                  <span>Enter complete sentences for better results</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">2</span>
                  </div>
                  <span>Choose a tone that matches your target audience</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-emerald-700">3</span>
                  </div>
                  <span>For longer content, use our Article Rewriter tool</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
