"use client"

import Link from "next/link"
import { Bell, CheckCircle2, CircleAlert, CircleX, Info } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { buildNotifications } from "@/lib/notifications"
import { useBackendData } from "@/lib/use-backend-data"
import { formatDate } from "@/lib/api"
import { cn } from "@/lib/utils"

const kindMeta = {
  info: {
    label: "Informação",
    icon: Info,
    className: "bg-primary/10 text-primary",
  },
  success: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-success/10 text-success",
  },
  warning: {
    label: "Pendente",
    icon: CircleAlert,
    className: "bg-warning/10 text-warning",
  },
  danger: {
    label: "Atenção",
    icon: CircleX,
    className: "bg-destructive/10 text-destructive",
  },
}

export default function NotificacoesPage() {
  const { role, profile } = useAuth()
  const state = useBackendData()
  const notifications = buildNotifications(role, profile, state.data)

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Notificações"
        description="Acompanhe pendências, respostas e atualizações importantes do sistema."
      />

      {state.loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificação"
          description="Quando houver uma atualização importante, ela aparecerá aqui."
        />
      ) : (
        <div className="grid gap-3">
          {notifications.map((item) => {
            const meta = kindMeta[item.kind]
            const Icon = meta.icon
            return (
              <Card key={item.id} className="interactive-card">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-lg",
                      meta.className,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-base font-semibold">{item.title}</h2>
                      <StatusBadge status={meta.label} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    {item.date && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Atualizado em {formatDate(item.date)}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="sm:self-center">
                    <Link href={item.href}>Abrir</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
