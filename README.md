# GraphHub

Replace `github.com` with `graphhub.dev` in any GitHub repo URL to get an interactive knowledge graph of that codebase.

**Example:**
```
https://github.com/vercel/next.js  →  https://graphhub.dev/vercel/next.js
```

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- D3.js force simulation · Canvas API
- GitHub REST API · node-cache

## Getting started

```bash
cp .env.example .env.local
# add GITHUB_TOKEN for higher rate limits (optional)
npm install
npm run dev
```
