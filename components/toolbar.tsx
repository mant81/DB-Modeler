"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Database, Code, Plus, Download, Upload, ChevronDown } from "lucide-react"
import { useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ToolbarProps {
  onAddTable: () => void
  onToggleCode: () => void
  showCode: boolean
  onExport: () => void
  onExportSVG: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function Toolbar({ onAddTable, onToggleCode, showCode, onExport, onExportSVG, onImport }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">DB Modeler</h1>
        </div>
        <div className="h-6 w-px bg-border" />
        <Button variant="default" size="sm" onClick={onAddTable}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Table
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-1.5" />
          Import
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Export
              <ChevronDown className="w-3 h-3 ml-1.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportSVG}>To SVG</DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>To JSON backup</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant={showCode ? "secondary" : "ghost"} size="sm" onClick={onToggleCode}>
          <Code className="w-4 h-4 mr-1.5" />
          SQL
        </Button>
      </div>
    </header>
  )
}
