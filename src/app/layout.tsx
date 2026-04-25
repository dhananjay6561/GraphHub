import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "GraphHub — Codebase Knowledge Graph",
  description:
    "Replace github.com with graphhub.dev in any GitHub URL to explore that repo as an interactive knowledge graph.",
  keywords: [
    "codebase",
    "knowledge graph",
    "GitHub",
    "developer tool",
    "code visualization",
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme init — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('graphhub-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
