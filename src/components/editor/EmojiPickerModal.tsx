'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Theme } from 'emoji-picker-react' // ✅ Import the exact enum type

// Lazy load the massive picker
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-100 w-87.5 items-center justify-center rounded-lg bg-[#222222] text-sm text-white/50">
      Loading picker...
    </div>
  ),
})

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
      {/* The trigger */}
      <div onClick={() => setIsOpen(true)} className={className}>
        {children}
      </div>

      {/* The Modal Backdrop */}
      {isOpen && (
        <div
          // ✅ Added text-resets here to prevent the 60px inherited font size bug!
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 text-left font-sans text-base tracking-normal backdrop-blur-sm"
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
              theme={Theme.DARK} // ✅ No more 'any'! Perfectly typed.
              onEmojiClick={(emojiData) => {
                onEmojiSelect(emojiData.emoji)
                setIsOpen(false)
              }}
              lazyLoadEmojis={true}
            />
          </div>
        </div>
      )}
    </>
  )
}
