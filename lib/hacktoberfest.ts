const REPO = "embedcatalog/embedcatalog"

export type GithubIssue = {
  id: number
  number: number
  title: string
  url: string
  createdAt: string
  comments: number
  labels: { name: string; color: string }[]
  author: string
}

export type GithubContributor = {
  login: string
  avatarUrl: string
  url: string
  contributions: number
}

async function githubFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO}${path}`,
      { headers: { Accept: "application/vnd.github+json" } }
    )
    if (!response.ok) {
      console.error(`GitHub request failed: ${path} ${response.status}`)
      return null
    }
    return (await response.json()) as T
  } catch (error) {
    console.error("GitHub request failed:", error)
    return null
  }
}

async function getOpenIssues(): Promise<GithubIssue[]> {
  const data = await githubFetch<
    {
      id: number
      number: number
      title: string
      html_url: string
      created_at: string
      comments: number
      labels: ({ name?: string; color?: string } | string)[]
      user: { login: string } | null
      pull_request?: unknown
    }[]
  >("/issues?state=open&per_page=100")

  return (data ?? [])
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      createdAt: issue.created_at,
      comments: issue.comments,
      labels: issue.labels.flatMap((label) =>
        typeof label === "string" || !label.name
          ? []
          : [{ name: label.name, color: label.color ?? "888888" }]
      ),
      author: issue.user?.login ?? "ghost",
    }))
}

async function getContributors(): Promise<GithubContributor[]> {
  const data = await githubFetch<
    {
      login: string
      avatar_url: string
      html_url: string
      contributions: number
      type: string
    }[]
  >("/contributors?per_page=100")

  return (data ?? [])
    .filter((contributor) => contributor.type === "User")
    .map((contributor) => ({
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      url: contributor.html_url,
      contributions: contributor.contributions,
    }))
}

export { getOpenIssues, getContributors }
