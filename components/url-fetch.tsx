"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface UrlFetchProps {
  onUrlContent: (content: string) => void
}

interface FetchStatus {
  status: "idle" | "loading" | "success" | "error"
  message?: string
}

export function UrlFetch({ onUrlContent }: UrlFetchProps) {
  const [url, setUrl] = useState("")
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ status: "idle" })

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
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
        headers: {
          "Accept": "application/json,application/javascript,text/plain,*/*",
        },
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
              onChange={(e) => setUrl(e.target.value)}
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
        <p className="font-medium mb-2">🛠️ Try this public API:</p>
        <div className="space-y-1 ml-4">
          <button
            onClick={() => setUrl("https://api.github.com/users/octocat")}
            className="block text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline transition-colors"
          >
            https://api.github.com/users/octocat
          </button>
        </div>
      </div>
    </div>
  )
}
