"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function TextSummarizer() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [summarizedText, setSummarizedText] = useState("")
  const [style, setStyle] = useState("concise")
  const [length, setLength] = useState([50])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("original")

  const handleSummarize = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      })
      return
    }

    if (originalText.split(" ").length < 20) {
      toast({
        title: "Text too short",
        description: "Please enter a longer text for better summarization results.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock summarized text based on style and length
      let summarized = ""

      if (style === "concise") {
        summarized = `[This is a ${length}% length concise summary of your text. It would contain only the most important points in a straightforward manner.]`
      } else if (style === "bullet") {
        summarized = `• Main point one extracted from your text\n• Second key point from your content\n• Third important concept from your text\n• Final crucial element summarized`
      } else if (style === "paragraph") {
        summarized = `[This is a ${length}% length paragraph summary of your text. It would present the key points in a cohesive paragraph format, maintaining the flow and context of your original content while significantly reducing the length.]`
      }

      setSummarizedText(summarized)
      setActiveTab("summarized")
      setIsProcessing(false)

      toast({
        title: "Summarization complete",
        description: `Your text has been summarized to approximately ${length}% of the original length.`,
      })
    }, 3000)
  }

  const handleClear = () => {
    setOriginalText("")
    setSummarizedText("")
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
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Text Summarizer</h1>
          <p className="text-slate-600">Condense your text while preserving key information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Content</CardTitle>
              <CardDescription>Enter your text to summarize</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="summarized" disabled={!summarizedText}>
                    Summarized
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-0">
                  <Textarea
                    placeholder="Enter or paste your text here (minimum 20 words for better results)..."
                    className="min-h-[300px] resize-none"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="summarized" className="mt-0">
                  <Textarea
                    placeholder="Summarized content will appear here..."
                    className="min-h-[300px] resize-none"
                    value={summarizedText}
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
                <Button variant="outline" onClick={handleClear} disabled={isProcessing}>
                  Clear
                </Button>
                <Button
                  onClick={handleSummarize}
                  disabled={isProcessing || !originalText.trim() || originalText.split(" ").length < 20}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    "Summarize Text"
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
              <CardDescription>Configure summarization options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="bullet">Bullet Points</SelectItem>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {style === "concise" && "Brief summary with only essential information"}
                  {style === "bullet" && "Key points presented as bullet points"}
                  {style === "paragraph" && "Cohesive paragraph that maintains context"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Summary Length</label>
                  <span className="text-sm font-medium">{length}%</span>
                </div>
                <Slider value={length} min={10} max={70} step={10} onValueChange={setLength} className="w-full" />
                <p className="text-xs text-slate-500">
                  {length[0] <= 20 && "Very short summary with only the most critical points"}
                  {length[0] > 20 && length[0] <= 40 && "Short summary with key information"}
                  {length[0] > 40 && "Longer summary with more details preserved"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
