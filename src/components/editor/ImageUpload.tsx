'use client'

import { useRef, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  bucket: 'thumbnails' | 'avatars'
  path: string // e.g. project.id or 'avatar'
  onUpload: (url: string) => void
  children: React.ReactNode // The visible trigger UI
  className?: string
}

const MAX_WIDTH = 800
const QUALITY = 0.82

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_WIDTH / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/webp',
        QUALITY,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export function ImageUpload({ bucket, path, onUpload, children, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const compressed = await compressImage(file)
      const fileName = `${path}-${Date.now()}.webp`

      const supabase = createBrowserClient()

      const { error } = await supabase.storage.from(bucket).upload(fileName, compressed, {
        contentType: 'image/webp',
        upsert: true,
      })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onUpload(data.publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setIsUploading(false)
      // Reset input so same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn('relative cursor-pointer', className)}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      {children}
      {isUploading && (
        <div className="rounded-inherit absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="text-xs text-white">Uploading…</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
