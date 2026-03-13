'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface TagItem {
  label: string
  color?: string
}

interface TagEditorProps {
  tags: TagItem[]
  onChange: (tags: TagItem[]) => void
  withColor?: boolean
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

interface PickerPosition {
  top: number
  left: number
}

export function TagEditor({
  tags,
  onChange,
  withColor = false,
  placeholder = 'Add tag...',
}: TagEditorProps) {
  const [input, setInput] = useState('')
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  const [pickerPos, setPickerPos] = useState<PickerPosition>({ top: 0, left: 0 })
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Close picker when clicking outside
  useEffect(() => {
    if (pickerIndex === null) return
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-color-picker]')) {
        setPickerIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerIndex])

  function openPicker(index: number) {
    const btn = swatchRefs.current[index]
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPickerPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    })
    setPickerIndex(pickerIndex === index ? null : index)
  }

  function addTag() {
    const label = input.trim()
    if (!label || tags.some((t) => t.label === label)) return
    onChange([...tags, { label, color: withColor ? DEFAULT_COLORS[0] : undefined }])
    setInput('')
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
    if (pickerIndex === index) setPickerIndex(null)
  }

  function updateColor(index: number, color: string) {
    onChange(tags.map((t, i) => (i === index ? { ...t, color } : t)))
    setPickerIndex(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags.length - 1)
  }

  return (
    <>
      {/* ✅ Screen reader announcement for dynamic tag changes (S5-06) */}
      <div aria-live="polite" className="sr-only">
        {tags.map((t) => t.label).join(', ')}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag, i) => (
          <div
            key={tag.label}
            className="relative flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color ?? '#4B5563' }}
          >
            {withColor && (
              <button
                ref={(el) => {
                  swatchRefs.current[i] = el
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  openPicker(i)
                }}
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/30"
                style={{ backgroundColor: tag.color }}
                aria-label="Change color"
              />
            )}
            {tag.label}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTag(i)
              }}
              className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
              aria-label={`Remove ${tag.label}`}
            >
              ×
            </button>
          </div>
        ))}

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

      {/* Color picker rendered in a Portal — escapes overflow/stacking constraints */}
      {pickerIndex !== null &&
        createPortal(
          <div
            data-color-picker
            className="border-surface-border bg-surface-card fixed z-200 flex gap-1 rounded-lg border p-2 shadow-xl"
            style={{ top: pickerPos.top, left: pickerPos.left }}
          >
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(pickerIndex, c)}
                className={cn(
                  'h-5 w-5 rounded-full transition-transform hover:scale-110',
                  tags[pickerIndex]?.color === c &&
                    'ring-offset-surface-card ring-2 ring-white ring-offset-1',
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
