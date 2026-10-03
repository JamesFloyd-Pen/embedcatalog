"use client"

import * as React from "react"
import Link from "next/link"
import { X } from "lucide-react"

const STORAGE_KEY = "hacktoberfest-2026-banner-dismissed"

function HacktoberfestBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // storage unavailable, banner returns on next visit
    }
  }

  return (
    <div className="relative border-b bg-accent px-10 py-2 text-center text-sm">
      <Link href="/hacktoberfest-2026" className="font-medium hover:underline">
        EmbedCatalog is participating in Hacktoberfest 2026. More →
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export { HacktoberfestBanner }
