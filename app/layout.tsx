import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Spinner } from "@/components/ui/spinner"
import "./globals.css"

export const metadata: Metadata = {
  title: "JSON Explorer",
  description: "The simple way to explore and analyze JSON data with table and tree views",
  generator: "json-explorer",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="moderate" enableSystem={false}>
          <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen gap-4"><Spinner className="h-8 w-8 text-primary" /><span className="text-muted-foreground">Loading...</span></div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
