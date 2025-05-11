import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Geist_Mono({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CrossMind",
  description: "Cross-chain AI Agent/Chatbot that enables users to perform complex onchain operations by chatting with an AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
