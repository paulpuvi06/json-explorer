"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonTableViewer } from "@/components/json-table-viewer"
import { JsonTreeViewer } from "@/components/json-tree-viewer"
import { FileUpload } from "@/components/file-upload"
import { UrlFetch } from "@/components/url-fetch"
import { CheckCircle, AlertCircle, FileText, Upload, Code, Table, Shield, Zap, Filter, Download, Search, BarChart3, Copy, RotateCcw, RotateCw, Moon, Sun } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip } from "@/components/ui/tooltip"

export default function JsonExplorerApp() {
  const [jsonInput, setJsonInput] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [dataKey, setDataKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [viewMode, setViewMode] = useState<"table" | "tree">("table")
  const urlFetchClearAllRef = useRef<(() => void) | null>(null)

  // Check if JSON is flat (suitable for table view)
  const isFlatJson = useMemo(() => {
    if (!parsedJson) return true
    
    // If it's an array of objects, check if each object is flat
    if (Array.isArray(parsedJson)) {
      return parsedJson.every(item => {
        if (typeof item !== "object" || item === null) return true
        
        // Check if object has nested objects/arrays (more than 1 level deep)
        return Object.values(item).every(value => {
          if (value === null || typeof value !== "object") return true
          if (Array.isArray(value)) {
            // Arrays of primitives are OK for table view
            return value.every(arrItem => 
              arrItem === null || typeof arrItem !== "object"
            )
          }
          // Nested objects are not flat
          return false
        })
      })
    }
    
    // For single objects, check if they have nested objects
    if (typeof parsedJson === "object" && parsedJson !== null) {
      const values = Object.values(parsedJson)
      const hasNestedObjects = values.some(
        (value) => typeof value === "object" && value !== null && !Array.isArray(value)
      )
      
      if (hasNestedObjects) {
        // Check if all nested objects are flat (suitable for table view)
        return values.every(value => {
          if (value === null || typeof value !== "object") return true
          if (Array.isArray(value)) {
            // Arrays of primitives are OK for table view
            return value.every(arrItem => 
              arrItem === null || typeof arrItem !== "object"
            )
          }
          // Check if nested object is flat (no deeper nesting)
          return Object.values(value).every(nestedValue => {
            if (nestedValue === null || typeof nestedValue !== "object") return true
            if (Array.isArray(nestedValue)) {
              // Arrays of primitives are OK
              return nestedValue.every(arrItem => 
                arrItem === null || typeof arrItem !== "object"
              )
            }
            // Deeper nesting is not flat
            return false
          })
        })
      } else {
        // No nested objects, check arrays
        return values.every(value => {
          if (value === null || typeof value !== "object") return true
          if (Array.isArray(value)) {
            // Arrays of primitives are OK for table view
            return value.every(arrItem => 
              arrItem === null || typeof arrItem !== "object"
            )
          }
          return false
        })
      }
    }
    
    return true
  }, [parsedJson])

  // Auto-switch to tree view if JSON is not flat
  useEffect(() => {
    if (parsedJson && !isFlatJson && viewMode === "table") {
      setViewMode("tree")
    }
  }, [parsedJson, isFlatJson, viewMode])

  useEffect(() => {
    if (jsonInput.trim()) {
      validateAndParseJson()
    } else {
      setParsedJson(null)
      setError(null)
      setIsValid(null)
    }
  }, [jsonInput])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            validateAndParseJson()
            break
          case 'z':
            if (!e.shiftKey) {
              e.preventDefault()
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const validateAndParseJson = () => {
    console.log("[json-explorer] Parsing JSON, input length:", jsonInput.length)
    setIsLoading(true)

    if (!jsonInput.trim()) {
      setError("Please enter some JSON data")
      setIsValid(false)
      setParsedJson(null)
      setIsLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      console.log("[json-explorer] JSON parsed successfully, keys:", Object.keys(parsed))
      setParsedJson(parsed)
      setError(null)
      setIsValid(true)
      setDataKey((prev) => prev + 1)
      
      // Add to history
      addToHistory(jsonInput)
    } catch (err) {
      console.log("[json-explorer] JSON parse error:", err)
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setIsValid(false)
      setParsedJson(null)
    } finally {
      setIsLoading(false)
    }
  }

  const addToHistory = (input: string) => {
    if (input.trim() && input !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(input)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setJsonInput(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setJsonInput(history[newIndex])
    }
  }

  const formatJson = () => {
    if (parsedJson) {
      setJsonInput(JSON.stringify(parsedJson, null, 2))
    }
  }

  const minifyJson = () => {
    if (parsedJson) {
      setJsonInput(JSON.stringify(parsedJson))
    }
  }

  const clearAll = () => {
    setJsonInput("")
    setParsedJson(null)
    setError(null)
    setIsValid(null)
    setDataKey(0)
    setHistory([])
    setHistoryIndex(-1)
    // Also clear URL fetch data
    if (urlFetchClearAllRef.current) {
      urlFetchClearAllRef.current()
    }
  }

  const sampleDataSets = {
    "AI Models": [
      {
        "provider": "OpenAI",
        "model": "GPT-4",
        "cost": 0.03,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://openai.com",
        "release_date": "2023-03-14",
        "parameters": "1.76T",
        "training_data": "September 2021",
        "max_tokens": 4096
      },
      {
        "provider": "OpenAI",
        "model": "GPT-4 Turbo",
        "cost": 0.01,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning", "vision"],
        "api": true,
        "website": "https://openai.com",
        "release_date": "2023-11-06",
        "parameters": "1.76T",
        "training_data": "April 2023",
        "max_tokens": 4096
      },
      {
        "provider": "OpenAI",
        "model": "GPT-3.5 Turbo",
        "cost": 0.002,
        "context": 16384,
        "capabilities": ["text", "code"],
        "api": true,
        "website": "https://openai.com",
        "release_date": "2022-11-30",
        "parameters": "175B",
        "training_data": "September 2021",
        "max_tokens": 4096
      },
      {
        "provider": "Anthropic",
        "model": "Claude 3 Opus",
        "cost": 0.015,
        "context": 200000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://anthropic.com",
        "release_date": "2024-03-04",
        "parameters": "Unknown",
        "training_data": "August 2023",
        "max_tokens": 4096
      },
      {
        "provider": "Anthropic",
        "model": "Claude 3 Sonnet",
        "cost": 0.003,
        "context": 200000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://anthropic.com",
        "release_date": "2024-03-04",
        "parameters": "Unknown",
        "training_data": "August 2023",
        "max_tokens": 4096
      },
      {
        "provider": "Anthropic",
        "model": "Claude 3 Haiku",
        "cost": 0.00025,
        "context": 200000,
        "capabilities": ["text", "code"],
        "api": true,
        "website": "https://anthropic.com",
        "release_date": "2024-03-04",
        "parameters": "Unknown",
        "training_data": "August 2023",
        "max_tokens": 4096
      },
      {
        "provider": "Google",
        "model": "Gemini Pro",
        "cost": 0.0005,
        "context": 32000,
        "capabilities": ["text", "code", "multimodal"],
        "api": true,
        "website": "https://ai.google.dev",
        "release_date": "2023-12-06",
        "parameters": "Unknown",
        "training_data": "2023",
        "max_tokens": 2048
      },
      {
        "provider": "Google",
        "model": "Gemini Ultra",
        "cost": 0.01,
        "context": 32000,
        "capabilities": ["text", "code", "multimodal", "reasoning"],
        "api": true,
        "website": "https://ai.google.dev",
        "release_date": "2024-02-15",
        "parameters": "Unknown",
        "training_data": "2023",
        "max_tokens": 2048
      },
      {
        "provider": "Meta",
        "model": "Llama 2",
        "cost": 0,
        "context": 4096,
        "capabilities": ["text", "code"],
        "api": false,
        "website": "https://ai.meta.com",
        "local": true,
        "release_date": "2023-07-18",
        "parameters": "70B",
        "training_data": "September 2022",
        "max_tokens": 4096
      },
      {
        "provider": "Meta",
        "model": "Llama 3",
        "cost": 0,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning"],
        "api": false,
        "website": "https://ai.meta.com",
        "local": true,
        "release_date": "2024-04-18",
        "parameters": "405B",
        "training_data": "March 2024",
        "max_tokens": 8192
      },
      {
        "provider": "Mistral",
        "model": "Mistral 7B",
        "cost": 0,
        "context": 32000,
        "capabilities": ["text", "code"],
        "api": false,
        "website": "https://mistral.ai",
        "local": true,
        "release_date": "2023-09-27",
        "parameters": "7B",
        "training_data": "2023",
        "max_tokens": 32000
      },
      {
        "provider": "Mistral",
        "model": "Mixtral 8x7B",
        "cost": 0,
        "context": 32000,
        "capabilities": ["text", "code", "reasoning"],
        "api": false,
        "website": "https://mistral.ai",
        "local": true,
        "release_date": "2024-01-31",
        "parameters": "45B",
        "training_data": "2023",
        "max_tokens": 32000
      },
      {
        "provider": "Cohere",
        "model": "Command",
        "cost": 0.0015,
        "context": 4096,
        "capabilities": ["text", "code"],
        "api": true,
        "website": "https://cohere.com",
        "release_date": "2023-05-15",
        "parameters": "Unknown",
        "training_data": "2023",
        "max_tokens": 2048
      },
      {
        "provider": "Cohere",
        "model": "Command Light",
        "cost": 0.0003,
        "context": 4096,
        "capabilities": ["text"],
        "api": true,
        "website": "https://cohere.com",
        "release_date": "2023-05-15",
        "parameters": "Unknown",
        "training_data": "2023",
        "max_tokens": 2048
      },
      {
        "provider": "xAI",
        "model": "Grok-1",
        "cost": 0.01,
        "context": 8192,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://x.ai",
        "release_date": "2024-03-17",
        "parameters": "314B",
        "training_data": "October 2023",
        "max_tokens": 4096
      }
    ]
  }

  const loadSampleJson = () => {
    setJsonInput(JSON.stringify(sampleDataSets["AI Models"], null, 2))
    setDataKey((prev) => prev + 1)
    setHistory([])
    setHistoryIndex(-1)
    
    // Scroll to data section after a short delay to allow for rendering
    setTimeout(() => {
      const dataSection = document.getElementById('data-analysis-section')
      dataSection?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  const handleFileContent = (content: string) => {
    console.log("[json-explorer] File content received, length:", content.length)
    setJsonInput(content)
    setDataKey((prev) => prev + 1)
  }

  // Auto-resize textarea when content changes
  useEffect(() => {
    const textarea = document.querySelector('textarea[placeholder="Paste your JSON data here..."]') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.max(200, Math.min(textarea.scrollHeight, window.innerHeight * 0.6)) + 'px'
    }
  }, [jsonInput])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <Tooltip content="Toggle light/dark mode">
          <ThemeToggle />
        </Tooltip>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">JSON Explorer</h1>
          <p className="text-muted-foreground text-base sm:text-lg text-pretty mb-6">
            Parse, explore, filter, and analyze JSON data with advanced table views.<br />
            Transform complex data into actionable insights and export results.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Smart Filtering</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Data Grouping</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Export Options</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Privacy First</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="h-4 w-4" />
            <span>All data processed locally • No server storage</span>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-2xl mx-auto">
            <p>
              <strong>Pro Tip:</strong> Flat JSON structures work better with <strong>Table View</strong> for filtering and analysis. 
              Complex nested structures will automatically enable <strong>Tree View only</strong> for better visualization.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <Card className="border-2 border-muted/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/5">
            <CardHeader className="bg-gradient-to-r from-muted/20 to-muted/10 border-b border-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    JSON Data Source
                  </CardTitle>
                  <CardDescription className="text-base mt-1">Paste your JSON data, upload a file, or fetch from URL</CardDescription>
                </div>
                <Button 
                  onClick={loadSampleJson} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 border-muted/50"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Load Sample Data</span>
                  <span className="sm:hidden">Sample</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger
                    value="text"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50"
                  >
                    <FileText className="h-4 w-4" />
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50"
                  >
                    <Upload className="h-4 w-4" />
                    File Upload
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50"
                  >
                    <Download className="h-4 w-4" />
                    From URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your JSON data here..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="font-mono text-sm pr-20 border-2 border-muted/50 focus:border-primary/50 focus:ring-0 focus:outline-none transition-all duration-200 bg-background/50 resize-none scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:border-muted-foreground/30 p-8"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)',
                        height: 'auto',
                        minHeight: '200px',
                        maxHeight: '60vh'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.max(200, Math.min(target.scrollHeight, window.innerHeight * 0.6)) + 'px';
                      }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-muted/30 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">{jsonInput.length} chars</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="font-medium">{jsonInput.split('\n').length} lines</span>
                    </div>
                    {jsonInput.length > 2000 && (
                      <Button
                        size="sm"
                        variant="default"
                        className="absolute top-3 right-3 z-20 animate-bounce bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border-0"
                        style={{ animation: 'bounce 1.2s infinite' }}
                        onClick={() => {
                          const el = document.getElementById('data-analysis-section')
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        title="Scroll to Data Analysis"
                      >
                        <span className="hidden sm:inline font-medium">Scroll to Data</span>
                        <span className="sm:hidden font-medium">↓</span>
                        <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="file">
                  <FileUpload onFileContent={handleFileContent} />
                </TabsContent>

                <TabsContent value="url">
                  <UrlFetch onUrlContent={handleFileContent} clearAllRef={urlFetchClearAllRef} />
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-3">
                <Tooltip content="Parse and analyze JSON (Ctrl+Enter)">
                  <Button 
                    onClick={validateAndParseJson} 
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="h-4 w-4 text-primary-foreground" />
                        <span className="hidden sm:inline font-medium">Parsing...</span>
                        <span className="sm:hidden font-medium">Parsing</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline font-medium">Parse & Analyze</span>
                        <span className="sm:hidden font-medium">Parse</span>
                      </>
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content="Format JSON (pretty print)">
                  <Button 
                    variant="outline" 
                    onClick={formatJson} 
                    disabled={!parsedJson}
                    title="Format JSON with proper indentation"
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Format</span>
                  </Button>
                </Tooltip>
                <Tooltip content="Minify JSON (remove whitespace)">
                  <Button 
                    variant="outline" 
                    onClick={minifyJson} 
                    disabled={!parsedJson}
                    title="Minify JSON (remove whitespace)"
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30"
                  >
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Minify</span>
                  </Button>
                </Tooltip>
                <Tooltip content="Undo (Ctrl+Z)">
                  <Button 
                    variant="outline" 
                    onClick={undo} 
                    disabled={historyIndex <= 0}
                    title="Undo (Ctrl+Z)"
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Redo (Ctrl+Y)">
                  <Button 
                    variant="outline" 
                    onClick={redo} 
                    disabled={historyIndex >= history.length - 1}
                    title="Redo (Ctrl+Y)"
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Clear all data">
                  <Button 
                    variant="outline" 
                    onClick={clearAll} 
                    title="Clear all data"
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 border-muted/50"
                  >
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </Tooltip>
              </div>

              {/* Status */}
              {isValid !== null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid JSON
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Invalid JSON
                      </Badge>
                    )}
                    {parsedJson && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {Array.isArray(parsedJson) 
                          ? `${parsedJson.length} items` 
                          : typeof parsedJson === 'object' && parsedJson !== null
                            ? 'Object'
                            : typeof parsedJson === 'string'
                              ? 'String'
                              : typeof parsedJson === 'number'
                                ? 'Number'
                                : typeof parsedJson === 'boolean'
                                  ? 'Boolean'
                                  : parsedJson === null
                                    ? 'Null'
                                    : 'Unknown'
                        }
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="hidden sm:inline">Press </span>
                    <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Ctrl+Enter</kbd>
                    <span className="hidden sm:inline"> to parse</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Data Analysis Section */}
          {parsedJson && (
            <Card id="data-analysis-section">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Table className="h-5 w-5" />
                      Data Analysis
                    </CardTitle>
                    <CardDescription>Analyze your data with filtering, grouping, and export options</CardDescription>
                  </div>
                  {viewMode === "table" ? (
                    <JsonTableViewer key={dataKey} data={parsedJson} showStatsOnly={true} />
                  ) : (
                    <JsonTreeViewer key={dataKey} data={parsedJson} showStatsOnly={true} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "tree")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl mb-4">
                    <TabsTrigger 
                      value="table" 
                      className="flex items-center gap-2"
                      disabled={!isFlatJson}
                    >
                      <Table className="h-4 w-4" />
                      Table View
                      {!isFlatJson && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          N/A
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="tree" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tree View
                      {!isFlatJson && (
                        <Badge variant="default" className="text-xs h-4 px-1 bg-green-600">
                          Recommended
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  {!isFlatJson && viewMode === "table" && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Table view is optimized for flat JSON structures. Your data contains nested objects/arrays. 
                        <strong> Tree view is recommended</strong> for better visualization of complex data structures.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <TabsContent value="table">
                    {isFlatJson ? (
                      <JsonTableViewer key={dataKey} data={parsedJson} />
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Table view not available</p>
                          <p className="text-sm">This JSON contains nested structures. Use Tree view for better visualization.</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="tree">
                    <JsonTreeViewer key={dataKey} data={parsedJson} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-muted/30 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2025 JSON Explorer</span>
              <span>•</span>
              <span>Built with Next.js & Tailwind CSS</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>Made with</span>
                <span className="text-red-500">❤️</span>
                <span>by Paul</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'JSON Explorer',
                      text: 'Explore and analyze JSON data with advanced filtering and export capabilities',
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
              <a 
                href="https://hub.docker.com/r/paulpuvi/json-explorer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V8.463a.185.185 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v2.43c0 .102.083.185.185.185zM8.463 11.078h2.119a.186.186 0 00.186-.185V8.463a.185.185 0 00-.186-.186H8.463a.185.185 0 00-.185.186v2.43c0 .102.083.185.185.185zM8.463 15.537h2.119a.186.186 0 00.186-.185v-2.43a.185.185 0 00-.186-.185H8.463a.185.185 0 00-.185.185v2.43c0 .102.083.185.185.185zM13.983 15.537h2.119a.186.186 0 00.186-.185v-2.43a.185.185 0 00-.186-.185h-2.119a.185.185 0 00-.185.185v2.43c0 .102.083.185.185.185z"/>
                </svg>
                Docker
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
