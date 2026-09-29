"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { CustomEmbedCard } from "components/project-embeds"
import { Card, CardContent } from "components/ui/card"
import { supabase } from "lib/supabase/client"

type PublicEmbed = {
  id: string
  shortId: string
  title: string
  projectName: string
  projectSlug: string
  projectUrl: string
}

function EmbedsPage() {
  const [embeds, setEmbeds] = React.useState<PublicEmbed[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function loadEmbeds() {
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, slug, url")
        .eq("status", "published")

      if (cancelled) return
      if (projectsError || !projects || projects.length === 0) {
        setEmbeds([])
        setLoading(false)
        return
      }

      const projectIds = projects.map((project) => project.id)
      const { data: projectEmbeds } = await supabase
        .from("project_embeds")
        .select("id, project_id, short_id, title, position")
        .in("project_id", projectIds)
        .order("position", { ascending: true })

      if (cancelled) return

      const projectsById = new Map(
        projects.map((project) => [project.id, project])
      )
      setEmbeds(
        (projectEmbeds ?? []).flatMap((embed) => {
          const project = projectsById.get(embed.project_id)
          if (!project) return []

          return [
            {
              id: embed.id,
              shortId: embed.short_id,
              title: embed.title,
              projectName: project.name,
              projectSlug: project.slug,
              projectUrl: project.url,
            },
          ]
        })
      )
      setLoading(false)
    }

    void loadEmbeds()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="site-container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Embeds{" "}
          {!loading && (
            <span className="font-normal text-muted-foreground">
              ({embeds.length})
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Custom embeds from projects in EmbedCatalog.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : embeds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No custom embeds yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {embeds.map((embed) => (
            <div key={embed.id}>
              <CustomEmbedCard
                slug={embed.projectSlug}
                shortId={embed.shortId}
                projectUrl={embed.projectUrl}
                title={embed.title}
                projectName={embed.projectName}
                projectHref={`/projects/${embed.projectSlug}`}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default EmbedsPage
