"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface JsonViewerProps {
  data: any
  level?: number
  path?: string
}

export function JsonViewer({ data, level = 0, path = "root" }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const copyToClipboard = async (value: any, key: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getValueType = (value: any): string => {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"
    return typeof value
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400"
      case "number":
        return "text-blue-600 dark:text-blue-400"
      case "boolean":
        return "text-purple-600 dark:text-purple-400"
      case "null":
        return "text-gray-500"
      case "array":
        return "text-orange-600 dark:text-orange-400"
      case "object":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-foreground"
    }
  }

  const renderValue = (value: any, key: string, currentPath: string) => {
    const type = getValueType(value)
    const isCollapsible = type === "object" || type === "array"
    const isCollapsed = collapsed[currentPath]
    const indent = level * 20

    if (isCollapsible) {
      const itemCount = Array.isArray(value) ? value.length : Object.keys(value).length

      return (
        <div key={currentPath} style={{ marginLeft: `${indent}px` }}>
          <div className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2 -mx-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleCollapse(currentPath)}>
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            <span className="font-medium text-foreground">{key}:</span>

            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>

            <span className="text-muted-foreground text-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100"
              onClick={() => copyToClipboard(value, currentPath)}
            >
              {copied === currentPath ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {!isCollapsed && (
            <div className="mt-1">
              {Array.isArray(value)
                ? value.map((item, index) => renderValue(item, `[${index}]`, `${currentPath}.${index}`))
                : Object.entries(value).map(([objKey, objValue]) =>
                    renderValue(objValue, objKey, `${currentPath}.${objKey}`),
                  )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={currentPath}
        className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2 -mx-2 group"
        style={{ marginLeft: `${indent + 32}px` }}
      >
        <span className="font-medium text-foreground min-w-0 flex-shrink-0">{key}:</span>

        <Badge variant="outline" className="text-xs flex-shrink-0">
          {type}
        </Badge>

        <span className={cn("font-mono text-sm break-all", getTypeColor(type))}>
          {type === "string" ? `"${value}"` : String(value)}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 flex-shrink-0"
          onClick={() => copyToClipboard(value, currentPath)}
        >
          {copied === currentPath ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-[500px] overflow-auto">
      {Array.isArray(data)
        ? data.map((item, index) => renderValue(item, `[${index}]`, `${path}.${index}`))
        : typeof data === "object" && data !== null
          ? Object.entries(data).map(([key, value]) => renderValue(value, key, `${path}.${key}`))
          : renderValue(data, "value", `${path}.value`)}
    </div>
  )
}
