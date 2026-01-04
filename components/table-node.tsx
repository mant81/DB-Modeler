"use client"

import type { Table } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Key, LinkIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface TableNodeProps {
  table: Table
  isSelected: boolean
  selectedColumn: string | null
  onSelectColumn: (columnId: string) => void
  onSelect: () => void
  onMove: (id: string, x: number, y: number) => void
}

export function TableNode({ table, isSelected, selectedColumn, onSelectColumn, onSelect, onMove }: TableNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      onMove(table.id, table.x + dx, table.y + dy)
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, table.id, table.x, table.y, onMove])

  return (
    <Card
      ref={nodeRef}
      className={`absolute w-72 cursor-move select-none ${isSelected ? "ring-2 ring-primary shadow-lg" : ""}`}
      style={{
        left: table.x,
        top: table.y,
        zIndex: isSelected ? 10 : 1,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-table-header]")) {
          setIsDragging(true)
          setDragStart({ x: e.clientX, y: e.clientY })
          onSelect()
        }
      }}
    >
      <div data-table-header className="bg-primary text-primary-foreground px-3 py-2 font-semibold rounded-t-lg">
        {table.name}
      </div>
      <div className="p-0">
        {table.columns.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">No columns yet</div>
        ) : (
          <div className="divide-y divide-border">
            {table.columns.map((column) => (
              <div
                key={column.id}
                className={`px-3 py-2 flex items-center justify-between text-sm cursor-pointer transition-colors ${
                  selectedColumn === column.id ? "bg-primary/20 font-semibold" : "hover:bg-muted/50"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectColumn(column.id)
                  onSelect()
                }}
              >
                <div className="flex items-center gap-2">
                  {column.isPrimary && <Key className="w-3 h-3 text-primary" />}
                  {column.isForeign && <LinkIcon className="w-3 h-3 text-accent" />}
                  <span className="font-mono">{column.name}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {column.size ? `${column.type}(${column.size})` : column.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
