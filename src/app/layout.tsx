// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { DynastyProvider } from '@/contexts/DynastyContext';
import DynastyWrapper from '@/components/DynastyWrapper';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Toaster />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DynastyProvider>
            <DynastyWrapper>
              {children}
            </DynastyWrapper>
          </DynastyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}