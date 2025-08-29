import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Green Hydrogen Infrastructure Mapper",
  description:
    "Advanced mapping and optimization platform for green hydrogen infrastructure development",
  keywords: [
    "hydrogen",
    "renewable energy",
    "infrastructure",
    "mapping",
    "optimization",
  ],
  authors: [{ name: "Green Hydrogen Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark`}
      >
        <ThemeProvider>
          <div className="min-h-screen">
            {/* Header with theme toggle */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                    Hydrogen Mapper
                  </h1>
                </div>
                <ThemeToggle />
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
