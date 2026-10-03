"use client"

import * as React from "react"
import { ArrowUp, Eye } from "lucide-react"

import { supabase } from "lib/supabase/client"

function ProjectLiveStats({
  projectId,
  initialImpressions,
  initialUpvotes,
}: {
  projectId: string
  initialImpressions: number
  initialUpvotes: number
}) {
  const [stats, setStats] = React.useState({
    impressions: initialImpressions,
    upvotes: initialUpvotes,
  })

  React.useEffect(() => {
    let cancelled = false

    supabase
      .from("projects")
      .select("impressions_count, upvotes_count")
      .eq("id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return
        setStats({
          impressions: data.impressions_count,
          upvotes: data.upvotes_count,
        })
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1">
        <Eye className="size-3.5" />
        {stats.impressions.toLocaleString("en-US")}
      </span>
      <span className="inline-flex items-center gap-1">
        <ArrowUp className="size-3.5" />
        {stats.upvotes.toLocaleString("en-US")}
      </span>
    </div>
  )
}

export { ProjectLiveStats }
