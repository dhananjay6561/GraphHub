import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GraphHub",
  description: "Interactive codebase knowledge graph visualizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
