import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Quick Snippet - 데일리 스니펫 작성 서비스',
  description: '빠르고 효율적인 데일리 스니펫 작성 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-dark-bg text-white overflow-x-hidden font-nanum">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
