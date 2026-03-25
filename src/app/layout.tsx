import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/context/ToastContext'
import { RealtimeSync } from '@/components/RealTimeSync'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Portfolio',
    template: '%s | Portfolio',
  },
  description: 'Personal portfolio',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <RealtimeSync />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
