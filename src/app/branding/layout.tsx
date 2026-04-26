import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Guidelines",
  description:
    "GraphHub's visual identity: logo usage rules, color system, typography specimens, graph node vocabulary, and brand voice guidelines.",
  alternates: { canonical: "https://graphhub.dev/branding" },
  openGraph: {
    title: "GraphHub Brand Guidelines",
    description:
      "Logo, color palette, typography, and graph node vocabulary for the GraphHub visual identity.",
    url: "https://graphhub.dev/branding",
  },
};

export default function BrandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
