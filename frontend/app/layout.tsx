import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SolQuest.io',
  description: 'Quest-based learning platform for Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark text-white">
        <div className="fixed inset-0 bg-gradient-radial from-dark-lighter to-dark -z-10" />
        <div className="fixed inset-0 opacity-30 -z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-solana-purple/20 to-solana-green/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(78,70,229,0.1),transparent)]" />
        </div>
        {children}
      </body>
    </html>
  )
} 