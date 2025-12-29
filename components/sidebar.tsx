"use client"

import type { Table } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Key, LinkIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Database } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface SidebarProps {
  tables: Table[]
  selectedTable: string | null
  onSelectTable: (id: string | null) => void
  onUpdateTable: (id: string, updates: Partial<Table>) => void
  onDeleteTable: (id: string) => void
}

export function Sidebar({ tables, selectedTable, onSelectTable, onUpdateTable, onDeleteTable }: SidebarProps) {
  const selected = tables.find((t) => t.id === selectedTable)

  return (
    <aside className="w-80 border-r border-border bg-card overflow-y-auto">
      <div className="p-4 space-y-4">
        {!selected ? (
          <div className="text-center py-12 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a table to edit</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Table Properties</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDeleteTable(selected.id)
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="table-name">Table Name</Label>
              <Input
                id="table-name"
                value={selected.name}
                onChange={(e) => onUpdateTable(selected.id, { name: e.target.value })}
                placeholder="users"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="table-comment">Table Comment</Label>
              <Textarea
                id="table-comment"
                value={selected.comment || ""}
                onChange={(e) => onUpdateTable(selected.id, { comment: e.target.value })}
                placeholder="Description of this table..."
                className="h-16 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Columns</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newColumn = {
                      id: `col-${Date.now()}`,
                      name: "new_column",
                      type: "VARCHAR(255)",
                      isPrimary: false,
                      isNullable: true,
                    }
                    onUpdateTable(selected.id, {
                      columns: [...selected.columns, newColumn],
                    })
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {selected.columns.map((column, idx) => (
                  <Card key={column.id} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={column.name}
                        onChange={(e) => {
                          const updated = [...selected.columns]
                          updated[idx] = { ...updated[idx], name: e.target.value }
                          onUpdateTable(selected.id, { columns: updated })
                        }}
                        placeholder="column_name"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onUpdateTable(selected.id, {
                            columns: selected.columns.filter((c) => c.id !== column.id),
                          })
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <Select
                      value={column.type}
                      onValueChange={(value) => {
                        const updated = [...selected.columns]
                        updated[idx] = { ...updated[idx], type: value }
                        onUpdateTable(selected.id, { columns: updated })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INT">INT</SelectItem>
                        <SelectItem value="BIGINT">BIGINT</SelectItem>
                        <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                        <SelectItem value="TEXT">TEXT</SelectItem>
                        <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                        <SelectItem value="DATE">DATE</SelectItem>
                        <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                        <SelectItem value="DECIMAL">DECIMAL</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={column.comment || ""}
                      onChange={(e) => {
                        const updated = [...selected.columns]
                        updated[idx] = { ...updated[idx], comment: e.target.value }
                        onUpdateTable(selected.id, { columns: updated })
                      }}
                      placeholder="Column comment..."
                      className="text-xs"
                    />

                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={column.isPrimary}
                          onCheckedChange={(checked) => {
                            const updated = [...selected.columns]
                            updated[idx] = { ...updated[idx], isPrimary: !!checked }
                            onUpdateTable(selected.id, { columns: updated })
                          }}
                        />
                        <Key className="w-3 h-3" />
                        PK
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={column.isForeign}
                          onCheckedChange={(checked) => {
                            const updated = [...selected.columns]
                            updated[idx] = { ...updated[idx], isForeign: !!checked }
                            onUpdateTable(selected.id, { columns: updated })
                          }}
                        />
                        <LinkIcon className="w-3 h-3" />
                        FK
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={!column.isNullable}
                          onCheckedChange={(checked) => {
                            const updated = [...selected.columns]
                            updated[idx] = { ...updated[idx], isNullable: !checked }
                            onUpdateTable(selected.id, { columns: updated })
                          }}
                        />
                        NOT NULL
                      </label>
                    </div>

                    {column.isForeign && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="text-xs">References</Label>
                        <Select
                          value={column.foreignKey?.tableId || ""}
                          onValueChange={(tableId) => {
                            const updated = [...selected.columns]
                            updated[idx] = {
                              ...updated[idx],
                              foreignKey: { tableId, columnId: "" },
                            }
                            onUpdateTable(selected.id, { columns: updated })
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables
                              .filter((t) => t.id !== selected.id)
                              .map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  {table.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {column.foreignKey?.tableId && (
                          <Select
                            value={column.foreignKey?.columnId || ""}
                            onValueChange={(columnId) => {
                              const updated = [...selected.columns]
                              updated[idx] = {
                                ...updated[idx],
                                foreignKey: {
                                  tableId: column.foreignKey!.tableId,
                                  columnId,
                                },
                              }
                              onUpdateTable(selected.id, { columns: updated })
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {tables
                                .find((t) => t.id === column.foreignKey?.tableId)
                                ?.columns.map((col) => (
                                  <SelectItem key={col.id} value={col.id}>
                                    {col.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
