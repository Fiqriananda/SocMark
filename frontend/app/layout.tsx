import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./context/Providers";
import AppShell from "./components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700"],
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
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
