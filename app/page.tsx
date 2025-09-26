"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonTableViewer } from "@/components/json-table-viewer"
import { JsonTreeViewer } from "@/components/json-tree-viewer"
import { FileUpload } from "@/components/file-upload"
import { CheckCircle, AlertCircle, FileText, Upload, Code, Table, Shield, Zap, Filter, Download, Search, BarChart3, Copy, RotateCcw, RotateCw } from "lucide-react"

export default function JsonParserApp() {
  const [jsonInput, setJsonInput] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [dataKey, setDataKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [viewMode, setViewMode] = useState<"table" | "tree">("table")

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
            // Arrays of primitives are OK
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
      return Object.values(parsedJson).every(value => {
        if (value === null || typeof value !== "object") return true
        if (Array.isArray(value)) {
          return value.every(arrItem => 
            arrItem === null || typeof arrItem !== "object"
          )
        }
        return false
      })
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
    console.log("[json-parser] Parsing JSON, input length:", jsonInput.length)
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
      console.log("[json-parser] JSON parsed successfully, keys:", Object.keys(parsed))
      setParsedJson(parsed)
      setError(null)
      setIsValid(true)
      setDataKey((prev) => prev + 1)
      
      // Add to history
      addToHistory(jsonInput)
    } catch (err) {
      console.log("[json-parser] JSON parse error:", err)
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
  }

  const loadSampleJson = () => {
    const sampleData = [
      {
        "provider": "OpenAI",
        "model": "GPT-4",
        "cost": 0.03,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://openai.com"
      },
      {
        "provider": "OpenAI",
        "model": "GPT-4 Turbo",
        "cost": 0.01,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning", "vision"],
        "api": true,
        "website": "https://openai.com"
      },
      {
        "provider": "Anthropic",
        "model": "Claude 3 Opus",
        "cost": 0.015,
        "context": 200000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://anthropic.com"
      },
      {
        "provider": "Anthropic",
        "model": "Claude 3 Sonnet",
        "cost": 0.003,
        "context": 200000,
        "capabilities": ["text", "code", "reasoning"],
        "api": true,
        "website": "https://anthropic.com"
      },
      {
        "provider": "Google",
        "model": "Gemini Pro",
        "cost": 0.0005,
        "context": 32000,
        "capabilities": ["text", "code", "multimodal"],
        "api": true,
        "website": "https://ai.google.dev"
      },
      {
        "provider": "Meta",
        "model": "Llama 2",
        "cost": 0,
        "context": 4096,
        "capabilities": ["text", "code"],
        "api": false,
        "website": "https://ai.meta.com",
        "local": true
      },
      {
        "provider": "Ollama",
        "model": "Llama 3.1",
        "cost": 0,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning"],
        "api": false,
        "website": "https://ollama.ai",
        "local": true
      },
      {
        "provider": "Ollama",
        "model": "Mistral 7B",
        "cost": 0,
        "context": 32000,
        "capabilities": ["text", "code"],
        "api": false,
        "website": "https://ollama.ai",
        "local": true
      },
      {
        "provider": "LM Studio",
        "model": "Phi-3",
        "cost": 0,
        "context": 128000,
        "capabilities": ["text", "code", "reasoning"],
        "api": false,
        "website": "https://lmstudio.ai",
        "local": true
      },
      {
        "provider": "GPT4All",
        "model": "Mistral 7B",
        "cost": 0,
        "context": 8192,
        "capabilities": ["text", "code"],
        "api": false,
        "website": "https://gpt4all.io",
        "local": true
      }
    ]
    setJsonInput(JSON.stringify(sampleData, null, 2))
  }

  const handleFileContent = (content: string) => {
    console.log("[json-parser] File content received, length:", content.length)
    setJsonInput(content)
    setDataKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">JSON Data Viewer</h1>
          <p className="text-muted-foreground text-base sm:text-lg text-pretty mb-6">
            Parse, filter, and analyze JSON data with advanced table views. Transform complex data into actionable insights.
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    JSON Input
                  </CardTitle>
                  <CardDescription>Paste your JSON data or upload a file</CardDescription>
                </div>
                <Button onClick={loadSampleJson} variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Try Sample Data</span>
                  <span className="sm:hidden">Sample</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
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
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your JSON data here..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="min-h-[200px] font-mono text-sm pr-20"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      <span>{jsonInput.length} chars</span>
                      <span>•</span>
                      <span>{jsonInput.split('\n').length} lines</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file">
                  <FileUpload onFileContent={handleFileContent} />
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={validateAndParseJson} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="hidden sm:inline">Parsing...</span>
                      <span className="sm:hidden">Parsing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Parse & Analyze</span>
                      <span className="sm:hidden">Parse</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={formatJson} 
                  disabled={!parsedJson}
                  title="Format JSON with proper indentation"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Format</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={minifyJson} 
                  disabled={!parsedJson}
                  title="Minify JSON (remove whitespace)"
                >
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Minify</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={undo} 
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={redo} 
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={clearAll} title="Clear all data">
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
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
                        {Array.isArray(parsedJson) ? `${parsedJson.length} items` : 'Object'}
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
            <Card>
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
    </div>
  )
}
