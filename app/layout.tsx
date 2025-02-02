import "./globals.css";
import { Providers } from "@/components/Providers";
import { geistSans, geistMono } from "@/utils/fonts";
import { Metadata } from 'next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AUV Simulation - Deep RL Path Planning</title>
        <meta
          name="description"
          content="Autonomous Underwater Vehicle Simulation using Deep Reinforcement Learning"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: 'AUV Simulation',
  description: 'Autonomous Underwater Vehicle Pathfinding Simulation',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
