"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function OnlineProofreader() {
  const { toast } = useToast()
  const [originalText, setOriginalText] = useState("")
  const [correctedText, setCorrectedText] = useState("")
  const [isProofreading, setIsProofreading] = useState(false)
  const [activeTab, setActiveTab] = useState("original")
  const [settings, setSettings] = useState({
    grammar: true,
    spelling: true,
    punctuation: true,
    style: true,
    wordChoice: true,
  })

  const handleProofread = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to proofread.",
        variant: "destructive",
      })
      return
    }

    setIsProofreading(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Mock corrected text
      let corrected = originalText

      // Simple mock corrections
      if (settings.spelling) {
        corrected = corrected.replace(/teh/g, "the")
        corrected = corrected.replace(/thier/g, "their")
      }

      if (settings.grammar) {
        corrected = corrected.replace(/me and my/gi, "my")
        corrected = corrected.replace(/they is/gi, "they are")
      }

      if (settings.punctuation) {
        corrected = corrected.replace(/\s+,/g, ",")
        corrected = corrected.replace(/\s+\./g, ".")
      }

      if (settings.wordChoice) {
        corrected = corrected.replace(/very good/gi, "excellent")
        corrected = corrected.replace(/very bad/gi, "terrible")
      }

      if (settings.style) {
        corrected = corrected.replace(/in order to/gi, "to")
        corrected = corrected.replace(/due to the fact that/gi, "because")
      }

      // If no changes were made, add a note
      if (corrected === originalText) {
        corrected = originalText + "\n\n[No errors found. Your text appears to be correct.]"
      }

      setCorrectedText(corrected)
      setActiveTab("corrected")
      setIsProofreading(false)

      toast({
        title: "Proofreading complete",
        description: "Your text has been checked and corrected.",
      })
    }, 3000)
  }

  const handleClear = () => {
    setOriginalText("")
    setCorrectedText("")
    setActiveTab("original")
  }

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
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
          <Edit3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Online Proofreader</h1>
          <p className="text-slate-600">Check and correct your text for errors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Content</CardTitle>
              <CardDescription>Enter your text to proofread</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="corrected" disabled={!correctedText}>
                    Corrected
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
                <TabsContent value="corrected" className="mt-0">
                  <Textarea
                    placeholder="Corrected text will appear here..."
                    className="min-h-[300px] resize-none"
                    value={correctedText}
                    readOnly
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-slate-500">{originalText.length} characters</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear} disabled={isProofreading}>
                  Clear
                </Button>
                <Button
                  onClick={handleProofread}
                  disabled={isProofreading || !originalText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isProofreading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Proofreading...
                    </>
                  ) : (
                    "Proofread Text"
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
              <CardDescription>Configure proofreading options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="grammar">Grammar</Label>
                  <p className="text-xs text-slate-500">Check for grammatical errors</p>
                </div>
                <Switch id="grammar" checked={settings.grammar} onCheckedChange={() => toggleSetting("grammar")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="spelling">Spelling</Label>
                  <p className="text-xs text-slate-500">Check for spelling mistakes</p>
                </div>
                <Switch id="spelling" checked={settings.spelling} onCheckedChange={() => toggleSetting("spelling")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="punctuation">Punctuation</Label>
                  <p className="text-xs text-slate-500">Check for punctuation errors</p>
                </div>
                <Switch
                  id="punctuation"
                  checked={settings.punctuation}
                  onCheckedChange={() => toggleSetting("punctuation")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="style">Style</Label>
                  <p className="text-xs text-slate-500">Check for style improvements</p>
                </div>
                <Switch id="style" checked={settings.style} onCheckedChange={() => toggleSetting("style")} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="wordChoice">Word Choice</Label>
                  <p className="text-xs text-slate-500">Suggest better word alternatives</p>
                </div>
                <Switch
                  id="wordChoice"
                  checked={settings.wordChoice}
                  onCheckedChange={() => toggleSetting("wordChoice")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>How our proofreader works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Our online proofreader uses advanced AI to check your text for various types of errors and suggest
                improvements.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Identifies grammar, spelling, and punctuation errors</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Suggests style improvements for clearer writing</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Recommends better word choices and phrasing</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <span>Works with any type of content or writing style</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
