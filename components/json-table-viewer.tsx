"use client"

import React from "react"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileSpreadsheet,
  Filter,
  X,
  Plus,
  ExternalLink,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Expand,
  FileText,
  FileCode,
  Eye,
  Edit3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonTableViewerProps {
  data: any
  showStatsOnly?: boolean
}

interface FilterState {
  column: string
  value: string
  type: "contains" | "exact" | "select"
  searchOperator?: "contains" | "not_contains" | "matches" | "not_matches" | "equals" | "not_equals"
}

interface FilterLogic {
  operator: "AND" | "OR"
}

interface SortState {
  column: string
  direction: "asc" | "desc"
}

export function JsonTableViewer({ data, showStatsOnly = false }: JsonTableViewerProps) {
  const [groupBy, setGroupBy] = useState<string>("none")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState[]>([])
  const [filterLogic, setFilterLogic] = useState<FilterLogic>({ operator: "AND" })
  const [excludedFields, setExcludedFields] = useState<Set<string>>(new Set())
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())
  const [renamedColumns, setRenamedColumns] = useState<Record<string, string>>({})
  const [renameDialog, setRenameDialog] = useState<{ isOpen: boolean; column: string; newName: string }>({
    isOpen: false,
    column: '',
    newName: ''
  })
  
  // Simple toggle states for UI features
  const [enableGrouping, setEnableGrouping] = useState<boolean>(false)
  const [enableAdvancedFilters, setEnableAdvancedFilters] = useState<boolean>(false)
  const [showGroupingPanel, setShowGroupingPanel] = useState<boolean>(true)
  const [showFilteringPanel, setShowFilteringPanel] = useState<boolean>(true)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set())
  const [showColumnPanel, setShowColumnPanel] = useState<boolean>(false)
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set())
  const [columnsInitialized, setColumnsInitialized] = useState<boolean>(false)

  useEffect(() => {
    setGroupBy("none")
    setExpandedGroups({})
    // Don't reset filters - they should persist unless explicitly cleared
    setFilterLogic({ operator: "AND" })
    setCopied(null)
    setExcludedFields(new Set())
    setShowExportOptions(false)
    // Don't reset column order - preserve user's column arrangement
    setSortState(null)
    setExpandedColumns(new Set())
    // Reset toggle states to defaults
    setEnableGrouping(false)
    setEnableAdvancedFilters(false)
    setShowGroupingPanel(true)
    setShowFilteringPanel(true)
    // Only reset visible columns when data actually changes (not on column reorder)
    setVisibleColumns(new Set())
    setShowColumnPanel(false)
    setColumnsInitialized(false)
  }, [data])

  const tableData = useMemo(() => {
    if (!data) return []

    if (Array.isArray(data)) {
      return data.map((item, index) => ({ ...item, _index: index }))
    } else if (typeof data === "object") {
      const values = Object.values(data)
      const hasNestedObjects = values.some(
        (value) => typeof value === "object" && value !== null && !Array.isArray(value),
      )

      if (hasNestedObjects) {
        return Object.entries(data).map(([key, value], index) => {
          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            return { _key: key, ...value, _index: index }
          } else {
            return { _key: key, value: value, _index: index }
          }
        })
      } else {
        return [{ ...data, _index: 0 }]
      }
    }

    return []
  }, [data])

  const baseColumns = useMemo(() => {
    const allKeys = new Set<string>()
    tableData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "_index" && key !== "_key") allKeys.add(key)
      })
    })
    return Array.from(allKeys)
  }, [tableData])

  // Clear filters only when data structure changes (new columns added/removed)
  useEffect(() => {
    setFilters([])
  }, [baseColumns])

  const columns = useMemo(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(baseColumns)
      return baseColumns
    }
    const missingColumns = baseColumns.filter((col) => !columnOrder.includes(col))
    const validColumns = columnOrder.filter((col) => baseColumns.includes(col))
    return [...validColumns, ...missingColumns]
  }, [baseColumns, columnOrder])

  // Reset data when toggles are disabled
  useEffect(() => {
    if (!enableAdvancedFilters) {
      setFilters([])
      setFilterLogic({ operator: "AND" })
    }
  }, [enableAdvancedFilters])

  useEffect(() => {
    if (!enableGrouping) {
      setGroupBy("none")
      setExpandedGroups({})
    }
  }, [enableGrouping])

  // Initialize visible columns when data changes (only if not already set)
  useEffect(() => {
    if (data && columns.length > 0 && !columnsInitialized) {
      setVisibleColumns(new Set(columns))
      setColumnsInitialized(true)
    }
  }, [data, columns, columnsInitialized])

  const columnValues = useMemo(() => {
    const values: Record<string, Set<string>> = {}

    columns.forEach((col) => {
      values[col] = new Set()
      tableData.forEach((row) => {
        const cellValue = row[col]
        if (Array.isArray(cellValue)) {
          cellValue.forEach((item) => values[col].add(String(item)))
        } else if (cellValue !== null && cellValue !== undefined) {
          values[col].add(String(cellValue))
        }
      })
    })

    return Object.fromEntries(Object.entries(values).map(([col, valueSet]) => [col, Array.from(valueSet).sort()]))
  }, [tableData, columns])

  const filteredTableData = useMemo(() => {
    if (filters.length === 0) return tableData

    return tableData.filter((row) => {
      const filterResults = filters.map((filter) => {
        if (!filter.value.trim() || filter.value === "default") return true

        const cellValue = row[filter.column]
        const filterValue = filter.value.toLowerCase().trim()

        if (Array.isArray(cellValue)) {
          return cellValue.some((item) => String(item).toLowerCase().includes(filterValue))
        }

        if (typeof cellValue === "object" && cellValue !== null) {
          return JSON.stringify(cellValue).toLowerCase().includes(filterValue)
        }

        const cellString = String(cellValue || "").toLowerCase()

        if (filter.type === "contains") {
          // Handle contains/not contains matching
          const operator = filter.searchOperator || "contains"
          
          if (operator === "not_contains") {
            return !cellString.includes(filterValue)
          } else {
            return cellString.includes(filterValue)
          }
        } else if (filter.type === "select") {
          // Handle select matching - exact match for dropdown values
          const operator = filter.searchOperator || "equals"
          
          if (operator === "not_equals") {
            return cellString !== filterValue
          } else {
            return cellString === filterValue
          }
        } else if (filter.type === "exact") {
          // Handle exact matching
          const operator = filter.searchOperator || "equals"
          
          if (operator === "not_equals") {
            return cellString !== filterValue
          } else {
            return cellString === filterValue
          }
        } else {
          // Fallback to contains
          return cellString.includes(filterValue)
        }
      })

      // Apply AND/OR logic
      if (filterLogic.operator === "AND") {
        return filterResults.every(Boolean)
      } else {
        return filterResults.some(Boolean)
      }
    })
  }, [tableData, filters, filterLogic])

  const sortedTableData = useMemo(() => {
    if (!sortState) return filteredTableData

    return [...filteredTableData].sort((a, b) => {
      const aValue = a[sortState.column]
      const bValue = b[sortState.column]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortState.direction === "asc" ? 1 : -1
      if (bValue == null) return sortState.direction === "asc" ? -1 : 1

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        const aStr = aValue.join(", ")
        const bStr = bValue.join(", ")
        const result = aStr.localeCompare(bStr)
        return sortState.direction === "asc" ? result : -result
      }

      if (typeof aValue === "object" && typeof bValue === "object") {
        const aStr = JSON.stringify(aValue)
        const bStr = JSON.stringify(bValue)
        const result = aStr.localeCompare(bStr)
        return sortState.direction === "asc" ? result : -result
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortState.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      const result = aStr.localeCompare(bStr)
      return sortState.direction === "asc" ? result : -result
    })
  }, [filteredTableData, sortState])

  const groupedData = useMemo(() => {
    if (!enableGrouping || groupBy === "none" || !groupBy) {
      return { "All Items": sortedTableData }
    }

    const groups: Record<string, any[]> = {}
    sortedTableData.forEach((row) => {
      const groupValue = row[groupBy]
      const groupKey = Array.isArray(groupValue) ? groupValue.join(", ") : String(groupValue || "undefined")

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(row)
    })

    return groups
  }, [sortedTableData, groupBy, enableGrouping])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }))
  }

  const copyToClipboard = async (value: any, key: string) => {
    try {
      const textToCopy = Array.isArray(value) ? value.join(", ") : String(value)
      await navigator.clipboard.writeText(textToCopy)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const exportToCSV = () => {
    if (sortedTableData.length === 0) return

    const exportColumns = columns.filter((col) => !excludedFields.has(col) && (!showColumnPanel || visibleColumns.has(col)))
    const headers = exportColumns.join(",")
    const rows = sortedTableData.map((row) =>
      exportColumns
        .map((col) => {
          const value = row[col]
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`
          }
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ""
        })
        .join(","),
    )

    const csvContent = [headers, ...rows].join("\n")
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    downloadFile(csvContent, `json-data-${timestamp}.csv`, "text/csv")
  }

  const exportToTSV = () => {
    if (sortedTableData.length === 0) return

    const exportColumns = columns.filter((col) => !excludedFields.has(col) && (!showColumnPanel || visibleColumns.has(col)))
    const headers = exportColumns.join("\t")
    const rows = sortedTableData.map((row) =>
      exportColumns
        .map((col) => {
          const value = row[col]
          if (Array.isArray(value)) {
            return value.join("; ")
          }
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value)
          }
          return String(value || "")
        })
        .join("\t"),
    )

    const tsvContent = [headers, ...rows].join("\n")
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    downloadFile(tsvContent, `json-data-${timestamp}.tsv`, "text/tab-separated-values")
  }

  const exportToJSON = () => {
    const exportColumns = columns.filter((col) => !excludedFields.has(col) && (!showColumnPanel || visibleColumns.has(col)))
    const exportData = sortedTableData.map((row) => {
      const filteredRow: any = {}
      exportColumns.forEach((col) => {
        if (row[col] !== undefined) {
          filteredRow[col] = row[col]
        }
      })
      return filteredRow
    })
    const jsonContent = JSON.stringify(exportData, null, 2)
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)
    downloadFile(jsonContent, `json-data-${timestamp}.json`, "application/json")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isUrl = (text: string): boolean => {
    try {
      const url = new URL(text)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const getValueTypeColor = (value: any): string => {
    if (value === null || value === undefined) return "text-gray-400"
    if (typeof value === "string") return "text-green-600"
    if (typeof value === "number") return "text-blue-600"
    if (typeof value === "boolean") return "text-purple-600"
    if (Array.isArray(value)) return "text-orange-600"
    if (typeof value === "object") return "text-red-600"
    return "text-gray-600"
  }

  const handleSort = (column: string) => {
    setSortState((prev) => {
      if (!prev || prev.column !== column) {
        return { column, direction: "asc" }
      }
      if (prev.direction === "asc") {
        return { column, direction: "desc" }
      }
      return null
    })
  }

  const toggleColumnExpansion = (column: string) => {
    setExpandedColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  const openRenameDialog = (column: string) => {
    setRenameDialog({
      isOpen: true,
      column,
      newName: renamedColumns[column] || column
    })
  }

  const closeRenameDialog = () => {
    setRenameDialog({
      isOpen: false,
      column: '',
      newName: ''
    })
  }

  const handleRenameColumn = () => {
    if (renameDialog.newName.trim() && renameDialog.newName !== renameDialog.column) {
      setRenamedColumns(prev => ({
        ...prev,
        [renameDialog.column]: renameDialog.newName.trim()
      }))
    }
    closeRenameDialog()
  }

  const resetColumnName = (column: string) => {
    setRenamedColumns(prev => {
      const newRenamed = { ...prev }
      delete newRenamed[column]
      return newRenamed
    })
  }

  const getDisplayColumnName = (column: string) => {
    return renamedColumns[column] || column
  }

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  const togglePanelCollapse = (panelName: string) => {
    setCollapsedPanels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(panelName)) {
        newSet.delete(panelName)
      } else {
        newSet.add(panelName)
      }
      return newSet
    })
  }

  const renderCellValue = (value: any, rowIndex: number, colKey: string) => {
    const cellKey = `${rowIndex}-${colKey}`
    const colorClass = getValueTypeColor(value)

    if (Array.isArray(value)) {
      return (
        <div className="flex items-center gap-2 group">
          <div className="flex flex-wrap gap-1">
            {value.map((item, idx) => {
              const itemStr = String(item)
              return (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {isUrl(itemStr) ? (
                    <a
                      href={itemStr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {itemStr}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className={colorClass}>{itemStr}</span>
                  )}
                </Badge>
              )
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => copyToClipboard(value, cellKey)}
          >
            {copied === cellKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )
    }

    if (typeof value === "object" && value !== null) {
      const isArray = Array.isArray(value)
      const keys = Object.keys(value)
      const preview = isArray 
        ? `[${keys.length} items]` 
        : `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`
      
      return (
        <div className="flex items-center gap-2 group">
          <Badge variant="outline" className={cn("text-xs", colorClass)}>
            {isArray ? `${keys.length} items` : `${keys.length} properties`}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {preview}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => copyToClipboard(JSON.stringify(value, null, 2), cellKey)}
            title="Copy full object"
          >
            {copied === cellKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )
    }

    const valueStr = String(value)
    const isLink = isUrl(valueStr)

    return (
      <div className="flex items-center gap-2 group">
        <span className={cn("font-mono text-sm break-all", colorClass)}>
          {isLink ? (
            <a
              href={valueStr}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {typeof value === "string" ? `"${value}"` : valueStr}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : typeof value === "string" ? (
            `"${value}"`
          ) : (
            valueStr
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          onClick={() => copyToClipboard(value, cellKey)}
        >
          {copied === cellKey ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    )
  }

  const getUniqueValuesForColumn = (column: string): string[] => {
    const values = new Set<string>()
    tableData.forEach((row) => {
      const value = row[column]
      if (value !== null && value !== undefined) {
        values.add(String(value))
      }
    })
    return Array.from(values).sort()
  }

  const addFilter = () => {
    if (columns.length > 0) {
      setFilters((prev) => [...prev, { column: columns[0], value: "", type: "contains" }])
    }
  }

  const updateFilter = (index: number, field: keyof FilterState, value: string) => {
    setFilters((prev) => prev.map((filter, i) => (i === index ? { ...filter, [field]: value } : filter)))
  }

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAllFilters = () => {
    setFilters([])
    setFilterLogic({ operator: "AND" }) // Reset logic when clearing filters
  }

  const expandAll = () => {
    const allGroups = Object.keys(groupedData)
    const newExpandedState: Record<string, boolean> = {}
    allGroups.forEach((group) => {
      newExpandedState[group] = true
    })
    setExpandedGroups(newExpandedState)
  }

  const collapseAll = () => {
    const allGroups = Object.keys(groupedData)
    const newExpandedState: Record<string, boolean> = {}
    allGroups.forEach((group) => {
      newExpandedState[group] = false
    })
    setExpandedGroups(newExpandedState)
  }

  const handleDragStart = (e: React.DragEvent, column: string) => {
    setDraggedColumn(column)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", column)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumn) return

    const newOrder = [...columns]
    const draggedIndex = newOrder.indexOf(draggedColumn)
    const targetIndex = newOrder.indexOf(targetColumn)

    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedColumn)

    setColumnOrder(newOrder)
    setDraggedColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedColumn(null)
  }

  const toggleFieldExclusion = (column: string) => {
    setExcludedFields((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  if (sortedTableData.length === 0 && tableData.length === 0) {
    return showStatsOnly ? null : (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tabular data to display</p>
        <p className="text-sm">JSON data must be an array or object to show in table format</p>
      </div>
    )
  }

  // Stats only view for header
  if (showStatsOnly) {
    const hasFilters = enableAdvancedFilters && filters.length > 0
    const isFiltered = sortedTableData.length !== tableData.length
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs font-medium h-7 px-3 ${
            isFiltered 
              ? "bg-orange-50 text-orange-700 border-orange-200" 
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {sortedTableData.length} rows × {columns.length} columns
          {isFiltered && " (filtered)"}
        </Badge>
        {sortState && (
          <Badge variant="secondary" className="text-xs font-medium h-7 px-3">
            Sorted by {sortState.column} ({sortState.direction})
          </Badge>
        )}
        {hasFilters && (
          <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 h-7 px-3">
            {filters.length} filter{filters.length === 1 ? "" : "s"} ({filterLogic.operator})
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Bar */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-8">
          {/* Grouping Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Grouping</span>
            <button
              onClick={() => setEnableGrouping(!enableGrouping)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                enableGrouping ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  enableGrouping ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Filters</span>
            <button
              onClick={() => setEnableAdvancedFilters(!enableAdvancedFilters)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                enableAdvancedFilters ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  enableAdvancedFilters ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Column Visibility Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Columns</span>
            <button
              onClick={() => setShowColumnPanel(!showColumnPanel)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showColumnPanel ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                  showColumnPanel ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Enhanced Export */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="h-8 px-3 bg-background/90 backdrop-blur-sm border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Export</span>
              <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", showExportOptions && "rotate-180")} />
            </Button>
            
            {showExportOptions && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-1">
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportOptions(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted/50 rounded-md flex items-center gap-2 text-sm transition-colors duration-150"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="font-medium">CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToTSV()
                      setShowExportOptions(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted/50 rounded-md flex items-center gap-2 text-sm transition-colors duration-150"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">TSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON()
                      setShowExportOptions(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted/50 rounded-md flex items-center gap-2 text-sm transition-colors duration-150"
                  >
                    <FileCode className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">JSON</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grouping Controls */}
      {enableGrouping && (
        <div className="bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Grouping</span>
              {groupBy !== "none" && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-medium">
                  {Object.keys(groupedData).length} groups
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanelCollapse('grouping')}
              className="h-6 w-6 p-0"
            >
              {collapsedPanels.has('grouping') ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {!collapsedPanels.has('grouping') && (
            <div className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Group by:</span>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {getDisplayColumnName(col)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {groupBy !== "none" && Object.keys(groupedData).length > 1 && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={expandAll} className="h-6 px-2 text-xs">
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Expand All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={collapseAll} className="h-6 px-2 text-xs">
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Collapse All
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Filters */}
      {/* Filters Section */}
      {enableAdvancedFilters && (
        <div className="bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {filters.length > 0 && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  sortedTableData.length < tableData.length 
                    ? 'bg-orange-100 text-orange-800 border-orange-300' 
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {sortedTableData.length} of {tableData.length} entries
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {filters.length > 0 && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  sortedTableData.length < tableData.length 
                    ? 'bg-orange-100 text-orange-800 border-orange-300' 
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {filters.length}
                </div>
              )}
              {filters.length > 1 && (
                <div className="flex gap-1">
                  <Button
                    variant={filterLogic.operator === "AND" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterLogic({ operator: "AND" })}
                    className="h-6 px-2 text-xs"
                  >
                    AND
                  </Button>
                  <Button
                    variant={filterLogic.operator === "OR" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterLogic({ operator: "OR" })}
                    className="h-6 px-2 text-xs"
                  >
                    OR
                  </Button>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addFilter} 
                className="h-7 px-3 text-xs bg-gray-100 text-gray-800 border-gray-300"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add Filter
              </Button>
              
              {filters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs text-red-600 hover:text-red-700">
                  Clear All
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePanelCollapse('filters')}
                className="h-6 w-6 p-0"
              >
                {collapsedPanels.has('filters') ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {!collapsedPanels.has('filters') && (
            <div className="p-4">
              {/* Filter Items */}
              {filters.length > 0 && (
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/50">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>

                      <Select value={filter.column} onValueChange={(value) => updateFilter(index, "column", value)}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((col) => (
                            <SelectItem key={col} value={col}>
                              {getDisplayColumnName(col)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filter.type}
                        onValueChange={(value: "contains" | "exact" | "select") => updateFilter(index, "type", value)}
                      >
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Search</SelectItem>
                          <SelectItem value="exact">Exact</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex-1 flex gap-2">
                        {filter.type === "contains" ? (
                          <Select
                            value={filter.searchOperator || "contains"}
                            onValueChange={(value: "contains" | "not_contains") => updateFilter(index, "searchOperator", value)}
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="not_contains">Not Contains</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : filter.type === "exact" ? (
                          <Select
                            value={filter.searchOperator || "equals"}
                            onValueChange={(value: "equals" | "not_equals") => updateFilter(index, "searchOperator", value)}
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : filter.type === "select" ? (
                          <Select
                            value={filter.searchOperator || "equals"}
                            onValueChange={(value: "equals" | "not_equals") => updateFilter(index, "searchOperator", value)}
                          >
                            <SelectTrigger className="w-32 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : null}

                        {filter.type === "select" ? (
                          <Select
                            value={filter.value}
                            onValueChange={(value) => updateFilter(index, "value", value)}
                          >
                            <SelectTrigger className="flex-1 h-9">
                              <SelectValue placeholder="Select value..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getUniqueValuesForColumn(filter.column).map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <input
                            type="text"
                            value={filter.value}
                            onChange={(e) => updateFilter(index, "value", e.target.value)}
                            placeholder={
                              filter.type === "contains" ? "Search for text..." :
                              filter.type === "exact" ? "Enter exact value..." :
                              "Enter value..."
                            }
                            className="flex-1 h-9 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(index)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Column Management Panel */}
      {showColumnPanel && (
        <div className="bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Columns</span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-medium">
                {visibleColumns.size}/{columns.length} visible
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleColumns(new Set(columns))}
                className="h-7 px-3 text-xs bg-gray-100 text-gray-800 border-gray-300"
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleColumns(new Set())}
                className="h-7 px-3 text-xs bg-gray-100 text-gray-800 border-gray-300"
              >
                Hide All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePanelCollapse('columns')}
                className="h-6 w-6 p-0"
              >
                {collapsedPanels.has('columns') ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {!collapsedPanels.has('columns') && (
            <div className="p-4">
              <div className="mb-3 p-2 bg-muted/50 border border-border/50 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full flex items-center justify-center">
                    <span className="text-background text-xs font-bold">i</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Export Note:</span> Only selected columns will be included in exports (CSV, TSV, JSON).
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {columns.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`column-${col}`}
                      checked={!showColumnPanel || visibleColumns.has(col)}
                      onChange={() => toggleColumnVisibility(col)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`column-${col}`} className="text-sm cursor-pointer truncate">
                      {getDisplayColumnName(col)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results State - Show inside table area */}
      {enableAdvancedFilters && sortedTableData.length === 0 && tableData.length > 0 && (
        <div className="relative overflow-auto max-h-[600px]">
          <Table className="w-full">
            <TableBody className="bg-background">
              <TableRow>
                <TableCell colSpan={columns.filter(col => !showColumnPanel || visibleColumns.has(col)).length + (enableGrouping && groupBy !== "none" ? 1 : 0)} className="px-4 py-12">
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center">
                        <Filter className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">No results match your filters</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your filter criteria or switching to {filterLogic.operator === "AND" ? "OR" : "AND"} logic
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={clearAllFilters} 
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Data Table - Only show when there are results */}
      {sortedTableData.length > 0 && (
        <div className="space-y-3">
          {Object.entries(groupedData).map(([groupKey, groupRows]) => {
            const isExpanded = expandedGroups[groupKey] !== false
            const showGroupHeader = enableGrouping && groupBy !== "none" && Object.keys(groupedData).length > 1

            return (
              <div key={groupKey} className="border border-border rounded-lg overflow-hidden">
                {/* Group Header */}
                {showGroupHeader && (
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <span className="font-medium">{groupKey}</span>
                      <Badge variant="secondary" className="text-xs">
                        {groupRows.length} items
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Table */}
                {isExpanded && (
                  <div className={cn(
                    "relative overflow-auto",
                    enableGrouping && groupBy !== "none" ? "max-h-[400px]" : "max-h-[600px]"
                  )}>
                    <Table className="w-full">
                      <TableHeader className={cn(
                        "sticky top-0 bg-background border-b border-border z-20",
                        !enableGrouping || groupBy === "none" ? "shadow-sm" : ""
                      )}>
                        <TableRow>
                          {enableGrouping && groupBy !== "none" && (
                            <TableHead className="w-12 px-4 py-3">
                              <GripVertical className="h-3 w-3 text-muted-foreground" />
                            </TableHead>
                          )}
                          {columns.filter(col => !showColumnPanel || visibleColumns.has(col)).map((col) => (
                            <TableHead
                              key={col}
                              className={cn(
                                "px-4 py-3 font-medium cursor-pointer hover:bg-muted/50",
                                draggedColumn === col && "dragging opacity-50",
                                expandedColumns.has(col) ? "min-w-80 max-w-none" : "min-w-48 max-w-96"
                              )}
                              draggable
                              onDragStart={(e) => handleDragStart(e, col)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, col)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="truncate" title={col}>{getDisplayColumnName(col)}</span>
                                <div className="flex items-center gap-1 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openRenameDialog(col)
                                    }}
                                    title="Rename column"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleColumnExpansion(col)
                                    }}
                                    title={expandedColumns.has(col) ? "Collapse column" : "Expand column"}
                                  >
                                    <Expand className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSort(col)
                                    }}
                                  >
                                    {sortState?.column === col ? (
                                      sortState.direction === "asc" ? (
                                        <ArrowUp className="h-3 w-3" />
                                      ) : (
                                        <ArrowDown className="h-3 w-3" />
                                      )
                                    ) : (
                                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-background">
                        {groupRows.map((row, rowIndex) => (
                          <TableRow key={row._key ? `${row._key}-${row._index}` : row._index ?? rowIndex} className="hover:bg-muted/50">
                            {enableGrouping && groupBy !== "none" && (
                              <TableCell className="px-4 py-3 w-12">
                                <div className="w-1 h-4 bg-muted rounded-full"></div>
                              </TableCell>
                            )}
                            {columns.filter(col => !showColumnPanel || visibleColumns.has(col)).map((col) => (
                              <TableCell key={col} className={cn("px-4 py-3", expandedColumns.has(col) ? "max-w-none" : "max-w-96")}>
                                <div className={expandedColumns.has(col) ? "" : "truncate"}>
                                  {renderCellValue(row[col], rowIndex, col)}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Rename Column Dialog */}
      {renameDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Rename Column
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Original Name
                </label>
                <div className="mt-1 p-2 bg-muted rounded text-sm font-mono">
                  {renameDialog.column}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  New Name
                </label>
                <Input
                  value={renameDialog.newName}
                  onChange={(e) => setRenameDialog(prev => ({ ...prev, newName: e.target.value }))}
                  placeholder="Enter new column name"
                  className="mt-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameColumn()
                    } else if (e.key === 'Escape') {
                      closeRenameDialog()
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={closeRenameDialog}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetColumnName(renameDialog.column)}
                  disabled={!renamedColumns[renameDialog.column]}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleRenameColumn}
                  disabled={!renameDialog.newName.trim() || renameDialog.newName === renameDialog.column}
                >
                  Rename
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
