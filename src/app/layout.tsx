import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthRedirectProvider } from '@/components/auth/auth-redirect-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ContentFlow',
  description: 'Una aplicación moderna para gestión de contenido',
  keywords: ['content', 'management', 'nextjs', 'typescript'],
  authors: [{ name: 'ContentFlow Team' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthRedirectProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthRedirectProvider>
      </body>
    </html>
  )
} 