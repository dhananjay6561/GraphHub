import type { Metadata } from "next";
import { GraphPageClient } from "./GraphPageClient";

export async function generateMetadata({
  params,
}: {
  params: { owner: string; repo: string };
}): Promise<Metadata> {
  const { owner, repo } = params;
  const title = `${owner}/${repo}`;
  const description = `Explore the ${owner}/${repo} codebase as an interactive knowledge graph — nodes for files, functions, and classes; edges for imports and structure.`;
  const url = `https://graphhub.dev/${owner}/${repo}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — GraphHub`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} — GraphHub`,
      description,
    },
  };
}

export default function GraphPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  return <GraphPageClient owner={params.owner} repo={params.repo} />;
}
