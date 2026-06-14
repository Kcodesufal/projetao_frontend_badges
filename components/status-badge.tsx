import {
  CheckCircle2,
  Circle,
  Clock,
  FilePenLine,
  PlayCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Config = {
  label: string
  className: string
  icon: LucideIcon
}

const config: Record<string, Config> = {
  aprovado: {
    label: "Aprovado",
    className: "bg-success/12 text-success",
    icon: CheckCircle2,
  },
  aceita: {
    label: "Aceita",
    className: "bg-success/12 text-success",
    icon: CheckCircle2,
  },
  aceito: {
    label: "Aceito",
    className: "bg-success/12 text-success",
    icon: CheckCircle2,
  },
  concluido: {
    label: "Concluído",
    className: "bg-success/12 text-success",
    icon: CheckCircle2,
  },
  pendente: {
    label: "Pendente",
    className: "bg-warning/15 text-warning",
    icon: Clock,
  },
  pre_aprovado: {
    label: "Pré-aprovado",
    className: "bg-warning/15 text-warning",
    icon: Clock,
  },
  recusado: {
    label: "Recusado",
    className: "bg-destructive/12 text-destructive",
    icon: XCircle,
  },
  recusada: {
    label: "Recusada",
    className: "bg-destructive/12 text-destructive",
    icon: XCircle,
  },
  rascunho: {
    label: "Rascunho",
    className: "bg-muted text-muted-foreground",
    icon: FilePenLine,
  },
  aberto: {
    label: "Aberto",
    className: "bg-secondary text-secondary-foreground",
    icon: Circle,
  },
  em_andamento: {
    label: "Em andamento",
    className: "bg-primary/12 text-primary",
    icon: PlayCircle,
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-destructive/12 text-destructive",
    icon: XCircle,
  },
  ativo: {
    label: "Ativo",
    className: "bg-secondary text-secondary-foreground",
    icon: Circle,
  },
  inativo: {
    label: "Inativo",
    className: "bg-muted text-muted-foreground",
    icon: Circle,
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const item = config[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
    icon: Circle,
  }
  const Icon = item.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        item.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {item.label}
    </span>
  )
}
