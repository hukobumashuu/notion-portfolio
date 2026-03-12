'use client'

import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface TagItem {
  label: string
  color?: string
}

interface TagEditorProps {
  tags: TagItem[]
  onChange: (tags: TagItem[]) => void
  withColor?: boolean // true for tool tags, false for sector tags
  placeholder?: string
}

const DEFAULT_COLORS = [
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
]

export function TagEditor({
  tags,
  onChange,
  withColor = false,
  placeholder = 'Add tag...',
}: TagEditorProps) {
  const [input, setInput] = useState('')
  const [colorPickerIndex, setColorPickerIndex] = useState<number | null>(null)

  function addTag() {
    const label = input.trim()
    if (!label || tags.some((t) => t.label === label)) return
    onChange([...tags, { label, color: withColor ? DEFAULT_COLORS[0] : undefined }])
    setInput('')
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
  }

  function updateColor(index: number, color: string) {
    onChange(tags.map((t, i) => (i === index ? { ...t, color } : t)))
    setColorPickerIndex(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, i) => (
        <div
          key={tag.label}
          className="relative flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: tag.color ?? '#4B5563' }}
        >
          {/* Color swatch — only for tool tags */}
          {withColor && (
            <button
              onClick={() => setColorPickerIndex(colorPickerIndex === i ? null : i)}
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/30"
              style={{ backgroundColor: tag.color }}
              aria-label="Change color"
            />
          )}
          {tag.label}
          <button
            onClick={() => removeTag(i)}
            className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
            aria-label={`Remove ${tag.label}`}
          >
            ×
          </button>

          {/* Color picker dropdown */}
          {withColor && colorPickerIndex === i && (
            <div className="border-surface-border bg-surface-card absolute top-full left-0 z-50 mt-1 flex gap-1 rounded-lg border p-2 shadow-xl">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateColor(i, c)}
                  className={cn(
                    'h-5 w-5 rounded-full transition-transform hover:scale-110',
                    tag.color === c && 'ring-offset-surface-card ring-2 ring-white ring-offset-1',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add tag input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="border-surface-border text-text-muted placeholder:text-text-muted focus:border-teal focus:text-text-primary min-w-20 rounded-full border border-dashed bg-transparent px-2.5 py-0.5 text-xs focus:outline-none"
      />
    </div>
  )
}
