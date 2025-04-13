"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function ParaphrasingTool() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [paraphrasedText, setParaphrasedText] = useState("")
  const [mode, setMode] = useState("standard")
  const [strength, setStrength] = useState([50])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("original")

  const handleParaphrase = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to paraphrase.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock paraphrased text based on mode and strength
      let paraphrased = ""

      if (mode === "standard") {
        paraphrased = `${originalText.split(" ").slice(0, 5).join(" ")}... [Standard paraphrase of your content with ${strength[0]}% modification would appear here. The text would maintain the same meaning while using different words and sentence structures.]`
      } else if (mode === "fluency") {
        paraphrased = `${originalText.split(" ").slice(0, 5).join(" ")}... [Fluency-focused paraphrase with ${strength[0]}% modification would appear here. The text would be more natural and flowing while preserving the original meaning.]`
      } else if (mode === "creative") {
        paraphrased = `${originalText.split(" ").slice(0, 5).join(" ")}... [Creative paraphrase with ${strength[0]}% modification would appear here. The text would use more expressive language and alternative phrasings while keeping the core message.]`
      }

      setParaphrasedText(paraphrased)
      setActiveTab("paraphrased")
      setIsProcessing(false)

      toast({
        title: "Paraphrasing complete",
        description: "Your text has been paraphrased successfully.",
      })
    }, 3000)
  }

  const handleClear = () => {
    setOriginalText("")
    setParaphrasedText("")
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
          <RefreshCw className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Paraphrasing Tool</h1>
          <p className="text-slate-600">Rewrite your text while preserving the original meaning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Content</CardTitle>
              <CardDescription>Enter your text to paraphrase</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="paraphrased" disabled={!paraphrasedText}>
                    Paraphrased
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-0">
                  <Textarea
                    placeholder="Enter or paste your text here..."
                    className="min-h-[300px] resize-none"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="paraphrased" className="mt-0">
                  <Textarea
                    placeholder="Paraphrased content will appear here..."
                    className="min-h-[300px] resize-none"
                    value={paraphrasedText}
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
                  onClick={handleParaphrase}
                  disabled={isProcessing || !originalText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Paraphrasing...
                    </>
                  ) : (
                    "Paraphrase Text"
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
              <CardDescription>Configure the paraphrasing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paraphrasing Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fluency">Fluency</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {mode === "standard" && "Basic paraphrasing that maintains the original meaning"}
                  {mode === "fluency" && "Improves readability and natural flow of text"}
                  {mode === "creative" && "Uses more creative expressions and alternative phrasings"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Paraphrasing Strength</label>
                  <span className="text-sm font-medium">{strength}%</span>
                </div>
                <Slider value={strength} min={10} max={90} step={10} onValueChange={setStrength} className="w-full" />
                <p className="text-xs text-slate-500">
                  {strength[0] < 30 && "Minimal changes to the original text"}
                  {strength[0] >= 30 && strength[0] < 70 && "Moderate rewording while preserving meaning"}
                  {strength[0] >= 70 && "Extensive rewording with significant changes"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
