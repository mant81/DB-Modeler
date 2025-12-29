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
        onImport={handleImport}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          tables={tables}
          selectedTable={selectedTable}
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
