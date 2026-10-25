import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SocMark — The Social Marketplace for Creators and Curators",
  description: "Explore curated lookbooks, shop creator feed products, and engage with the creator community.",
  icons: {
    icon: "/avatar.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
