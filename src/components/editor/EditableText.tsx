'use client'

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface EditableTextProps {
  value: string
  onSave: (newValue: string) => void
  isEditing: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  className?: string
  placeholder?: string
  singleLine?: boolean
}

export function EditableText({
  value,
  onSave,
  isEditing,
  as: Tag = 'span',
  className,
  placeholder = 'Click to edit...',
  singleLine = false,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null)

  // Sync external value changes into the DOM
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value
    }
  }, [value])

  if (!isEditing) {
    return <Tag className={className}>{value}</Tag>
  }

  function handleInput() {
    const newValue = ref.current?.textContent?.trim() ?? ''
    if (newValue !== value) onSave(newValue)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  // ✅ Strip all HTML on paste — forces plain text only
  // Prevents pasting bold/links/headings from other pages into the DB
  // Note: execCommand('insertText') is deprecated in spec but remains
  // the only cross-browser way to intercept paste while preserving undo/redo
  function handlePaste(e: ClipboardEvent<HTMLElement>) {
    e.preventDefault()
    const plainText = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, plainText)
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLHeadingElement & HTMLParagraphElement>}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      className={cn(
        className,
        'cursor-text outline-none',
        '-mx-1 rounded px-1',
        'hover:bg-white/5 focus:bg-white/5',
        'transition-colors duration-150',
        'empty:before:text-text-muted empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)]',
      )}
    />
  )
}
