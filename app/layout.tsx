import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MOVA Poster Generator',
  description: 'MOVA Poster Generator',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MOVA Poster Generator',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#1a1a2e',
              color: '#C1FF72',
              border: '1px solid #C1FF72',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#C1FF72',
                secondary: '#1a1a2e',
              },
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: '#ff6b6b',
                secondary: '#1a1a2e',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 