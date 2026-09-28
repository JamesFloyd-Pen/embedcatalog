"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bookmark,
  FolderKanban,
  Loader2,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { Button } from "components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import { useAuth } from "components/auth-provider"
import {
  ProjectsGrid,
  type Project as CatalogProject,
} from "components/projects-grid"
import { supabase } from "lib/supabase/client"
import { getProjectImageUrl } from "lib/storage"

type OwnedProject = {
  id: string
  name: string
  description: string
  url: string
  status: "draft" | "pending" | "published" | "rejected"
  is_premium: boolean
  impressions_count: number
  created_at: string
}

function AccountPage({
  initialSection = "settings",
}: {
  initialSection?: "settings" | "projects" | "bookmarks"
}) {
  const router = useRouter()
  const { user, loading, isAdmin, signOut } = useAuth()
  const [activeSection, setActiveSection] = React.useState<
    "settings" | "projects" | "bookmarks"
  >(initialSection)
  const [projects, setProjects] = React.useState<OwnedProject[]>([])
  const [projectsLoading, setProjectsLoading] = React.useState(false)
  const [projectsError, setProjectsError] = React.useState<string | null>(null)
  const [bookmarkedProjects, setBookmarkedProjects] = React.useState<
    CatalogProject[]
  >([])
  const [bookmarksLoading, setBookmarksLoading] = React.useState(false)
  const [bookmarksError, setBookmarksError] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  React.useEffect(() => {
    if (!user || activeSection !== "projects") {
      return
    }

    let cancelled = false

    supabase
      .from("projects")
      .select(
        "id, name, description, url, status, is_premium, impressions_count, created_at"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) {
          return
        }
        if (error) {
          setProjectsError(error.message)
          setProjects([])
        } else {
          setProjects(data)
        }
        setProjectsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeSection, user])

  React.useEffect(() => {
    if (!user || activeSection !== "bookmarks") return

    let cancelled = false
    const userId = user.id

    async function loadBookmarks() {
      const { data: bookmarkRows, error: bookmarkError } = await supabase
        .from("project_bookmarks")
        .select("project_id")
        .eq("user_id", userId)

      if (cancelled) return
      if (bookmarkError) {
        setBookmarksError(bookmarkError.message)
        setBookmarkedProjects([])
        setBookmarksLoading(false)
        return
      }

      const projectIds = (bookmarkRows ?? []).map(
        ({ project_id }) => project_id
      )
      if (projectIds.length === 0) {
        setBookmarkedProjects([])
        setBookmarksLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, slug, name, description, url, github_url, github_stars, github_forks, github_contributors, github_license, github_stats_updated_at, images, tags, socials, is_premium, impressions_count, upvotes_count, created_at"
        )
        .in("id", projectIds)
        .eq("status", "published")

      if (cancelled) return
      if (error) {
        setBookmarksError(error.message)
        setBookmarkedProjects([])
      } else {
        setBookmarkedProjects(
          data.map((project) => ({
            id: project.id,
            slug: project.slug,
            name: project.name,
            description: project.description,
            isNew: false,
            premium: project.is_premium,
            url: project.url,
            githubUrl: project.github_url ?? project.socials?.github,
            githubStats: {
              stars: project.github_stars,
              forks: project.github_forks,
              contributors: project.github_contributors,
              license: project.github_license,
              updatedAt: project.github_stats_updated_at,
            },
            images: (project.images ?? []).map(getProjectImageUrl),
            tags: project.tags ?? [],
            createdAt: project.created_at,
            impressionsCount: project.impressions_count,
            upvotesCount: project.upvotes_count,
            socials: project.socials ?? undefined,
          }))
        )
      }
      setBookmarksLoading(false)
    }

    void loadBookmarks()

    return () => {
      cancelled = true
    }
  }, [activeSection, user])

  function showProjects() {
    setProjectsLoading(true)
    setProjectsError(null)
    setActiveSection("projects")
  }

  function showBookmarks() {
    setBookmarksLoading(true)
    setBookmarksError(null)
    setActiveSection("bookmarks")
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.user_name as string | undefined) ??
    user.email

  return (
    <div className="site-container py-8 sm:py-12">
      <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="flex flex-col border-b pb-6 md:min-h-[28rem] md:border-r md:border-b-0 md:pr-6 md:pb-0">
          <p className="px-3 text-sm font-medium">Account</p>
          <nav
            className="mt-3 flex gap-1 md:flex-col"
            aria-label="Account navigation"
          >
            <Button
              variant="ghost"
              className="flex-1 justify-start md:flex-none"
              asChild
            >
              <Link href="/account/create-project">
                <Plus className="size-4" />
                Create project
              </Link>
            </Button>
            <Button
              variant={activeSection === "settings" ? "secondary" : "ghost"}
              className="flex-1 justify-start md:flex-none"
              onClick={() => setActiveSection("settings")}
            >
              <Settings className="size-4" />
              Settings
            </Button>
            <Button
              variant={activeSection === "projects" ? "secondary" : "ghost"}
              className="flex-1 justify-start md:flex-none"
              onClick={showProjects}
            >
              <FolderKanban className="size-4" />
              My projects
            </Button>
            <Button
              variant={activeSection === "bookmarks" ? "secondary" : "ghost"}
              className="flex-1 justify-start md:flex-none"
              onClick={showBookmarks}
            >
              <Bookmark className="size-4" />
              Bookmarks
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                className="flex-1 justify-start md:flex-none"
                asChild
              >
                <Link href="/account/admin">
                  <ShieldCheck className="size-4" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
          <Button
            variant="ghost"
            className="mt-6 justify-start text-destructive hover:text-destructive md:mt-auto"
            onClick={() => {
              void signOut()
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </aside>

        <main>
          {activeSection === "settings" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Settings</CardTitle>
                <CardDescription>Manage your profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? "Avatar"}
                      width={56}
                      height={56}
                      className="size-14 rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                      {displayName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{displayName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : activeSection === "projects" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">My projects</CardTitle>
                <CardDescription>
                  Projects saved to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button className="w-fit" asChild>
                  <Link href="/account/create-project">
                    <Plus className="size-4" />
                    Create project
                  </Link>
                </Button>
                {projectsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading projects
                  </div>
                ) : projectsError ? (
                  <p className="text-sm text-destructive" role="alert">
                    Could not load projects: {projectsError}
                  </p>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No projects yet.
                  </p>
                ) : (
                  <div className="divide-y rounded-md border">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/account/edit-project?id=${project.id}`}
                        className="block p-4 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {project.name}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {project.description}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {project.impressions_count.toLocaleString()}{" "}
                              impressions
                            </p>
                          </div>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                              {project.is_premium ? "Premium" : "Free"}
                            </span>
                            <span className="rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                              {project.status}
                            </span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <section className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-semibold">Bookmarks</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Projects you have saved.
                </p>
              </div>
              {bookmarksLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading bookmarks
                </div>
              ) : bookmarksError ? (
                <p className="text-sm text-destructive" role="alert">
                  Could not load bookmarks: {bookmarksError}
                </p>
              ) : bookmarkedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookmarked projects yet.
                </p>
              ) : (
                <ProjectsGrid projects={bookmarkedProjects} />
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export { AccountPage }
export default AccountPage
