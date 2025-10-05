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
import { api } from "@/store"
import { SummaryResult, SummaryStyle, SummaryLength } from "@/store/types"

export default function TextSummarizer() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [results, setResults] = useState<SummaryResult | null>(null)
  const [style, setStyle] = useState<SummaryStyle>("paragraph")
  const [lengthPercentage, setLengthPercentage] = useState([50])
  const [length, setLength] = useState<SummaryLength>("medium")
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

    try {
      const { data } = await api.post<SummaryResult>('/api/text-summarize', {
        text: originalText,
        length,
        style,
        vendor: 'gemini',
      });

      setResults(data);
      setActiveTab("summarized");
      toast({
        title: "Summarization complete",
        description: `Your text has been summarized successfully.`,
      });
    } catch (error) {
      console.error("Failed to summarize text:", error);
      toast({
        title: "Failed to summarize text",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleClear = () => {
    setOriginalText("")
    setResults(null)
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
                  <TabsTrigger value="summarized" disabled={!results}>
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
                    value={results?.summary || ""}
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
                <Select value={style} onValueChange={(value: SummaryStyle) => setStyle(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullet_points">Bullet Points</SelectItem>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {style === "bullet_points" && "Key points presented as bullet points"}
                  {style === "paragraph" && "Cohesive paragraph that maintains context"}
                  {style === "abstract" && "Academic-style abstract summary"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Summary Length</label>
                  <span className="text-sm font-medium">{lengthPercentage[0]}%</span>
                </div>
                <Slider value={lengthPercentage} min={10} max={70} step={10} onValueChange={setLengthPercentage} className="w-full" />
                <p className="text-xs text-slate-500">
                  {lengthPercentage[0] <= 20 && "Very short summary with only the most critical points"}
                  {lengthPercentage[0] > 20 && lengthPercentage[0] <= 40 && "Short summary with key information"}
                  {lengthPercentage[0] > 40 && "Longer summary with more details preserved"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
