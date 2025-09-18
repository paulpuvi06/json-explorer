"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonTableViewer } from "@/components/json-table-viewer"
import { FileUpload } from "@/components/file-upload"
import { CheckCircle, AlertCircle, FileText, Upload, Code, Table, Shield } from "lucide-react"

export default function JsonParserApp() {
  const [jsonInput, setJsonInput] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [dataKey, setDataKey] = useState(0)

  useEffect(() => {
    if (jsonInput.trim()) {
      validateAndParseJson()
    } else {
      setParsedJson(null)
      setError(null)
      setIsValid(null)
    }
  }, [jsonInput])

  const validateAndParseJson = () => {
    console.log("[json-parser] Parsing JSON, input length:", jsonInput.length)

    if (!jsonInput.trim()) {
      setError("Please enter some JSON data")
      setIsValid(false)
      setParsedJson(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      console.log("[json-parser] JSON parsed successfully, keys:", Object.keys(parsed))
      setParsedJson(parsed)
      setError(null)
      setIsValid(true)
      setDataKey((prev) => prev + 1)
    } catch (err) {
      console.log("[json-parser] JSON parse error:", err)
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setIsValid(false)
      setParsedJson(null)
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
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">JSON Configuration Parser</h1>
          <p className="text-muted-foreground text-lg text-pretty">
            Parse, filter, and analyze JSON configuration data with advanced table views
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>All data is processed locally in your browser - nothing is stored on our servers</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                JSON Input
              </CardTitle>
              <CardDescription>Paste your JSON configuration data or upload a file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    File Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Paste your JSON configuration data here..."
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>

                <TabsContent value="file">
                  <FileUpload onFileContent={handleFileContent} />
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Button onClick={validateAndParseJson} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Parse & Analyze
                </Button>
                <Button variant="outline" onClick={formatJson} disabled={!parsedJson}>
                  Format
                </Button>
                <Button variant="outline" onClick={minifyJson} disabled={!parsedJson}>
                  Minify
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              </div>

              {/* Status */}
              {isValid !== null && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid JSON
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Invalid JSON
                    </Badge>
                  )}
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

          {/* Table View Section */}
          {parsedJson && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Configuration Analysis
                </CardTitle>
                <CardDescription>
                  Analyze your configuration data with filtering, grouping, and export options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonTableViewer key={dataKey} data={parsedJson} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
