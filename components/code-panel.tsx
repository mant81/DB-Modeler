"use client"

import type { Table, Relationship } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CodePanelProps {
  tables: Table[]
  relationships: Relationship[]
}

export function CodePanel({ tables }: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  const generateSQL = () => {
    return tables
      .map((table) => {
        const columns = table.columns
          .map((col) => {
            const parts = [col.name, col.type]
            if (col.isPrimary) parts.push("PRIMARY KEY")
            if (!col.isNullable) parts.push("NOT NULL")
            if (col.comment) parts.push(`COMMENT '${col.comment}'`)
            return `  ${parts.join(" ")}`
          })
          .join(",\n")

        const foreignKeys = table.columns
          .filter((col) => col.isForeign && col.foreignKey?.tableId && col.foreignKey?.columnId)
          .map((col) => {
            const refTable = tables.find((t) => t.id === col.foreignKey!.tableId)
            const refColumn = refTable?.columns.find((c) => c.id === col.foreignKey!.columnId)
            return `  FOREIGN KEY (${col.name}) REFERENCES ${refTable?.name}(${refColumn?.name})`
          })

        const allConstraints = foreignKeys.length > 0 ? `,\n${foreignKeys.join(",\n")}` : ""

        const tableComment = table.comment ? `\nCOMMENT='${table.comment}';` : ";"

        return `CREATE TABLE ${table.name} (\n${columns}${allConstraints}\n)${tableComment}`
      })
      .join("\n\n")
  }

  const sql = generateSQL()

  const handleCopy = () => {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="w-96 border-l border-border bg-card overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Generated SQL</h2>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Card className="p-4 bg-muted">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
            {sql || "-- No tables created yet"}
          </pre>
        </Card>
      </div>
    </aside>
  )
}
