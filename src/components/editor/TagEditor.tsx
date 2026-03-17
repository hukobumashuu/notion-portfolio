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

      {/* 🎨 Notion Spacing: 6px horizontal gap, 4px vertical gap */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {tags.map((tag, i) => {
          // Notion UI Trick: Background is hex + 33 (20% opacity), Text is solid hex
          const bgColor = tag.color ? `${tag.color}33` : 'rgba(255,255,255,0.055)'
          const textColor = tag.color ? tag.color : '#f0efed'

          return (
            <div
              key={tag.label}
              // 🎨 Notion Geometry: 18px height, 3px radius, 6px padding, 12px font
              className="relative flex h-4.5 items-center gap-1 rounded-[3px] px-1.5 text-[12px] leading-4.5 font-medium whitespace-nowrap"
              style={{ backgroundColor: bgColor, color: textColor }}
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
                  // 🎨 Tiny square button for the color picker
                  className="h-2.5 w-2.5 shrink-0 rounded-xs border border-current opacity-70 transition-opacity hover:opacity-100"
                  style={{ backgroundColor: textColor }}
                  aria-label="Change color"
                />
              )}
              {tag.label}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(i)
                }}
                className="ml-0.5 flex h-3 w-3 items-center justify-center rounded opacity-60 transition-opacity hover:bg-black/10 hover:opacity-100"
                aria-label={`Remove ${tag.label}`}
              >
                ×
              </button>
            </div>
          )
        })}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          // 🎨 Notion Input Geometry matching the tag exactly
          className="border-notion-border text-notion-text placeholder:text-notion-text-muted focus:border-notion-teal focus:text-notion-text h-4.5 min-w-20 rounded-[3px] border border-dashed bg-transparent px-1.5 text-[12px] leading-4.5 focus:outline-none"
        />
      </div>

      {/* Color picker rendered in a Portal — escapes overflow/stacking constraints */}
      {pickerIndex !== null &&
        createPortal(
          <div
            data-color-picker
            className="border-notion-border bg-notion-bg-card fixed z-200 flex max-w-35 flex-wrap gap-1.5 rounded-md border p-2 shadow-[0px_4px_12px_rgba(0,0,0,0.1)]"
            style={{ top: pickerPos.top, left: pickerPos.left }}
          >
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(pickerIndex, c)}
                className={cn(
                  'h-5 w-5 rounded-[3px] transition-transform hover:scale-110',
                  tags[pickerIndex]?.color === c &&
                    'ring-offset-notion-bg-card ring-1 ring-white ring-offset-1',
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
