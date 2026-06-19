import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import Navbar from "@/components/Navbar";
import OneSignalProvider from "@/components/OneSignalProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Eventify - Discover Events Near You",
    template: "%s | Eventify",
  },
  description: "Create, join, and celebrate events with a community that moves fast and builds bold.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <TooltipProvider>
              <OneSignalProvider>
                <Navbar />
                {children}
                <Sonner />
              </OneSignalProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
