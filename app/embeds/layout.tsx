import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Embeds",
}

export default function EmbedsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
