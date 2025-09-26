"use client"

import React, { useState, useMemo } from "react"
import { ChevronRight, ChevronDown, Copy, Check, FileText, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface JsonTreeViewerProps {
  data: any
  showStatsOnly?: boolean
}

interface TreeNode {
  key: string
  value: any
  type: string
  path: string
  level: number
  isExpanded: boolean
  children?: TreeNode[]
}

export function JsonTreeViewer({ data, showStatsOnly = false }: JsonTreeViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const treeData = useMemo(() => {
    if (!data) return []
    
    const buildTree = (obj: any, path: string = "", level: number = 0): TreeNode[] => {
      if (obj === null || obj === undefined) {
        return [{
          key: path || "root",
          value: obj,
          type: "null",
          path,
          level,
          isExpanded: false
        }]
      }

      if (Array.isArray(obj)) {
        const children: TreeNode[] = []
        obj.forEach((item, index) => {
          const childNodes = buildTree(item, `${path}[${index}]`, level + 1)
          children.push(...childNodes)
        })
        
        return [{
          key: path || "root",
          value: obj,
          type: "array",
          path,
          level,
          isExpanded: expandedNodes.has(path || "root"),
          children
        }]
      }

      if (typeof obj === "object") {
        const children: TreeNode[] = []
        Object.entries(obj).forEach(([key, value]) => {
          const childNodes = buildTree(value, path ? `${path}.${key}` : key, level + 1)
          children.push(...childNodes)
        })

        return [{
          key: path || "root",
          value: obj,
          type: "object",
          path,
          level,
          isExpanded: expandedNodes.has(path || "root"),
          children
        }]
      }

      return [{
        key: path || "root",
        value: obj,
        type: typeof obj,
        path,
        level,
        isExpanded: false
      }]
    }

    return buildTree(data)
  }, [data, expandedNodes])

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allPaths = new Set<string>()
    const collectPaths = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allPaths.add(node.path || "root")
          collectPaths(node.children)
        }
      })
    }
    collectPaths(treeData)
    setExpandedNodes(allPaths)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const copyToClipboard = async (value: any, path: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopied(path)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getValuePreview = (value: any, type: string) => {
    if (type === "string") {
      return `"${value}"`
    }
    if (type === "number" || type === "boolean") {
      return String(value)
    }
    if (type === "null") {
      return "null"
    }
    if (type === "array") {
      return `[${value.length} items]`
    }
    if (type === "object") {
      const keys = Object.keys(value)
      return `{${keys.length} properties}`
    }
    return String(value)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "string": return "text-green-600 bg-green-50 border-green-200"
      case "number": return "text-blue-600 bg-blue-50 border-blue-200"
      case "boolean": return "text-purple-600 bg-purple-50 border-purple-200"
      case "null": return "text-gray-600 bg-gray-50 border-gray-200"
      case "array": return "text-orange-600 bg-orange-50 border-orange-200"
      case "object": return "text-indigo-600 bg-indigo-50 border-indigo-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const renderTreeNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.path || "root")
    const indent = node.level * 20

    return (
      <div key={node.path || "root"} className="select-none">
        <div 
          className={cn(
            "flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded transition-colors group",
            node.level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-background/50"
              onClick={() => toggleNode(node.path || "root")}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-5" />
          )}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <FileText className="h-4 w-4 text-gray-400" />
            )}
            
            <span className="font-medium text-sm truncate">
              {node.key}
            </span>
            
            <Badge 
              variant="outline" 
              className={cn("text-xs font-medium h-5 px-1.5", getTypeColor(node.type))}
            >
              {node.type}
            </Badge>
            
            <span className="text-sm text-muted-foreground truncate">
              {getValuePreview(node.value, node.type)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => copyToClipboard(node.value, node.path || "root")}
            title="Copy value"
          >
            {copied === (node.path || "root") ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children?.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    )
  }

  if (showStatsOnly) {
    const totalNodes = treeData.length
    const expandedCount = expandedNodes.size
    
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs font-medium h-7 px-3 bg-primary/10 text-primary border-primary/20">
          {totalNodes} {totalNodes === 1 ? "node" : "nodes"}
        </Badge>
        {expandedCount > 0 && (
          <Badge variant="outline" className="text-xs font-medium h-7 px-3 bg-blue-50 text-blue-700 border-blue-200">
            {expandedCount} expanded
          </Badge>
        )}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              JSON Tree View
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Navigate your JSON data in a hierarchical tree structure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="h-8"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="h-8"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto p-4">
          {treeData.map(node => renderTreeNode(node))}
        </div>
      </CardContent>
    </Card>
  )
}