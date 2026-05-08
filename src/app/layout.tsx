import type { Metadata } from 'next'
import { Providers } from '@/components/shared/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Odontograma',
  description: 'Sistema de gestión de clínica dental',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
