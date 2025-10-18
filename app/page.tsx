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
import { CheckCircle, AlertCircle, FileText, Upload, Code, Table, Shield, Zap, Filter, Download, Search, BarChart3, Copy, RotateCcw, RotateCw, Check, TreePine, ExternalLink, Maximize, Minimize, Info, History, Clock, Trash2, BookOpen, RefreshCw, Settings, Github } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip } from "@/components/ui/tooltip"
import { useEnvironment } from '@/lib/use-environment'
import packageJson from '../package.json'
import { sampleDatasets, categories, type SampleDataset } from '@/data/samples'

interface FileHistoryItem {
  id: string
  name: string
  data: string
  timestamp: number
  size: number
}

export default function JsonExplorerApp() {
  const [jsonInput, setJsonInput] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const { isDocker, showPersonalBranding } = useEnvironment()
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [dataKey, setDataKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [viewMode, setViewMode] = useState<"table" | "tree">("table")
  const [transformedData, setTransformedData] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<SampleDataset | null>(null)
  const [isSampleData, setIsSampleData] = useState(false)
  const urlFetchClearAllRef = useRef<(() => void) | null>(null)

  // Check if JSON is flat (suitable for table view)
  const isFlatJson = useMemo(() => {
    const dataToCheck = transformedData || parsedJson
    if (!dataToCheck) return true
    
    // If it's an array of objects, check if each object is flat
    if (Array.isArray(dataToCheck)) {
      return dataToCheck.every(item => {
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
    if (typeof dataToCheck === "object" && dataToCheck !== null) {
      const values = Object.values(dataToCheck)
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
  }, [parsedJson, transformedData])

  // Handle data transformation from tree view
  const handleDataChange = (newData: any) => {
    setTransformedData(newData)
  }

  // Reset transformed data when new JSON is loaded
  useEffect(() => {
    setTransformedData(null)
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
    setTransformedData(null)
    setIsSampleData(false)
    setSelectedDataset(null)
    // Also clear URL fetch data
    if (urlFetchClearAllRef.current) {
      urlFetchClearAllRef.current()
    }
  }

  // Top corner icon functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const showInfo = () => {
    setShowInfoModal(true)
  }

  // File History functions
  const saveToFileHistory = (data: string, name: string = 'Untitled') => {
    if (!data.trim()) return
    
    const newItem: FileHistoryItem = {
      id: Date.now().toString(),
      name,
      data,
      timestamp: Date.now(),
      size: data.length
    }
    
    const updatedHistory = [newItem, ...fileHistory.filter(item => item.data !== data)].slice(0, 20)
    setFileHistory(updatedHistory)
    localStorage.setItem('jsonExplorerHistory', JSON.stringify(updatedHistory))
  }

  const loadFromFileHistory = (item: FileHistoryItem) => {
    setJsonInput(item.data)
    setDataKey(prev => prev + 1)
    setHistory([])
    setHistoryIndex(-1)
    setShowHistoryModal(false)
    
    // Scroll to top after loading
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const deleteFromHistory = (id: string) => {
    const updatedHistory = fileHistory.filter(item => item.id !== id)
    setFileHistory(updatedHistory)
    localStorage.setItem('jsonExplorerHistory', JSON.stringify(updatedHistory))
  }

  const clearAllHistory = () => {
    setFileHistory([])
    localStorage.removeItem('jsonExplorerHistory')
  }

  const showHistory = () => {
    setShowHistoryModal(true)
  }

  const showHelp = () => {
    setShowHelpModal(true)
  }

  /**
   * Load sample dataset dynamically
   * 
   * This function dynamically imports TypeScript data from the data/samples/ directory
   * and loads it into the JSON Explorer. Each dataset is stored as a separate
   * TypeScript file with metadata defined in data/samples/index.ts
   * 
   * To add a new sample dataset:
   * 1. Create a new TypeScript file in data/samples/ (e.g., my-dataset.ts)
   * 2. Export the data as: export default [array of objects]
   * 3. Add metadata to the sampleDatasets array in data/samples/index.ts
   * 4. The dataset will automatically appear in the sample selector modal
   */
  const loadSampleDataset = async (dataset: SampleDataset) => {
    try {
      setIsLoading(true)
      const module = await import(`@/data/samples/${dataset.fileName}`)
      const data = module.default || module
      setJsonInput(JSON.stringify(data, null, 2))
      setDataKey((prev) => prev + 1)
      setHistory([])
      setHistoryIndex(-1)
      setShowSampleModal(false)
      setIsSampleData(true)
      setSelectedDataset(dataset)
      
      // Auto-switch to table view for sample datasets if recommended
      if (dataset.recommendedView === 'table' || dataset.recommendedView === 'both') {
        setViewMode('table')
      }
      
      // Scroll to data section after a short delay to allow for rendering
      setTimeout(() => {
        const dataSection = document.getElementById('data-analysis-section')
        dataSection?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    } catch (error) {
      console.error('Failed to load sample dataset:', error)
      setError(`Failed to load ${dataset.name} dataset`)
    } finally {
      setIsLoading(false)
    }
  }

  const showSampleSelector = () => {
    setShowSampleModal(true)
  }

  const handleFileContent = (content: string) => {
    console.log("[json-explorer] File content received, length:", content.length)
    setJsonInput(content)
    setDataKey((prev) => prev + 1)
    setIsSampleData(false)
    setSelectedDataset(null)
  }

  // Auto-resize textarea when content changes
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated after content change
    const timeoutId = setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder="Paste your JSON data here..."]') as HTMLTextAreaElement
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.max(150, Math.min(textarea.scrollHeight, window.innerHeight * 0.4)) + 'px'
      }
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [jsonInput])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Load file history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('jsonExplorerHistory')
    if (savedHistory) {
      try {
        setFileHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to load file history:', error)
      }
    }
  }, [])

  // Save to file history when JSON is successfully parsed
  useEffect(() => {
    if (parsedJson && jsonInput.trim()) {
      const fileName = `JSON ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
      saveToFileHistory(jsonInput, fileName)
    }
  }, [parsedJson])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Corner Icon Bar */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 flex flex-col gap-1 sm:gap-2">
        <Tooltip content="App Information">
          <Button
            variant="outline"
            size="sm"
            onClick={showInfo}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-background/80 backdrop-blur-sm border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </Tooltip>
        
        <Tooltip content="Help & Documentation">
          <Button
            variant="outline"
            size="sm"
            onClick={showHelp}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-background/80 backdrop-blur-sm border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </Tooltip>
        
        <Tooltip content="Toggle Fullscreen">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-background/80 backdrop-blur-sm border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isFullscreen ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </Tooltip>
        
        <Tooltip content="File History">
          <Button
            variant="outline"
            size="sm"
            onClick={showHistory}
            className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-background/80 backdrop-blur-sm border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            {fileHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                {fileHistory.length}
              </span>
            )}
          </Button>
        </Tooltip>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl flex-1">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-3 text-balance flex items-center justify-center gap-1 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
            <span className="text-xl sm:text-4xl lg:text-5xl">JSON Explorer</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg lg:text-xl text-pretty mb-4 sm:mb-8 max-w-3xl mx-auto px-4">
            The simple way to explore and analyze JSON data
          </p>
          
          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4 sm:mb-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Table className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Table</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Tree</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>Export</span>
            </div>
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
                    JSON Data
                  </CardTitle>
                  <CardDescription className="text-base mt-1">Paste, upload, or fetch your JSON data</CardDescription>
                </div>
                <Button 
                  onClick={showSampleSelector} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 border-muted/50"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Load Sample</span>
                  <span className="sm:hidden">Sample</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl overflow-hidden">
                  <TabsTrigger
                    value="text"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50 text-xs sm:text-sm px-1 sm:px-3 py-2 truncate"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span className="hidden sm:inline">Paste JSON</span>
                    <span className="sm:hidden">Paste</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50 text-xs sm:text-sm px-1 sm:px-3 py-2 truncate"
                  >
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="hidden sm:inline">Upload File</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200 hover:bg-background/50 text-xs sm:text-sm px-1 sm:px-3 py-2 truncate"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    <span className="hidden sm:inline">Fetch URL</span>
                    <span className="sm:hidden">URL</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your JSON data here..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="font-mono text-xs sm:text-sm pr-16 sm:pr-20 border-2 border-muted/50 focus:border-primary/50 focus:ring-0 focus:outline-none transition-all duration-200 bg-background/50 resize-none scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:border-muted-foreground/30 p-4 sm:p-8"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.05)',
                        height: 'auto',
                        minHeight: '150px',
                        maxHeight: '40vh'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.max(150, Math.min(target.scrollHeight, window.innerHeight * 0.4)) + 'px';
                      }}
                    />
                    {/* Scroll to Data Icon */}
                    {jsonInput.length > 2000 && (
                      <button
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-blue-500/90 backdrop-blur-sm border border-blue-400/50 hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md"
                        onClick={(e) => {
                          const button = e.currentTarget
                          // Add click effect
                          button.style.transform = 'scale(0.9)'
                          setTimeout(() => {
                            if (button && button.parentNode) {
                              button.style.transform = 'scale(1)'
                            }
                          }, 150)
                          
                          const el = document.getElementById('data-analysis-section')
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        title="Scroll to Data Analysis"
                      >
                        <svg className="h-4 w-4 text-white animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Copy Button */}
                    {jsonInput.length > 0 && (
                      <button
                        className={`absolute top-3 right-12 z-20 w-8 h-8 backdrop-blur-sm border transition-all duration-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md ${
                          copied 
                            ? 'bg-green-500/90 border-green-400/50 hover:bg-green-600 hover:border-green-500' 
                            : 'bg-background/90 border-muted/50 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                        onClick={async (e) => {
                          const button = e.currentTarget
                          // Add click effect
                          button.style.transform = 'scale(0.9)'
                          setTimeout(() => {
                            if (button && button.parentNode) {
                              button.style.transform = 'scale(1)'
                            }
                          }, 150)
                          
                          try {
                            await navigator.clipboard.writeText(jsonInput)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          } catch (err) {
                            console.error('Failed to copy:', err)
                          }
                        }}
                        title={copied ? "Copied!" : "Copy JSON to clipboard"}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                    )}
                    
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-muted/30 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">{jsonInput.length} chars</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="font-medium">{jsonInput.split('\n').length} lines</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file">
                  <FileUpload onFileContent={handleFileContent} />
                </TabsContent>

                <TabsContent value="url">
                  <UrlFetch onUrlContent={handleFileContent} clearAllRef={urlFetchClearAllRef} />
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
                <Tooltip content="Parse and analyze JSON (Ctrl+Enter)">
                  <Button 
                    onClick={validateAndParseJson} 
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 border-0 col-span-2 sm:col-span-1 sm:w-auto"
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
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30 w-full sm:w-auto"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Format</span>
                    <span className="sm:hidden">Format</span>
                  </Button>
                </Tooltip>
                <Tooltip content="Minify JSON (remove whitespace)">
                  <Button 
                    variant="outline" 
                    onClick={minifyJson} 
                    disabled={!parsedJson}
                    title="Minify JSON (remove whitespace)"
                    className="hover:bg-muted/50 transition-all duration-200 border-muted/50 hover:border-muted-foreground/30 w-full sm:w-auto"
                  >
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Minify</span>
                    <span className="sm:hidden">Minify</span>
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
                      <BarChart3 className="h-5 w-5" />
                      Data Analysis
                      {isSampleData && selectedDataset && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                          <FileText className="h-3 w-3 mr-1" />
                          Sample: {selectedDataset.name}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Explore, filter, and export your data with powerful tools
                      {isSampleData && selectedDataset && (
                        <span className="block mt-1 text-sm text-blue-700">
                          💡 This is sample data. 
                          {selectedDataset.recommendedView === 'tree' 
                            ? ' Try the "Flatten" button to convert nested data to table view!' 
                            : ' Try sorting columns, filtering by values, and exploring the features!'
                          }
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {viewMode === "table" ? (
                    <JsonTableViewer key={dataKey} data={transformedData || parsedJson} showStatsOnly={true} />
                  ) : (
                    <JsonTreeViewer key={dataKey} data={transformedData || parsedJson} showStatsOnly={true} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "tree")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl mb-2 sm:mb-4 overflow-hidden">
                    <TabsTrigger 
                      value="table" 
                      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3 py-2 truncate"
                      disabled={!isFlatJson}
                    >
                      <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Table View</span>
                      <span className="sm:hidden">Table</span>
                      {!isFlatJson && (
                        <Badge variant="secondary" className="text-xs h-3 sm:h-4 px-1">
                          N/A
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="tree" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3 py-2 truncate">
                      <TreePine className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Tree View</span>
                      <span className="sm:hidden">Tree</span>
                      {!isFlatJson && (
                        <Badge variant="default" className="text-xs h-3 sm:h-4 px-1 bg-green-600">
                          Active
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  
                  <TabsContent value="table">
                    {isFlatJson ? (
                      <JsonTableViewer key={dataKey} data={transformedData || parsedJson} />
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
                    <JsonTreeViewer 
                      key={dataKey} 
                      data={transformedData || parsedJson} 
                      showDataPanel={true}
                      onDataChange={handleDataChange}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Enhanced Footer */}
      <footer className="bg-muted/30 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2025 JSON Explorer</span>
            </div>
            {!isDocker && (
              <div className="flex items-center gap-4">
                <a 
                  href="https://hub.docker.com/r/paulpuvi/json-explorer" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V8.463a.185.185 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v2.43c0 .102.083.185.185.185zM8.463 11.078h2.119a.186.186 0 00.186-.185V8.463a.185.185 0 00-.186-.186H8.463a.185.185 0 00-.185.186v2.43c0 .102.083.185.185.185zM8.463 15.537h2.119a.186.186 0 00.186-.185v-2.43a.185.185 0 00-.186-.185H8.463a.185.185 0 00-.185.185v2.43c0 .102.083.185.185.185zM13.983 15.537h2.119a.186.186 0 00.186-.185v-2.43a.185.185 0 00-.186-.185h-2.119a.185.185 0 00-.185.185v2.43c0 .102.083.185.185.185z"/>
                  </svg>
                  Run with Docker
                </a>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Sample Dataset Selector Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Choose Sample Dataset
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSampleModal(false)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Select a sample dataset to explore JSON Explorer's features. Each dataset demonstrates different capabilities and use cases.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sampleDatasets.map((dataset) => {
                    const category = categories.find(cat => cat.id === dataset.category)
                    return (
                      <div
                        key={dataset.id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => loadSampleDataset(dataset)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{dataset.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {dataset.name}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {dataset.recordCount} records
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {dataset.description}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {category?.icon} {category?.name}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="text-xs flex items-center gap-1 bg-white border-gray-200"
                              >
                                {dataset.recommendedView === 'both' ? (
                                  <>
                                    <Table className="h-3 w-3 text-blue-600" />
                                    <TreePine className="h-3 w-3 text-blue-600" />
                                  </>
                                ) : dataset.recommendedView === 'table' ? (
                                  <Table className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <TreePine className="h-3 w-3 text-blue-600" />
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Help & Documentation
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpModal(false)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-8">
                {/* Input Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Input Methods
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">Paste JSON</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Copy & paste JSON directly. Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Enter</kbd> to parse.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium">Upload File</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Drag & drop or browse for JSON files up to 10MB.</p>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium">Fetch URL</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Load JSON from any URL with auto-refresh support.</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    App Features
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-3">
                        <History className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">Data Management</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <History className="h-4 w-4 text-blue-500" />
                          <span><strong>File History</strong> - Saves recent JSON files locally</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Copy className="h-4 w-4 text-purple-500" />
                          <span><strong>Copy JSON</strong> - One-click clipboard copy</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                          <span><strong>Undo/Redo</strong> - Edit history support</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Maximize className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium">User Experience</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Maximize className="h-4 w-4 text-green-500" />
                          <span><strong>Fullscreen</strong> - Distraction-free viewing</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span><strong>Validation</strong> - Real-time JSON checking</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                          <span><strong>Auto-refresh</strong> - Live data updates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Modes */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Table className="h-5 w-5 text-primary" />
                    View Modes & Features
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Table className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium">Table View</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Perfect for arrays of objects with powerful analysis tools:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3 text-blue-500" />
                              <span>Sortable columns</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Filter className="h-3 w-3 text-green-500" />
                              <span>Search & filter</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings className="h-3 w-3 text-purple-500" />
                              <span>Column controls</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 text-orange-500" />
                              <span>Export CSV/Excel</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-3">
                        <TreePine className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium">Tree View</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Hierarchical visualization with editing capabilities:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <TreePine className="h-3 w-3 text-green-500" />
                              <span>Hierarchical data</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Copy className="h-3 w-3 text-purple-500" />
                              <span>Edit & copy values</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RotateCcw className="h-3 w-3 text-orange-500" />
                              <span>Transform data</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Any JSON structure</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nested JSON & Table View */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-primary" />
                    Working with Nested JSON
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-muted/20 border border-border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Table View Requirements</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Table view needs <strong>flat JSON arrays</strong> (root must be an array). For nested data, use Tree View to flatten or extract specific properties.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h5 className="font-medium text-blue-800 text-sm mb-1">✅ Works (Flat):</h5>
                          <pre className="text-xs bg-blue-100 p-2 rounded border overflow-x-auto text-blue-800">
{`[
  {
    "name": "web-app",
    "resourceGroup": "rg-prod",
    "location": "East US",
    "status": "Running"
  },
  {
    "name": "api-service",
    "resourceGroup": "rg-dev", 
    "location": "West US",
    "status": "Stopped"
  }
]`}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-800 text-sm mb-1">❌ Doesn't work (Nested):</h5>
                          <pre className="text-xs bg-red-100 p-2 rounded border overflow-x-auto text-red-800">
{`{
  "resources": [
    {
      "name": "web-app",
      "type": "Microsoft.Web/sites",
      "location": "East US",
      "properties": {
        "state": "Running",
        "hostNames": ["web-app.azurewebsites.net"]
      }
    }
  ]
}`}
                          </pre>
                          <p className="text-xs text-red-600 mt-1">
                            <em>Can be flattened using "Flatten" option in Tree View</em>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/20 border border-border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Handling Arrays & Multiple Properties</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Use <strong>Tree View</strong> to explore your JSON structure</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>For <strong>root objects with single array property</strong>: Convert to array using "Transform Data" → "Convert to Array"</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>For <strong>nested data</strong>: Use "Transform Data" → "Flatten" to create flat properties</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold">4.</span>
                          <span>For <strong>array properties</strong>: Click to extract values for specific properties</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold">5.</span>
                          <span><strong>Copy & paste</strong> extracted data into the text area to create flat JSON</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Quick Example
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-yellow-700 mb-3">
                            Common scenarios for enabling table view:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 text-center">
                              <div className="text-xs font-medium text-yellow-800">Root Object</div>
                              <div className="text-xs text-yellow-600">Convert to array first</div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 text-center">
                              <div className="text-xs font-medium text-yellow-800">Nested Arrays</div>
                              <div className="text-xs text-yellow-600">Extract properties</div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 text-center">
                              <div className="text-xs font-medium text-yellow-800">Mixed Data</div>
                              <div className="text-xs text-yellow-600">Transform step by step</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
                            <Code className="h-3 w-3 text-blue-600" />
                            Azure Web Apps Example:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-xs font-medium text-blue-800">Before (Root object with array property):</p>
                              </div>
                              <pre className="text-xs bg-blue-100 border border-blue-300 p-3 rounded-md overflow-x-auto text-blue-900 shadow-sm">
{`{
  "resources": [
    {
      "name": "web-app",
      "type": "Microsoft.Web/sites",
      "location": "East US",
      "properties": {
        "state": "Running",
        "hostNames": ["web-app.azurewebsites.net"]
      }
    }
  ]
}`}
                              </pre>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-xs font-medium text-blue-800">After (Convert to Array + Flatten):</p>
                              </div>
                              <pre className="text-xs bg-green-100 border border-green-300 p-3 rounded-md overflow-x-auto text-green-900 shadow-sm">
{`[
  {
    "name": "web-app",
    "type": "Microsoft.Web/sites",
    "location": "East US",
    "properties_state": "Running",
    "properties_hostNames": "web-app.azurewebsites.net"
  }
]`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Pro Tips
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• <strong>Large files:</strong> Use Tree view for better performance</li>
                      <li>• <strong>API data:</strong> Set auto-refresh for live updates</li>
                      <li>• <strong>Complex data:</strong> Flatten nested objects to enable table view</li>
                      <li>• <strong>Table analysis:</strong> Use grouping and filters to analyze data</li>
                      <li>• <strong>Export:</strong> Download filtered data in CSV/Excel format</li>
                      <li>• <strong>History:</strong> Check File History to reload recent files</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  File History
                </h2>
                <div className="flex items-center gap-2">
                  {fileHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllHistory}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistoryModal(false)}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              {fileHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No files in history</p>
                  <p className="text-sm">Parse some JSON to start building your history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fileHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{item.size.toLocaleString()} chars</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadFromFileHistory(item)}
                          className="text-xs"
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFromHistory(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  App Information
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfoModal(false)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4 text-sm">
                {/* Technology Stack */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Technology Stack
                    </h3>
                    <button
                      onClick={() => {
                        setShowInfoModal(false)
                        setShowHelpModal(true)
                      }}
                      className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                      title="View Documentation & Help"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>Next.js</strong> v15.5.4</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span><strong>React</strong> v19</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span><strong>Static Export</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span><strong>Docker Support</strong> (served via nginx)</span>
                    </div>
                  </div>
                </div>

                {/* Version & Credits */}
                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href="https://github.com/paulpuvi06/json-explorer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View Source Code on GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                      <span>Version {packageJson.version}</span>
                      {showPersonalBranding && (
                        <>
                          <span>•</span>
                          <span>
                            Ideated by{' '}
                            <a 
                              href="https://www.linkedin.com/in/paulpuvi/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                              Paul
                            </a>
                            , developed by leveraging AI ⚡⚡
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

