"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileText,
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
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonTableViewerProps {
  data: any
}

interface FilterState {
  column: string
  value: string
  type: "dropdown" | "search"
}

interface SortState {
  column: string
  direction: "asc" | "desc"
}

export function JsonTableViewer({ data }: JsonTableViewerProps) {
  const [groupBy, setGroupBy] = useState<string>("none")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState[]>([])
  const [excludedFields, setExcludedFields] = useState<Set<string>>(new Set())
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [columnOrder, setColumnOrder] = useState<string[]>([])
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set())

  useEffect(() => {
    setGroupBy("none")
    setExpandedGroups({})
    setFilters([])
    setCopied(null)
    setExcludedFields(new Set())
    setShowExportOptions(false)
    setColumnOrder([])
    setSortState(null)
    setExpandedColumns(new Set())
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

  const columns = useMemo(() => {
    if (columnOrder.length === 0) {
      setColumnOrder(baseColumns)
      return baseColumns
    }
    const missingColumns = baseColumns.filter((col) => !columnOrder.includes(col))
    const validColumns = columnOrder.filter((col) => baseColumns.includes(col))
    return [...validColumns, ...missingColumns]
  }, [baseColumns, columnOrder])

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
      return filters.every((filter) => {
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

        if (filter.type === "dropdown") {
          return cellString === filterValue
        } else {
          return cellString.includes(filterValue)
        }
      })
    })
  }, [tableData, filters])

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
    if (groupBy === "none" || !groupBy) {
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
  }, [sortedTableData, groupBy])

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

    const exportColumns = columns.filter((col) => !excludedFields.has(col))
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
    downloadFile(csvContent, "json-data.csv", "text/csv")
  }

  const exportToJSON = () => {
    const exportColumns = columns.filter((col) => !excludedFields.has(col))
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
    downloadFile(jsonContent, "json-data.json", "application/json")
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
      return (
        <div className="flex items-center gap-2 group">
          <Badge variant="outline" className={cn("text-xs", colorClass)}>
            {Object.keys(value).length} properties
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => copyToClipboard(JSON.stringify(value), cellKey)}
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

  const addFilter = () => {
    if (columns.length > 0) {
      setFilters((prev) => [...prev, { column: columns[0], value: "", type: "search" }])
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
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tabular data to display</p>
        <p className="text-sm">JSON data must be an array or object to show in table format</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Group by:</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select field to group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {groupBy !== "none" && Object.keys(groupedData).length > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll}>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand All
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll}>
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Collapse All
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {sortedTableData.length} of {tableData.length} {tableData.length === 1 ? "row" : "rows"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {columns.length} {columns.length === 1 ? "column" : "columns"}
                </Badge>
                {sortState && (
                  <Badge variant="secondary" className="text-xs">
                    Sorted by {sortState.column} ({sortState.direction})
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowExportOptions(!showExportOptions)}>
                Export Options
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToJSON}>
                <FileText className="h-4 w-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>

          {showExportOptions && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-3">Select fields to exclude from export:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {columns.map((col) => (
                  <div key={col} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exclude-${col}`}
                      checked={excludedFields.has(col)}
                      onCheckedChange={() => toggleFieldExclusion(col)}
                    />
                    <label htmlFor={`exclude-${col}`} className="text-sm font-medium">
                      {col}
                    </label>
                  </div>
                ))}
              </div>
              {excludedFields.size > 0 && (
                <div className="mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {excludedFields.size} field{excludedFields.size === 1 ? "" : "s"} excluded
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.length} active
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
              {filters.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {filters.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Select value={filter.column} onValueChange={(value) => updateFilter(index, "column", value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.type}
                    onValueChange={(value: "dropdown" | "search") => updateFilter(index, "type", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="dropdown">Select</SelectItem>
                    </SelectContent>
                  </Select>

                  {filter.type === "dropdown" ? (
                    <Select value={filter.value} onValueChange={(value) => updateFilter(index, "value", value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select value..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">All values</SelectItem>
                        {columnValues[filter.column]?.slice(0, 50).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                        {columnValues[filter.column]?.length > 50 && (
                          <SelectItem value="more" disabled>
                            ... and {columnValues[filter.column].length - 50} more
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      placeholder="Type to search..."
                      className="flex-1 h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}

                  <Button variant="outline" size="sm" onClick={() => removeFilter(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {sortedTableData.length === 0 && tableData.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No results match your filters</p>
          <p className="text-sm">Try adjusting your filter criteria</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(groupedData).map(([groupKey, groupRows]) => {
          const isExpanded = expandedGroups[groupKey] !== false
          const showGroupHeader = groupBy !== "none"

          return (
            <Card key={groupKey}>
              {showGroupHeader && (
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleGroup(groupKey)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <span>{groupKey}</span>
                    <Badge variant="secondary" className="text-xs">
                      {groupRows.length} {groupRows.length === 1 ? "item" : "items"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              )}

              {isExpanded && (
                <CardContent className={showGroupHeader ? "pt-0" : ""}>
                  <div className="rounded-lg border overflow-auto max-h-96 custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((col) => (
                            <TableHead
                              key={col}
                              className={cn(
                                "font-medium draggable-header cursor-pointer select-none",
                                draggedColumn === col && "dragging",
                                expandedColumns.has(col) ? "min-w-80 max-w-none" : "min-w-32 max-w-48",
                              )}
                              draggable
                              onDragStart={(e) => handleDragStart(e, col)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, col)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">{col}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
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
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSort(col)
                                    }}
                                    title="Sort column"
                                  >
                                    {sortState?.column === col ? (
                                      sortState.direction === "asc" ? (
                                        <ArrowUp className="h-3 w-3" />
                                      ) : (
                                        <ArrowDown className="h-3 w-3" />
                                      )
                                    ) : (
                                      <ArrowUpDown className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupRows.map((row, rowIndex) => (
                          <TableRow key={row._index || rowIndex} className="table-row-hover">
                            {columns.map((col) => (
                              <TableCell
                                key={col}
                                className={cn("py-3", expandedColumns.has(col) ? "max-w-none" : "max-w-48")}
                              >
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
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
