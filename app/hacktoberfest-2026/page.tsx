import type { Metadata } from "next"
import Link from "next/link"
import { Star } from "lucide-react"

import { HacktoberfestCommunity } from "components/hacktoberfest-community"
import { Button } from "components/ui/button"
import { siteConfig } from "lib/site"

const description =
  "Help EmbedCatalog during Hacktoberfest 2026. Pick an open issue and send your pull request."

export const metadata: Metadata = {
  title: "Hacktoberfest 2026",
  description,
  keywords: ["hacktoberfest", "hacktoberfest 2026", "open source", "projects"],
  alternates: { canonical: "/hacktoberfest-2026" },
  openGraph: {
    title: `Hacktoberfest 2026 | ${siteConfig.name}`,
    description,
    url: "/hacktoberfest-2026",
  },
}

export default function HacktoberfestPage() {
  return (
    <main className="site-container py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-2xl font-semibold">Hacktoberfest 2026</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Hacktoberfest is a yearly October event that celebrates open source.
          Pick an issue below and send your pull request. EmbedCatalog is
          participating in it. You can contribute and help the project grow.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link
              href="https://github.com/embedcatalog/embedcatalog/issues"
              target="_blank"
              rel="noreferrer"
            >
              Help the project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href="https://github.com/embedcatalog/embedcatalog"
              target="_blank"
              rel="noreferrer"
            >
              <Star className="size-4" />
              Star project
            </Link>
          </Button>
        </div>
      </div>

      <HacktoberfestCommunity />
    </main>
  )
}
