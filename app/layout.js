// app/layout.js
// Fixed layout with proper Tailwind CSS loading

import './globals.css'
import ClientLayout from './client-layout'

export const metadata = {
  title: 'Misti - Italian Learning',
  description: 'Learn Italian with comprehensive vocabulary, premium audio, and spaced repetition',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load fonts first */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-gradient-to-br from-cyan-50 to-blue-50" style={{ fontFamily: "'Comic Neue', cursive" }}>
        {/* Load Tailwind in body to ensure it loads after React hydration */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
