"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, AlertCircle, CheckCircle, ExternalLink, Plus, X, Settings, Eye, EyeOff } from "lucide-react"
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

const API_SERVICES = [
  {
    id: "github",
    name: "GitHub REST API",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_GITHUB_TOKEN" },
      { key: "Accept", value: "application/vnd.github.v3+json" },
      { key: "User-Agent", value: "JSON-Explorer/1.0" }
    ],
    description: "GitHub API with personal access token"
  },
  {
    id: "azure-devops",
    name: "Azure DevOps",
    headers: [
      { key: "Authorization", value: "Basic YOUR_AZURE_TOKEN" },
      { key: "Content-Type", value: "application/json" },
      { key: "Accept", value: "application/json" }
    ],
    description: "Azure DevOps REST API"
  },
  {
    id: "stripe",
    name: "Stripe API",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_STRIPE_SECRET_KEY" },
      { key: "Accept", value: "application/json" }
    ],
    description: "Stripe payment API"
  },
  {
    id: "openai",
    name: "OpenAI API",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_OPENAI_API_KEY" },
      { key: "Content-Type", value: "application/json" }
    ],
    description: "OpenAI API for AI models"
  }
]

export function UrlFetch({ onUrlContent, clearAllRef }: UrlFetchProps) {
  const [url, setUrl] = useState("")
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ status: "idle" })
  const [headers, setHeaders] = useState<Header[]>([])
  const [enableCustomHeaders, setEnableCustomHeaders] = useState(false)
  const [selectedService, setSelectedService] = useState<string>("none")
  const [headerVisibility, setHeaderVisibility] = useState<Record<number, boolean>>({})

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const addCommonHeader = (headerKey: string) => {
    const commonHeader = COMMON_HEADERS.find(h => h.key === headerKey)
    if (commonHeader) {
      setHeaders([...headers, { key: commonHeader.key, value: commonHeader.value }])
    }
  }

  const clearAll = () => {
    setUrl("")
    setHeaders([])
    setFetchStatus({ status: "idle" })
    setSelectedService("none")
    setHeaderVisibility({})
  }

  // Expose clearAll function to parent component
  useEffect(() => {
    if (clearAllRef) {
      clearAllRef.current = clearAll
    }
  }, [clearAllRef])

  const toggleHeaderVisibility = (index: number) => {
    setHeaderVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const selectService = (serviceId: string) => {
    setSelectedService(serviceId)
    
    // Update headers based on selected service
    if (serviceId && serviceId !== "none") {
      const service = API_SERVICES.find(s => s.id === serviceId)
      if (service) {
        setHeaders(service.headers)
      }
    } else {
      setHeaders([])
    }
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

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
        setFetchStatus({ 
          status: "success", 
          message: `Successfully loaded ${text.length} characters from URL` 
        })
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
              placeholder="https://api.example.com/data.json"
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
                fetchStatus.status === "error" && "border-destructive",
                fetchStatus.status === "success" && "border-green-500"
              )}
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
          <span className="text-sm font-medium">Custom Headers</span>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Request Headers
                {headers.length > 0 && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-medium">
                    {headers.filter(h => h.key.trim() && h.value.trim()).length}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* API Service Dropdown */}
              <div className="space-y-3">
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  API Service
                </div>
                <Select onValueChange={selectService} value={selectedService}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 px-4 py-3 text-sm shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select an API service..." />
                  </SelectTrigger>
                  <SelectContent className="min-w-[320px]">
                    <SelectItem value="none" className="py-3 px-4">
                      <span className="font-medium">None</span>
                    </SelectItem>
                    {API_SERVICES.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="py-3 px-4">
                        <span className="font-medium text-sm">{service.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Add Header Section */}
              <div className="space-y-3">
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Add Header
                </div>
                <div className="flex gap-3">
                  <Select onValueChange={addCommonHeader}>
                    <SelectTrigger className="flex-1 h-12 bg-background border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 px-4 py-3 text-sm shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select common header..." />
                    </SelectTrigger>
                    <SelectContent className="min-w-[320px]">
                      {COMMON_HEADERS.map((header) => (
                        <SelectItem key={header.key} value={header.key} className="py-3 px-4">
                          <span className="font-medium text-sm">{header.key}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={addHeader}
                    className="w-9 h-9 bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md rounded-md flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Headers List */}
              {headers.length > 0 && (
                <div className="space-y-3">
                  <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Active Headers
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
                      <div key={index} className="flex gap-3 items-center p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => updateHeader(index, "key", e.target.value)}
                          className="font-mono text-sm w-40 flex-shrink-0 h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <div className="relative flex-1">
                          <Input
                            placeholder={commonHeader?.placeholder || "Header value"}
                            value={header.value}
                            onChange={(e) => updateHeader(index, "value", e.target.value)}
                            className="font-mono text-sm pr-8 h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            type={isSensitive && !isVisible ? 'password' : 'text'}
                          />
                          {isSensitive && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHeaderVisibility(index)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            >
                              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(index)}
                          className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0 rounded"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              
            </CardContent>
          </Card>
        </div>
      )}

      {fetchStatus.status === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {fetchStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {fetchStatus.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-3">🛠️ Try Public APIs:</p>
        <div className="space-y-2 ml-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setUrl("https://api.github.com/users/octocat")
                setFetchStatus({ status: "idle" })
              }}
              className="block text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline transition-colors text-xs"
            >
              GitHub Public User: https://api.github.com/users/octocat
            </button>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => {
                setUrl("https://jsonplaceholder.typicode.com/posts")
                setFetchStatus({ status: "idle" })
              }}
              className="block text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline transition-colors text-xs"
            >
              JSONPlaceholder: https://jsonplaceholder.typicode.com/posts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
