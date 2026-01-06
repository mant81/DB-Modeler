"use client"

import type React from "react"

import { DiagramCanvas } from "@/components/diagram-canvas"
import { Toolbar } from "@/components/toolbar"
import { Sidebar } from "@/components/sidebar"
import { CodePanel } from "@/components/code-panel"
import { useState, useEffect } from "react"

export type Column = {
  id: string
  name: string
  type: string
  isPrimary?: boolean
  isForeign?: boolean
  isUnique?: boolean
  isNullable?: boolean
  comment?: string
  foreignKey?: {
    tableId: string
    columnId: string
  }
}

export type Table = {
  id: string
  name: string
  x: number
  y: number
  columns: Column[]
  comment?: string
}

export type Relationship = {
  id: string
  from: string
  to: string
  fromColumn: string
  toColumn: string
  type: "one-to-one" | "one-to-many" | "many-to-many"
}

const STORAGE_KEY = "db-modeler-data"

export default function DBModelerPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTables(data.tables || [])
        setRelationships(data.relationships || [])
      } catch (error) {
        console.error("Failed to load saved data:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (tables.length > 0 || relationships.length > 0) {
      const data = { tables, relationships }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [tables, relationships])

  const handleExport = () => {
    const data = { tables, relationships }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `db-schema-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportSVG = () => {
    if (tables.length === 0) {
      alert("No tables to export")
      return
    }

    const minX = Math.min(...tables.map((t) => t.x)) - 50
    const minY = Math.min(...tables.map((t) => t.y)) - 50
    const maxX = Math.max(...tables.map((t) => t.x + 288)) + 50
    const maxY = Math.max(...tables.map((t) => t.y + 60 + t.columns.length * 36)) + 50
    const width = maxX - minX
    const height = maxY - minY

    const fkRelationships = tables.flatMap((table) =>
      table.columns
        .filter((col) => col.isForeign && col.foreignKey?.tableId && col.foreignKey?.columnId)
        .map((col) => ({
          fromTable: table,
          fromColumn: col,
          toTable: tables.find((t) => t.id === col.foreignKey!.tableId)!,
          toColumn: tables
            .find((t) => t.id === col.foreignKey!.tableId)
            ?.columns.find((c) => c.id === col.foreignKey!.columnId)!,
        }))
        .filter((rel) => rel.toTable && rel.toColumn),
    )

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">
      <defs>
        <style>
          .table-bg { fill: #1e293b; stroke: #334155; stroke-width: 1; }
          .table-header { fill: #0f172a; }
          .table-text { fill: #f1f5f9; font-family: monospace; font-size: 14px; }
          .table-title { fill: #60a5fa; font-weight: 600; }
          .column-text { fill: #cbd5e1; font-size: 12px; }
          .type-text { fill: #94a3b8; font-size: 11px; }
          .pk-badge { fill: #fbbf24; }
          .fk-badge { fill: #3b82f6; }
          .connection-line { stroke: #3b82f6; stroke-width: 2; fill: none; }
          .label-bg { fill: #1e293b; stroke: #3b82f6; stroke-width: 1; opacity: 0.95; }
          .label-text { fill: #60a5fa; font-size: 11px; font-family: monospace; font-weight: 600; }
        </style>
      </defs>
      <rect width="${width}" height="${height}" x="${minX}" y="${minY}" fill="#020617"/>\n`

    tables.forEach((table) => {
      const tableHeight = 60 + table.columns.length * 36
      svgContent += `
      <g>
        <rect class="table-bg" x="${table.x}" y="${table.y}" width="288" height="${tableHeight}" rx="8"/>
        <rect class="table-header" x="${table.x}" y="${table.y}" width="288" height="40" rx="8"/>
        <text class="table-text table-title" x="${table.x + 12}" y="${table.y + 25}">${table.name}</text>\n`

      table.columns.forEach((col, idx) => {
        const colY = table.y + 60 + idx * 36
        svgContent += `
        <text class="column-text" x="${table.x + 12}" y="${colY}">${col.name}</text>
        <text class="type-text" x="${table.x + 150}" y="${colY}">${col.type}</text>`

        if (col.isPrimary) {
          svgContent += `
        <rect class="pk-badge" x="${table.x + 260}" y="${colY - 12}" width="20" height="16" rx="3"/>
        <text style="fill: #0f172a; font-size: 10px; font-weight: 600;" x="${table.x + 270}" y="${colY}" textAnchor="middle">PK</text>`
        }
        if (col.isForeign) {
          svgContent += `
        <rect class="fk-badge" x="${table.x + 260}" y="${colY - 12}" width="20" height="16" rx="3"/>
        <text style="fill: #fff; font-size: 10px; font-weight: 600;" x="${table.x + 270}" y="${colY}" textAnchor="middle">FK</text>`
        }
      })

      svgContent += `
      </g>\n`
    })

    fkRelationships.forEach((rel) => {
      const fromTableHeight = 60 + rel.fromTable.columns.length * 36
      const toTableHeight = 60 + rel.toTable.columns.length * 36
      const tableWidth = 288

      const fromCenterX = rel.fromTable.x + tableWidth / 2
      const fromCenterY = rel.fromTable.y + fromTableHeight / 2
      const toCenterX = rel.toTable.x + tableWidth / 2
      const toCenterY = rel.toTable.y + toTableHeight / 2

      const dx = toCenterX - fromCenterX
      const dy = toCenterY - fromCenterY

      let fromX, fromY, toX, toY, fromSide

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          fromX = rel.fromTable.x + tableWidth
          fromY = fromCenterY
          fromSide = "right"
          toX = rel.toTable.x
          toY = toCenterY
        } else {
          fromX = rel.fromTable.x
          fromY = fromCenterY
          fromSide = "left"
          toX = rel.toTable.x + tableWidth
          toY = toCenterY
        }
      } else {
        if (dy > 0) {
          fromX = fromCenterX
          fromY = rel.fromTable.y + fromTableHeight
          fromSide = "bottom"
          toX = toCenterX
          toY = rel.toTable.y
        } else {
          fromX = fromCenterX
          fromY = rel.fromTable.y
          fromSide = "top"
          toX = toCenterX
          toY = rel.toTable.y + toTableHeight
        }
      }

      let path
      if (fromSide === "right" || fromSide === "left") {
        const midX = (fromX + toX) / 2
        path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`
      } else {
        const midY = (fromY + toY) / 2
        path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`
      }

      const crowLength = 12
      const crowAngle = Math.PI / 6
      const angle = Math.atan2(toY - fromY, toX - fromX)

      const cx1x = fromX - Math.cos(angle - crowAngle) * crowLength
      const cx1y = fromY - Math.sin(angle - crowAngle) * crowLength
      const cx2x = fromX - Math.cos(angle + crowAngle) * crowLength
      const cx2y = fromY - Math.sin(angle + crowAngle) * crowLength
      const cx3x = fromX - Math.cos(angle) * crowLength
      const cx3y = fromY - Math.sin(angle) * crowLength

      const perpAngle = angle + Math.PI / 2
      const perpLength = 6
      const p1x = toX + Math.cos(perpAngle) * perpLength
      const p1y = toY + Math.sin(perpAngle) * perpLength
      const p2x = toX - Math.cos(perpAngle) * perpLength
      const p2y = toY - Math.sin(perpAngle) * perpLength

      svgContent += `
      <path class="connection-line" d="${path}"/>
      <line class="connection-line" x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"/>
      <line class="connection-line" x1="${fromX}" y1="${fromY}" x2="${cx1x}" y2="${cx1y}"/>
      <line class="connection-line" x1="${fromX}" y1="${fromY}" x2="${cx2x}" y2="${cx2y}"/>
      <line class="connection-line" x1="${fromX}" y1="${fromY}" x2="${cx3x}" y2="${cx3y}"/>
      <rect class="label-bg" x="${(fromX + toX) / 2 - 60}" y="${(fromY + toY) / 2 - 12}" width="120" height="20" rx="4"/>
      <text class="label-text" x="${(fromX + toX) / 2}" y="${(fromY + toY) / 2}" textAnchor="middle" dominantBaseline="middle">${rel.fromColumn.name} → ${rel.toColumn.name}</text>\n`
    })

    svgContent += `</svg>`

    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `db-diagram-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setTables(data.tables || [])
        setRelationships(data.relationships || [])
      } catch (error) {
        console.error("Failed to import data:", error)
        alert("Failed to import file. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Toolbar
        onAddTable={() => {
          const newTable: Table = {
            id: `table-${Date.now()}`,
            name: `Table${tables.length + 1}`,
            x: 100 + tables.length * 50,
            y: 100 + tables.length * 50,
            columns: [],
          }
          setTables([...tables, newTable])
        }}
        onToggleCode={() => setShowCode(!showCode)}
        showCode={showCode}
        onExport={handleExport}
        onExportSVG={handleExportSVG}
        onImport={handleImport}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          tables={tables}
          selectedTable={selectedTable}
          selectedColumn={selectedColumn}
          onSelectColumn={setSelectedColumn}
          onSelectTable={setSelectedTable}
          onUpdateTable={(id, updates) => {
            setTables(tables.map((t) => (t.id === id ? { ...t, ...updates } : t)))
          }}
          onDeleteTable={(id) => {
            setTables(tables.filter((t) => t.id !== id))
            setRelationships(relationships.filter((r) => r.from !== id && r.to !== id))
            if (selectedTable === id) setSelectedTable(null)
          }}
        />

        <DiagramCanvas
          tables={tables}
          relationships={relationships}
          selectedTable={selectedTable}
          selectedColumn={selectedColumn}
          onSelectColumn={setSelectedColumn}
          onSelectTable={setSelectedTable}
          onUpdateTablePosition={(id, x, y) => {
            setTables(tables.map((t) => (t.id === id ? { ...t, x, y } : t)))
          }}
          onAddRelationship={(rel) => setRelationships([...relationships, rel])}
        />

        {showCode && <CodePanel tables={tables} relationships={relationships} />}
      </div>
    </div>
  )
}
