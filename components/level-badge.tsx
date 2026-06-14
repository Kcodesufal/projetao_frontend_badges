import { Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import { levelMeta, type Level } from "@/lib/api"

export function LevelBadge({
  level,
  className,
  showIcon = true,
}: {
  level: Level
  className?: string
  showIcon?: boolean
}) {
  const meta = levelMeta[level]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        className,
      )}
      style={{
        color: meta.color,
        backgroundColor: `${meta.color}1F`,
        boxShadow: `inset 0 0 0 1px ${meta.color}4D`,
      }}
    >
      {showIcon && <Medal className="size-3.5" aria-hidden="true" />}
      {meta.label}
    </span>
  )
}
