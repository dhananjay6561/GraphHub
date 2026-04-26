import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const BASE_URL = "https://graphhub.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  title: {
    default: "GraphHub — Visualize any GitHub repo as a knowledge graph",
    template: "%s — GraphHub",
  },
  description:
    "Replace github.com with graphhub.dev in any GitHub URL to explore that repository as an interactive force-directed knowledge graph. Zero setup. Supports JS, TS, Python, and Go.",
  keywords: [
    "codebase visualization",
    "knowledge graph",
    "GitHub",
    "developer tool",
    "code graph",
    "dependency graph",
    "force directed graph",
    "code architecture",
    "repo explorer",
  ],
  authors: [{ name: "Dhananjay Aggarwal", url: "https://github.com/dhananjay6561" }],
  creator: "Dhananjay Aggarwal",
  openGraph: {
    title: "GraphHub — Visualize any GitHub repo as a knowledge graph",
    description:
      "Replace github.com with graphhub.dev to explore any repo as an interactive knowledge graph. Zero setup.",
    url: BASE_URL,
    siteName: "GraphHub",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "GraphHub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GraphHub — Visualize any GitHub repo as a knowledge graph",
    description: "Replace github.com with graphhub.dev to explore any repo as an interactive knowledge graph.",
    images: ["/opengraph-image"],
    creator: "@dhananjay6561",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:text-sm focus:rounded-md"
          style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
