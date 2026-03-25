'use client'

import { useState } from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface EmojiPickerModalProps {
  onEmojiSelect: (emoji: string) => void
  children: React.ReactNode
  className?: string
}

export function EmojiPickerModal({
  onEmojiSelect,
  children,
  className = '',
}: EmojiPickerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* The trigger (Avatar button, or Callout link icon) */}
      <div onClick={() => setIsOpen(true)} className={className}>
        {children}
      </div>

      {/* The Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
        >
          {/* The Actual Picker */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-in fade-in zoom-in-95 duration-200"
          >
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={(emojiData) => {
                onEmojiSelect(emojiData.emoji)
                setIsOpen(false) // Auto-close when they pick one!
              }}
              lazyLoadEmojis={true}
            />
          </div>
        </div>
      )}
    </>
  )
}
