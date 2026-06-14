import Link from "next/link"
import { ArrowRight, Building2, Clock3, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, type Projeto } from "@/lib/api"

export function ProjectCard({
  project,
  atividades = 0,
}: {
  project: Projeto
  atividades?: number
}) {
  return (
    <Card className="interactive-card group">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex-1">
          <h3 className="font-heading text-lg font-semibold leading-snug">
            {project.nome}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{project.ong_nome}</p>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.descricao}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {project.publico_alvo}
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {atividades} atividades
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" aria-hidden="true" />
            {project.vagas_turmas} turmas
          </span>
          <span className="flex items-center justify-end gap-1.5">
            <Clock3 className="size-4" aria-hidden="true" />
            {project.carga_horaria}h
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(project.data_inicio)} - {formatDate(project.data_fim)}</span>
          <Link
            href={`/projetos/${project.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-1.5"
          >
            Ver detalhes
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
