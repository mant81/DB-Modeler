"use client"

import type { Table, Relationship } from "@/app/page"
import { TableNode } from "@/components/table-node"
import { useRef } from "react"

interface DiagramCanvasProps {
  tables: Table[]
  relationships: Relationship[]
  selectedTable: string | null
  onSelectTable: (id: string | null) => void
  onUpdateTablePosition: (id: string, x: number, y: number) => void
  onAddRelationship: (rel: Relationship) => void
}

export function DiagramCanvas({
  tables,
  relationships,
  selectedTable,
  onSelectTable,
  onUpdateTablePosition,
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative overflow-auto bg-muted/30"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
      onClick={(e) => {
        if (e.target === canvasRef.current) {
          onSelectTable(null)
        }
      }}
    >
      {tables.map((table) => (
        <TableNode
          key={table.id}
          table={table}
          isSelected={selectedTable === table.id}
          onSelect={() => onSelectTable(table.id)}
          onMove={onUpdateTablePosition}
        />
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {fkRelationships.map((rel, idx) => {
          const fromTableHeight = 60 + rel.fromTable.columns.length * 36
          const toTableHeight = 60 + rel.toTable.columns.length * 36

          const x1 = rel.fromTable.x + 288
          const y1 = rel.fromTable.y + fromTableHeight / 2
          const x2 = rel.toTable.x
          const y2 = rel.toTable.y + toTableHeight / 2

          const midX = (x1 + x2) / 2

          const dx = x2 - x1
          const dy = y2 - y1
          const angle = Math.atan2(dy, dx)

          // Crow's foot at the "many" side (from side - FK side)
          const crowLength = 12
          const crowAngle = Math.PI / 6

          const cx1x = x1 - Math.cos(angle - crowAngle) * crowLength
          const cx1y = y1 - Math.sin(angle - crowAngle) * crowLength
          const cx2x = x1 - Math.cos(angle + crowAngle) * crowLength
          const cx2y = y1 - Math.sin(angle + crowAngle) * crowLength
          const cx3x = x1 - Math.cos(angle) * crowLength
          const cx3y = y1 - Math.sin(angle) * crowLength

          return (
            <g key={`fk-${idx}`}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
              />

              <line x1={x2 + 8} y1={y2 - 6} x2={x2 + 8} y2={y2 + 6} stroke="#3b82f6" strokeWidth="2" />

              <g>
                <line x1={x1} y1={y1} x2={cx1x} y2={cx1y} stroke="#3b82f6" strokeWidth="2" />
                <line x1={x1} y1={y1} x2={cx2x} y2={cx2y} stroke="#3b82f6" strokeWidth="2" />
                <line x1={x1} y1={y1} x2={cx3x} y2={cx3y} stroke="#3b82f6" strokeWidth="2" />
              </g>

              <rect
                x={midX - 60}
                y={(y1 + y2) / 2 - 12}
                width="120"
                height="20"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.95"
                rx="4"
              />
              <text
                x={midX}
                y={(y1 + y2) / 2}
                fill="#60a5fa"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono font-semibold"
              >
                {rel.fromColumn.name} → {rel.toColumn.name}
              </text>
            </g>
          )
        })}

        {relationships.map((rel) => {
          const fromTable = tables.find((t) => t.id === rel.from)
          const toTable = tables.find((t) => t.id === rel.to)
          if (!fromTable || !toTable) return null

          const x1 = fromTable.x + 150
          const y1 = fromTable.y + 30
          const x2 = toTable.x
          const y2 = toTable.y + 30

          return (
            <g key={rel.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
