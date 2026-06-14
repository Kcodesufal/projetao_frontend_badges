import Link from "next/link"
import { Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

export function Brand({
  className,
  href = "/dashboard",
  tone = "default",
}: {
  className?: string
  href?: string
  tone?: "default" | "light"
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-heading", className)}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          tone === "light"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Sprout className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-normal",
          tone === "light" ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        Projetão
      </span>
    </Link>
  )
}
