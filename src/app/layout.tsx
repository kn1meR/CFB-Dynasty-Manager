// src/app/layout.tsx
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import './globals.css'
import { Toaster } from 'react-hot-toast';

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
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-gray-300 dark:bg-gray-800 shadow">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
                <p>&copy; CFB25 Dynasty Manager</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
