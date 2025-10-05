"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle, CheckCircle, ExternalLink, Plus, X, Settings, Eye, EyeOff, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface UrlFetchProps {
  onUrlContent: (content: string) => void
  clearAllRef?: React.MutableRefObject<(() => void) | null>
}

interface FetchStatus {
  status: "idle" | "loading" | "success" | "error"
  message?: string
}

interface Header {
  key: string
  value: string
}

const COMMON_HEADERS = [
  { key: "Authorization", value: "", placeholder: "Bearer your-token or Basic username:password" },
  { key: "X-API-Key", value: "", placeholder: "your-api-key" },
  { key: "X-Auth-Token", value: "", placeholder: "your-auth-token" },
  { key: "Content-Type", value: "application/json", placeholder: "application/json" },
  { key: "Accept", value: "application/json", placeholder: "application/json" },
  { key: "User-Agent", value: "JSON-Explorer/1.0", placeholder: "MyApp/1.0" },
  { key: "X-Requested-With", value: "XMLHttpRequest", placeholder: "XMLHttpRequest" },
  { key: "X-CSRF-Token", value: "", placeholder: "your-csrf-token" },
  { key: "X-Client-Version", value: "1.0", placeholder: "1.0" },
  { key: "X-Forwarded-For", value: "", placeholder: "client-ip" },
  { key: "X-Real-IP", value: "", placeholder: "real-client-ip" },
  { key: "Cache-Control", value: "no-cache", placeholder: "no-cache" },
  { key: "Pragma", value: "no-cache", placeholder: "no-cache" },
  { key: "If-None-Match", value: "", placeholder: "etag-value" },
  { key: "If-Modified-Since", value: "", placeholder: "Wed, 21 Oct 2015 07:28:00 GMT" }
]

// API service configurations removed - now using direct links

export function UrlFetch({ onUrlContent, clearAllRef }: UrlFetchProps) {
  const [url, setUrl] = useState("")
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ status: "idle" })
  const [headers, setHeaders] = useState<Header[]>([])
  const [enableCustomHeaders, setEnableCustomHeaders] = useState(false)
  const [headerVisibility, setHeaderVisibility] = useState<Record<number, boolean>>({})

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const addHeader = useCallback(() => {
    setHeaders(prev => [...prev, { key: "", value: "" }])
  }, [])

  const addCommonHeader = useCallback((headerKey: string) => {
    const commonHeader = COMMON_HEADERS.find(h => h.key === headerKey)
    if (commonHeader) {
      setHeaders(prev => [...prev, { key: commonHeader.key, value: commonHeader.value }])
    }
  }, [])

  const clearAll = () => {
    setUrl("")
    setHeaders([])
    setFetchStatus({ status: "idle" })
    setHeaderVisibility({})
  }

  // Expose clearAll function to parent component
  useEffect(() => {
    if (clearAllRef) {
      clearAllRef.current = clearAll
    }
  }, [clearAllRef])

  const toggleHeaderVisibility = useCallback((index: number) => {
    setHeaderVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }, [])


  const removeHeader = useCallback((index: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateHeader = useCallback((index: number, field: "key" | "value", value: string) => {
    setHeaders(prevHeaders => {
      const newHeaders = [...prevHeaders]
      newHeaders[index] = { ...newHeaders[index], [field]: value }
      return newHeaders
    })
  }, [])

  const getValidHeaders = (): Record<string, string> => {
    const validHeaders: Record<string, string> = {
      "Accept": "application/json,application/javascript,text/plain,*/*",
    }
    
    headers.forEach(header => {
      if (header.key.trim() && header.value.trim()) {
        validHeaders[header.key.trim()] = header.value.trim()
      }
    })
    
    return validHeaders
  }

  const fetchJsonFromUrl = async () => {
    if (!(url.trim() && isValidUrl(url))) {
      setFetchStatus({ 
        status: "error", 
        message: "Please enter a valid HTTP or HTTPS URL" 
      })
      return
    }

    setFetchStatus({ status: "loading" })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: getValidHeaders(),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      try {
        JSON.parse(text)
        onUrlContent(text)
        setFetchStatus({ status: "success" })
      } catch (parseError) {
        throw new Error("Response is not valid JSON format")
      }

    } catch (error) {
      let errorMsg = "Failed to fetch JSON"
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMsg = "Request timed out (10 seconds)"
        } else if (error.message.includes("CORS")) {
          errorMsg = "CORS error: The server must allow cross-origin requests"
        } else {
          errorMsg = error.message
        }
      }
      setFetchStatus({ 
        status: "error", 
        message: errorMsg 
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      fetchJsonFromUrl()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          JSON URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="url"
              placeholder="https://api.github.com/users/octocat"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                // Clear status when URL changes
                if (fetchStatus.status !== "idle") {
                  setFetchStatus({ status: "idle" })
                }
              }}
              onKeyPress={handleKeyPress}
              className={cn(
                "font-mono text-sm",
                fetchStatus.status === "error" && "border-destructive"
              )}
              autoComplete="url"
            />
            {url && isValidUrl(url) && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                title="Open URL in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button 
            onClick={fetchJsonFromUrl}
            disabled={!url.trim() || fetchStatus.status === "loading"}
            className="flex items-center gap-2"
          >
            {fetchStatus.status === "loading" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="hidden sm:inline">Fetching...</span>
                <span className="sm:hidden">Fetch</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Fetch JSON</span>
                <span className="sm:hidden">Fetch</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Custom Headers Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Configure Headers</span>
        </div>
        <button
          onClick={() => setEnableCustomHeaders(!enableCustomHeaders)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            enableCustomHeaders ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              enableCustomHeaders ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Headers Section */}
      {enableCustomHeaders && (
        <div className="space-y-3">
          <Card className="border border-muted/50">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <List className="h-4 w-4 text-muted-foreground" />
                Request Headers
                {headers.length > 0 && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-medium">
                    {headers.filter(h => h.key.trim() && h.value.trim()).length}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {/* Add Header Section */}
              <div className="space-y-2">
                <div className="flex gap-3 items-center">
                  <Select onValueChange={addCommonHeader}>
                    <SelectTrigger className="flex-1 h-9 bg-background border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 px-3 py-2 text-sm shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Add common header..." />
                    </SelectTrigger>
                    <SelectContent className="min-w-[320px] max-h-[300px] overflow-y-auto">
                      {COMMON_HEADERS.map((header) => (
                        <SelectItem key={header.key} value={header.key} className="py-2 px-3">
                          <span className="font-medium text-sm">{header.key}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={addHeader}
                    className="w-9 h-9 bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md rounded-md flex items-center justify-center group"
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Headers List */}
              {headers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-lg font-bold text-gray-800">Active Headers</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                    <Badge variant="secondary" className="text-xs">
                      {headers.length} header{headers.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {headers.map((header, index) => {
                    const commonHeader = COMMON_HEADERS.find(h => h.key === header.key)
                    const isSensitive = header.key.toLowerCase().includes('password') || 
                                      header.key.toLowerCase().includes('secret') || 
                                      header.key.toLowerCase().includes('token') || 
                                      header.key.toLowerCase().includes('key') ||
                                      header.key.toLowerCase().includes('authorization')
                    const isVisible = headerVisibility[index] || false
                    return (
                      <form key={index} className="group relative bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`header-key-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">Header Name</label>
                              <Input
                                id={`header-key-${index}`}
                                name={`header-key-${index}`}
                                placeholder="Header name"
                                value={header.key}
                                onChange={(e) => updateHeader(index, "key", e.target.value)}
                                className="font-mono text-sm h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                autoComplete="off"
                              />
                            </div>
                            <div>
                              <label htmlFor={`header-value-${index}`} className="text-xs font-medium text-gray-600 mb-1 block">Value</label>
                              <div className="relative">
                                <Input
                                  id={`header-value-${index}`}
                                  name={`header-value-${index}`}
                                  placeholder={commonHeader?.placeholder || "Header value"}
                                  value={header.value}
                                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                                  className="font-mono text-sm pr-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                  type={isSensitive && !isVisible ? 'password' : 'text'}
                                  autoComplete={isSensitive ? "current-password" : "off"}
                                />
                                {isSensitive && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleHeaderVisibility(index)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                  >
                                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHeader(index)}
                            className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {commonHeader && (
                          <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
                            💡 <span className="font-medium">{commonHeader.key}:</span> {commonHeader.placeholder}
                          </div>
                        )}
                      </form>
                    )
                  })}
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      )}


      {fetchStatus.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchStatus.message}
          </AlertDescription>
        </Alert>
      )}

    </div>
  )
}
