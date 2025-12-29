"use client"

import type { Table } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Key, LinkIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface TableNodeProps {
  table: Table
  isSelected: boolean
  onSelect: () => void
  onMove: (id: string, x: number, y: number) => void
}

export function TableNode({ table, isSelected, onSelect, onMove }: TableNodeProps) {
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
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        onSelect()
      }}
    >
      <div className="bg-primary text-primary-foreground px-3 py-2 font-semibold rounded-t-lg">{table.name}</div>
      <div className="p-0">
        {table.columns.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">No columns yet</div>
        ) : (
          <div className="divide-y divide-border">
            {table.columns.map((column) => (
              <div key={column.id} className="px-3 py-2 flex items-center justify-between hover:bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  {column.isPrimary && <Key className="w-3 h-3 text-primary" />}
                  {column.isForeign && <LinkIcon className="w-3 h-3 text-accent" />}
                  <span className="font-mono">{column.name}</span>
                </div>
                <span className="text-muted-foreground text-xs">{column.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
