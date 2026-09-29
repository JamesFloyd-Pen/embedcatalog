"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bookmark, LoaderCircle } from "lucide-react"

import { useAuth } from "components/auth-provider"
import { Button } from "components/ui/button"
import { supabase } from "lib/supabase/client"

function ProjectBookmark({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [resolvedUserId, setResolvedUserId] = React.useState<string | null>(
    null
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const requestInProgress = React.useRef(false)

  React.useEffect(() => {
    if (!user) return

    let cancelled = false
    supabase
      .from("project_bookmarks")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsBookmarked(Boolean(data))
        setResolvedUserId(user.id)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, user])

  async function toggleBookmark() {
    if (!user) {
      router.push("/login")
      return
    }
    if (requestInProgress.current || resolvedUserId !== user.id) return

    requestInProgress.current = true
    setSaving(true)
    setError(null)

    const result = isBookmarked
      ? await supabase
          .from("project_bookmarks")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", user.id)
      : await supabase
          .from("project_bookmarks")
          .insert({ project_id: projectId, user_id: user.id })

    if (result.error) {
      setError("Could not update your bookmark. Please try again.")
    } else {
      setIsBookmarked(!isBookmarked)
    }

    setSaving(false)
    requestInProgress.current = false
  }

  const checkingBookmark = Boolean(user) && resolvedUserId !== user?.id

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={isBookmarked ? "secondary" : "outline"}
        size="icon"
        onClick={() => void toggleBookmark()}
        disabled={authLoading || checkingBookmark || saving}
        aria-label={
          isBookmarked
            ? "Remove project bookmark"
            : user
              ? "Bookmark project"
              : "Sign in to bookmark project"
        }
        aria-pressed={isBookmarked}
        title={
          isBookmarked
            ? "Remove project bookmark"
            : user
              ? "Bookmark project"
              : "Sign in to bookmark"
        }
      >
        {saving || checkingBookmark ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Bookmark
            className="size-4"
            fill={isBookmarked ? "currentColor" : "none"}
          />
        )}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { ProjectBookmark }
