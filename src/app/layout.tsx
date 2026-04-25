import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GraphHub — Codebase Knowledge Graph",
  description: "Replace github.com with graphhub.dev in any GitHub URL to explore that repo as an interactive knowledge graph.",
  keywords: ["codebase", "knowledge graph", "GitHub", "developer tool", "code visualization"],
  openGraph: {
    title: "GraphHub",
    description: "Interactive codebase knowledge graph visualizer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0F172A] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
