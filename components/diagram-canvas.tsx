"use client"

import type { Table, Relationship } from "@/app/page"
import { TableNode } from "@/components/table-node"
import { useRef } from "react"

interface DiagramCanvasProps {
  tables: Table[]
  relationships: Relationship[]
  selectedTable: string | null
  selectedColumn: string | null
  onSelectColumn: (id: string | null) => void
  onSelectTable: (id: string | null) => void
  onUpdateTablePosition: (id: string, x: number, y: number) => void
  onAddRelationship: (rel: Relationship) => void
}

function getConnectionPoints(fromTable: Table, toTable: Table, fromTableHeight: number, toTableHeight: number) {
  const tableWidth = 288

  const fromCenterX = fromTable.x + tableWidth / 2
  const fromCenterY = fromTable.y + fromTableHeight / 2
  const toCenterX = toTable.x + tableWidth / 2
  const toCenterY = toTable.y + toTableHeight / 2

  const dx = toCenterX - fromCenterX
  const dy = toCenterY - fromCenterY

  let fromX, fromY, toX, toY, fromSide, toSide

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection - connect from left/right sides at vertical center
    if (dx > 0) {
      fromX = fromTable.x + tableWidth
      fromY = fromCenterY
      fromSide = "right"
      toX = toTable.x
      toY = toCenterY
      toSide = "left"
    } else {
      fromX = fromTable.x
      fromY = fromCenterY
      fromSide = "left"
      toX = toTable.x + tableWidth
      toY = toCenterY
      toSide = "right"
    }
  } else {
    // Vertical connection - connect from top/bottom at horizontal center
    if (dy > 0) {
      // From table is above to table
      fromX = fromCenterX // Use center X for vertical connections
      fromY = fromTable.y + fromTableHeight // Bottom edge
      fromSide = "bottom"
      toX = toCenterX // Use center X for vertical connections
      toY = toTable.y // Top edge
      toSide = "top"
    } else {
      // From table is below to table
      fromX = fromCenterX // Use center X for vertical connections
      fromY = fromTable.y // Top edge
      fromSide = "top"
      toX = toCenterX // Use center X for vertical connections
      toY = toTable.y + toTableHeight // Bottom edge
      toSide = "bottom"
    }
  }

  return { fromX, fromY, toX, toY, fromSide, toSide }
}

export function DiagramCanvas({
  tables,
  relationships,
  selectedTable,
  selectedColumn,
  onSelectColumn,
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
          onSelectColumn(null)
        }
      }}
    >
      {tables.map((table) => (
        <TableNode
          key={table.id}
          table={table}
          isSelected={selectedTable === table.id}
          selectedColumn={selectedColumn}
          onSelectColumn={onSelectColumn}
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

          const { fromX, fromY, toX, toY, fromSide, toSide } = getConnectionPoints(
            rel.fromTable,
            rel.toTable,
            fromTableHeight,
            toTableHeight,
          )

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

          const cx1x = fromX - Math.cos(Math.atan2(toY - fromY, toX - fromX) - crowAngle) * crowLength
          const cx1y = fromY - Math.sin(Math.atan2(toY - fromY, toX - fromX) - crowAngle) * crowLength
          const cx2x = fromX - Math.cos(Math.atan2(toY - fromY, toX - fromX) + crowAngle) * crowLength
          const cx2y = fromY - Math.sin(Math.atan2(toY - fromY, toX - fromX) + crowAngle) * crowLength
          const cx3x = fromX - Math.cos(Math.atan2(toY - fromY, toX - fromX)) * crowLength
          const cx3y = fromY - Math.sin(Math.atan2(toY - fromY, toX - fromX)) * crowLength

          const perpAngle = Math.atan2(toY - fromY, toX - fromX) + Math.PI / 2
          const perpLength = 6
          const p1x = toX + Math.cos(perpAngle) * perpLength
          const p1y = toY + Math.sin(perpAngle) * perpLength
          const p2x = toX - Math.cos(perpAngle) * perpLength
          const p2y = toY - Math.sin(perpAngle) * perpLength

          return (
            <g key={`fk-${idx}`}>
              {/* Main connection line */}
              <path d={path} stroke="#3b82f6" strokeWidth="2" fill="none" />

              {/* One side notation */}
              <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#3b82f6" strokeWidth="2" />

              {/* Crow's foot notation (many side) */}
              <g>
                <line x1={fromX} y1={fromY} x2={cx1x} y2={cx1y} stroke="#3b82f6" strokeWidth="2" />
                <line x1={fromX} y1={fromY} x2={cx2x} y2={cx2y} stroke="#3b82f6" strokeWidth="2" />
                <line x1={fromX} y1={fromY} x2={cx3x} y2={cx3y} stroke="#3b82f6" strokeWidth="2" />
              </g>

              {/* Column name label */}
              <rect
                x={(fromX + toX) / 2 - 60}
                y={(fromY + toY) / 2 - 12}
                width="120"
                height="20"
                fill="#1e293b"
                stroke="#3b82f6"
                strokeWidth="1"
                opacity="0.95"
                rx="4"
              />
              <text
                x={(fromX + toX) / 2}
                y={(fromY + toY) / 2}
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
