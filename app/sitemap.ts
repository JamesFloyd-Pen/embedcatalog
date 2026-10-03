import type { MetadataRoute } from "next"

import { siteConfig } from "lib/site"
import { getPublishedProjects } from "lib/supabase/projects"

export const dynamic = "force-static"

const staticPaths = [
  "",
  "/about",
  "/embeds",
  "/hacktoberfest-2026",
  "/submit",
  "/terms",
  "/privacy",
  "/submission-terms",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects()

  return [
    ...staticPaths.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
    })),
    ...projects.map((project) => ({
      url: `${siteConfig.url}/projects/${project.slug}`,
      lastModified: new Date(project.createdAt),
    })),
  ]
}
