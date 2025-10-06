"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { ChevronRight, ChevronDown, Copy, Check, FileText, Folder, FolderOpen, Trash2, RotateCcw, RotateCw, Zap, Table, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface JsonTreeViewerProps {
  data: any
  showStatsOnly?: boolean
  showDataPanel?: boolean
  onDataChange?: (newData: any) => void
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

export function JsonTreeViewer({ data, showStatsOnly = false, showDataPanel = false, onDataChange }: JsonTreeViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const [transformationHistory, setTransformationHistory] = useState<any[]>([data])
  const [historyIndex, setHistoryIndex] = useState(0)
  const previousDataRef = useRef(data)
  const isInternalTransformationRef = useRef(false)

  // Get current data from history
  const currentData = transformationHistory[historyIndex]

  // Reset tree view state when data changes
  useEffect(() => {
    // Only reset history if data is actually different from previous data
    const dataChanged = data !== previousDataRef.current
    if (dataChanged) {
      // Check if this is an internal transformation (our own data change)
      if (isInternalTransformationRef.current) {
        // This is our own transformation, don't reset expansion state
        isInternalTransformationRef.current = false
        previousDataRef.current = data
        return
      }
      
      // This is a new source data, reset everything
      setExpandedNodes(new Set())
      setSelectedNode(null)
      setTransformationHistory([data])
      setHistoryIndex(0)
      previousDataRef.current = data
    }
  }, [data])


  // Clean up expansion state for nodes that no longer exist
  const cleanupExpansionState = useCallback((data: any, expandedNodes: Set<string>) => {
    const validPaths = new Set<string>()
    
    const collectValidPaths = (obj: any, path: string = "") => {
      if (obj === null || obj === undefined) {
        validPaths.add(path || "root")
        return
      }
      
      if (Array.isArray(obj)) {
        validPaths.add(path || "root")
        obj.forEach((item, index) => {
          const itemPath = path ? `${path}[${index}]` : `[${index}]`
          collectValidPaths(item, itemPath)
        })
      } else if (typeof obj === "object") {
        validPaths.add(path || "root")
        Object.entries(obj).forEach(([key, value]) => {
          const childPath = path ? `${path}.${key}` : key
          collectValidPaths(value, childPath)
        })
      } else {
        validPaths.add(path || "root")
      }
    }
    
    collectValidPaths(data)
    
    // Remove invalid expansion paths
    const cleanedExpandedNodes = new Set<string>()
    expandedNodes.forEach(path => {
      if (validPaths.has(path)) {
        cleanedExpandedNodes.add(path)
      }
    })
    
    return cleanedExpandedNodes
  }, [])

  const treeData = useMemo(() => {
    if (!currentData) return []
    
    // Clean up expansion state before building tree
    const cleanedExpandedNodes = cleanupExpansionState(currentData, expandedNodes)
    if (cleanedExpandedNodes.size !== expandedNodes.size) {
      setExpandedNodes(cleanedExpandedNodes)
    }
    
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
          const itemPath = path ? `${path}[${index}]` : `[${index}]`
          const childNodes = buildTree(item, itemPath, level + 1)
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

    return buildTree(currentData)
  }, [currentData, expandedNodes, cleanupExpansionState])

  const toggleNode = useCallback((path: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }, [])

  const expandAll = useCallback(() => {
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
  }, [treeData])

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [])

  const copyToClipboard = async (value: any, path: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopied(path)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const selectNode = useCallback((node: TreeNode) => {
    setSelectedNode(node)
  }, [])

  // Transformation functions
  const applyTransformation = (newData: any) => {
    const newHistory = transformationHistory.slice(0, historyIndex + 1)
    newHistory.push(newData)
    setTransformationHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // Mark this as an internal transformation to prevent expansion reset
    isInternalTransformationRef.current = true
    onDataChange?.(newData)
  }


  const removeNode = (path: string) => {
    if (!path || path === "root") return

    const newData = JSON.parse(JSON.stringify(currentData))
    
    // Helper function to navigate to parent and remove item
    const removeFromPath = (obj: any, pathStr: string) => {
      // Handle root-level array indices (e.g., "[0]", "[1]")
      if (pathStr.startsWith('[') && pathStr.endsWith(']')) {
        const index = parseInt(pathStr.slice(1, -1))
        if (Array.isArray(obj) && index >= 0 && index < obj.length) {
          obj.splice(index, 1)
        }
        return
      }
      
      // Handle array indices in path (e.g., "data[0]", "data[0].items[1]")
      const pathParts = pathStr.split('.')
      let current = obj
      
      // Navigate to parent of the item to remove
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        
        if (part.includes('[') && part.includes(']')) {
          // Handle array access like "data[0]"
          const [key, indexStr] = part.split('[')
          const index = parseInt(indexStr.replace(']', ''))
          current = current[key][index]
        } else {
          current = current[part]
        }
      }
      
      // Remove the final item
      const lastPart = pathParts[pathParts.length - 1]
      
      if (lastPart.includes('[') && lastPart.includes(']')) {
        // Remove array item
        const [key, indexStr] = lastPart.split('[')
        const index = parseInt(indexStr.replace(']', ''))
        if (current[key] && Array.isArray(current[key]) && index >= 0 && index < current[key].length) {
          current[key].splice(index, 1)
        }
      } else {
        // Remove object property
        delete current[lastPart]
      }
    }
    
    removeFromPath(newData, path)
    applyTransformation(newData)
  }

  const removeArrayItems = (arrayPath: string, indices: number[]) => {
    if (!arrayPath) return

    const newData = JSON.parse(JSON.stringify(currentData))
    
    // Navigate to the array
    const pathParts = arrayPath.split('.')
    let current = newData
    
    for (const part of pathParts) {
      if (part.includes('[') && part.includes(']')) {
        const [key, indexStr] = part.split('[')
        const index = parseInt(indexStr.replace(']', ''))
        current = current[key][index]
      } else {
        current = current[part]
      }
    }
    
    // Remove items in reverse order to maintain indices
    if (Array.isArray(current)) {
      indices.sort((a, b) => b - a).forEach(index => {
        if (index >= 0 && index < current.length) {
          current.splice(index, 1)
        }
      })
    }
    
    applyTransformation(newData)
  }

  const removeAllArrayItems = (arrayPath: string) => {
    if (!arrayPath) return

    const newData = JSON.parse(JSON.stringify(currentData))
    
    // Navigate to the array
    const pathParts = arrayPath.split('.')
    let current = newData
    
    for (const part of pathParts) {
      if (part.includes('[') && part.includes(']')) {
        const [key, indexStr] = part.split('[')
        const index = parseInt(indexStr.replace(']', ''))
        current = current[key][index]
      } else {
        current = current[part]
      }
    }
    
    // Clear the array
    if (Array.isArray(current)) {
      current.length = 0
    }
    
    applyTransformation(newData)
  }

  const flattenObject = (obj: any, prefix = '', result: any = {}) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            // For arrays, we can either:
            // 1. Keep them as arrays (current behavior)
            // 2. Flatten them into indexed properties
            // Let's flatten arrays into indexed properties for better table compatibility
            obj[key].forEach((item, index) => {
              if (typeof item === 'object' && item !== null) {
                flattenObject(item, `${newKey}[${index}]`, result)
              } else {
                result[`${newKey}[${index}]`] = item
              }
            })
          } else {
            // Recursively flatten nested objects
            flattenObject(obj[key], newKey, result)
          }
        } else {
          result[newKey] = obj[key]
        }
      }
    }
    return result
  }

  const flattenData = () => {
    if (Array.isArray(currentData)) {
      const flattened = currentData.map(item => 
        typeof item === 'object' && item !== null ? flattenObject(item) : item
      )
      applyTransformation(flattened)
    } else if (typeof currentData === 'object' && currentData !== null) {
      const flattened = flattenObject(currentData)
      applyTransformation(flattened)
    }
  }

  const convertArrayToObjects = () => {
    if (!Array.isArray(currentData)) return

    const converted = currentData.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return { ...item, _index: index }
      } else {
        return { value: item, _index: index }
      }
    })

    applyTransformation(converted)
  }

  const convertObjectToArray = () => {
    if (!currentData || typeof currentData !== 'object' || Array.isArray(currentData)) return

    const keys = Object.keys(currentData)
    
    // Check if object has exactly one property and it's an array
    if (keys.length === 1 && Array.isArray(currentData[keys[0]])) {
      applyTransformation(currentData[keys[0]])
    }
  }

  // Check if current data can be converted to array
  const canConvertToArray = useMemo(() => {
    if (!currentData || typeof currentData !== 'object' || Array.isArray(currentData)) return false
    
    const keys = Object.keys(currentData)
    return keys.length === 1 && Array.isArray(currentData[keys[0]])
  }, [currentData])


  // Check if current data is table-compatible
  const isTableCompatible = useMemo(() => {
    if (!currentData) return false
    
    if (Array.isArray(currentData)) {
      return currentData.every(item => {
        if (typeof item !== 'object' || item === null) return true
        
        return Object.values(item).every(value => {
          if (value === null || typeof value !== 'object') return true
          if (Array.isArray(value)) {
            return value.every(arrItem => 
              arrItem === null || typeof arrItem !== 'object'
            )
          }
          return false
        })
      })
    }
    
    // Check if object is flat (suitable for table view)
    if (typeof currentData === 'object' && currentData !== null) {
      return Object.values(currentData).every(value => {
        if (value === null || typeof value !== 'object') return true
        if (Array.isArray(value)) {
          return value.every(arrItem => 
            arrItem === null || typeof arrItem !== 'object'
          )
        }
        return false
      })
    }
    
    return false
  }, [currentData])

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

  const DataPanel = ({ node }: { node: TreeNode }) => {
    if (!node) return null

    const formatValue = (value: any, type: string) => {
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
        return `Array with ${value.length} items`
      }
      if (type === "object") {
        if (value === null || value === undefined) {
          return "null"
        }
        const keys = Object.keys(value)
        return `Object with ${keys.length} properties`
      }
      return String(value)
    }

    const getDetailedInfo = (value: any, type: string) => {
      if (type === "array") {
        return {
          length: value.length,
          items: value.slice(0, 5).map((item: any, index: number) => ({
            index,
            type: typeof item,
            value: item
          })),
          hasMore: value.length > 5
        }
      }
      if (type === "object") {
        if (value === null || value === undefined) {
          return {
            keyCount: 0,
            keys: [],
            hasMore: false
          }
        }
        const entries = Object.entries(value)
        return {
          keyCount: entries.length,
          keys: entries.slice(0, 10).map(([key, val]) => ({
            key,
            type: typeof val,
            value: val
          })),
          hasMore: entries.length > 10
        }
      }
      return null
    }

    const detailedInfo = getDetailedInfo(node.value, node.type)

    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border p-3 lg:p-4">
          <h3 className="font-semibold text-base lg:text-lg flex items-center gap-2">
            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="truncate">{node.key}</span>
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs font-medium h-6 px-2 w-fit", getTypeColor(node.type))}
            >
              {node.type}
            </Badge>
            <span className="text-xs lg:text-sm text-muted-foreground truncate">
              {node.path || "root"}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 lg:p-4">
          <div className="space-y-3 lg:space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Value</h4>
              <div className="bg-muted/50 rounded-lg p-2 lg:p-3 font-mono text-xs lg:text-sm break-all">
                {formatValue(node.value, node.type)}
              </div>
            </div>

            {detailedInfo && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {node.type === "array" ? "Array Details" : "Object Details"}
                </h4>
                <div className="space-y-2">
                  {node.type === "array" && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Length:</span> {detailedInfo.length}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">First {Math.min(5, detailedInfo.length)} items:</div>
                        <div className="space-y-1">
                          {detailedInfo.items.map((item: any) => (
                            <div key={item.index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs lg:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Badge variant="outline" className="text-xs h-4 lg:h-5 px-1 lg:px-1.5">
                                  {item.index}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs h-4 lg:h-5 px-1 lg:px-1.5", getTypeColor(item.type))}
                                >
                                  {item.type}
                                </Badge>
                              </div>
                              <span className="font-mono text-xs break-all sm:truncate">
                                {formatValue(item.value, item.type)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {detailedInfo.hasMore && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ... and {detailedInfo.length - 5} more items
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {node.type === "object" && (
                    <>
                      <div className="text-sm">
                        <span className="font-medium">Properties:</span> {detailedInfo?.keyCount || 0}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">First {Math.min(10, detailedInfo?.keyCount || 0)} properties:</div>
                        <div className="space-y-1">
                          {(detailedInfo?.keys || []).map((item: any) => (
                            <div key={item.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs lg:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="font-medium text-xs min-w-0 truncate">
                                  {item.key}:
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs h-4 lg:h-5 px-1 lg:px-1.5", getTypeColor(item.type))}
                                >
                                  {item.type}
                                </Badge>
                              </div>
                              <span className="font-mono text-xs break-all sm:truncate">
                                {formatValue(item.value, item.type)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {detailedInfo?.hasMore && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ... and {(detailedInfo?.keyCount || 0) - 10} more properties
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(node.value, node.path || "root")}
                  className="flex-1"
                >
                  {copied === (node.path || "root") ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Value
                    </>
                  )}
                </Button>
                {node.path && node.path !== "root" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeNode(node.path)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Property-Specific Transformations */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Property Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {node.type === "array" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={convertArrayToObjects}
                        className="text-xs"
                        title="Convert array items to objects with index"
                      >
                        <Table className="h-3 w-3 mr-1" />
                        To Objects
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const extracted = node.value.map((item: any, index: number) => 
                            typeof item === 'object' ? item : { value: item, index }
                          )
                          applyTransformation(extracted)
                        }}
                        className="text-xs"
                        title="Extract array values into objects"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Extract Values
                      </Button>
                    </>
                  )}
                  {node.type === "object" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const keys = Object.keys(node.value)
                          const array = keys.map(key => ({ key, value: node.value[key] }))
                          applyTransformation(array)
                        }}
                        className="text-xs"
                        title="Convert object to array of key-value pairs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        To Array
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const keys = Object.keys(node.value)
                          applyTransformation(keys)
                        }}
                        className="text-xs"
                        title="Extract only the keys from this object"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Extract Keys
                      </Button>
                    </>
                  )}
                  {node.type === "string" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(node.value)
                          applyTransformation(parsed)
                        } catch {
                          // If not valid JSON, wrap in object
                          applyTransformation({ value: node.value })
                        }
                      }}
                      className="text-xs col-span-2"
                      title="Parse string as JSON or wrap in object"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Parse JSON
                    </Button>
                  )}
                  {node.type === "number" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        applyTransformation({ value: node.value, type: "number" })
                      }}
                      className="text-xs col-span-2"
                      title="Wrap number in object with metadata"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Wrap Value
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTreeNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.path || "root")
    const isSelected = selectedNode?.path === node.path
    const indent = node.level * 20

    return (
      <div key={node.path || "root"} className="select-none">
        <div 
          className={cn(
            "flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded transition-colors group cursor-pointer",
            node.level > 0 && "ml-4",
            isSelected && "bg-primary/10 border border-primary/20"
          )}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => showDataPanel && selectNode(node)}
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
              {node.path && node.path.includes('[') && (
                <span className="text-xs text-muted-foreground ml-1">
                  {node.path.match(/\[(\d+)\]/g)?.join('')}
                </span>
              )}
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
          
          <div className="flex items-center gap-1">
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
            {node.path && node.path !== "root" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  removeNode(node.path)
                }}
                title="Remove item"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
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

  if (showDataPanel) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  JSON Tree View
                  {isTableCompatible && (
                    <Badge variant="default" className="text-xs h-5 px-2 bg-green-600">
                      <Table className="h-3 w-3 mr-1" />
                      Table Ready
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Navigate your JSON data in a hierarchical tree structure, optional transform for table and extract options
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Tree Controls - First */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="h-8 w-8 p-0"
                  title="Expand all tree nodes"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="h-8 w-8 p-0"
                  title="Collapse all tree nodes"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Separator */}
                <div className="w-px h-6 bg-border mx-1" />
                
                
                {/* Separator */}
                <div className="w-px h-6 bg-border mx-1" />
                
                {/* Global Transformation Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-md">
                    <span className="text-xs text-muted-foreground font-medium">Global Transform:</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={flattenData}
                    className="h-8 text-xs"
                    disabled={!currentData || (typeof currentData !== 'object')}
                    title="Flatten nested objects into single level"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Flatten</span>
                    <span className="sm:hidden">Flat</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={convertObjectToArray}
                    className="h-8 text-xs"
                    disabled={!canConvertToArray}
                    title="Convert object with single array property to root array"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Convert to Array</span>
                    <span className="sm:hidden">To Array</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={convertArrayToObjects}
                    className="h-8 text-xs"
                    disabled={!Array.isArray(currentData)}
                    title="Convert array items to objects with index"
                  >
                    <Table className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">To Objects</span>
                    <span className="sm:hidden">Objects</span>
                  </Button>
                </div>
                
                {/* Separator */}
                <div className="w-px h-6 bg-border mx-1" />
                
              </div>
            </div>
            
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 max-h-96 lg:max-h-none overflow-y-auto p-4 lg:border-r border-border">
            {treeData.map(node => renderTreeNode(node))}
          </div>
          <div className="flex-1 max-h-96 lg:max-h-none overflow-hidden border-t lg:border-t-0 border-border">
            {selectedNode ? (
              <DataPanel node={selectedNode} />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">Select a node</p>
                  <p className="text-sm text-muted-foreground">
                    Click on any node in the tree to view its detailed information here
                  </p>
                </div>
              </div>
            )}
          </div>
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
              Navigate your JSON data in a hierarchical tree structure, optional transform for table and extract options
            </p>
            {/* Helpful notes about transformation features */}
            <div className="mt-3 space-y-2">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Pro Tips:</strong> Use <strong>Global Transform</strong> for dataset-wide changes, or <strong>Property Actions</strong> for specific node transformations. <strong>Flatten</strong> converts nested objects to table-friendly format.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="h-8 text-xs"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Expand All</span>
              <span className="sm:hidden">Expand</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="h-8 text-xs"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Collapse All</span>
              <span className="sm:hidden">Collapse</span>
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
