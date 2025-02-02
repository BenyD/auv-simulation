import "./globals.css";
import { Providers } from "@/components/Providers";
import { geistSans, geistMono } from "@/utils/fonts";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AUV Simulation',
  description: 'Autonomous Underwater Vehicle Pathfinding Simulation',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: { url: '/icon.png', type: 'image/png' }
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
