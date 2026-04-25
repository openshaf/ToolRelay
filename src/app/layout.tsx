import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToolRelay | MCP Reliability Platform",
  description: "Configure, route, and manage AI tool connections with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSerif.variable} ${instrumentSans.variable} ${oswald.variable} antialiased bg-[#F5F1E3] text-[#1A1A1A] min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
