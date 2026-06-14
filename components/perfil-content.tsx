"use client"

import { CheckCircle2, Mail, Medal, UserRound } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { GamificationCard } from "@/components/gamification-card"
import { LevelBadge } from "@/components/level-badge"
import BadgeCard from "@/components/badge-card"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  calculateGamification,
  causaSocialLabels,
  formatDate,
  getInitials,
  levelMeta,
  levelOrder,
  roleLabels,
  type Estudante,
  type Ong,
  type Professor,
} from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"
import { cn } from "@/lib/utils"

export function PerfilContent() {
  const { user, role, profile } = useAuth()
  const state = useBackendData()
  const isStudent = role === "estudante"
  const displayName =
    role === "ong" && profile && "razao_social" in profile
      ? profile.razao_social
      : user?.nome ?? "Perfil"
  const subtitle = getSubtitle(role, profile)

  if (!profile) {
    return (
      <EmptyState
        icon={UserRound}
        title="Perfil incompleto"
        description="Complete seu perfil para liberar todas as funções do sistema."
      />
    )
  }

  const gamification = isStudent
    ? calculateGamification(profile as Estudante, state.data)
    : null

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Perfil"
        description="Suas informações e conquistas no Projetão."
      />

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-secondary text-lg font-bold text-secondary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl font-bold">{displayName}</h2>
              {gamification && <LevelBadge level={gamification.level} />}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-4" /> {user?.email}
              </span>
            </div>
          </div>
          <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
            {roleLabels[role]}
          </span>
        </CardContent>
      </Card>

      {gamification ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <GamificationCard compact gamification={gamification} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Níveis</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {levelOrder.map((level) => {
                  const active = level === gamification.level
                  const meta = levelMeta[level]
                  return (
                    <div
                      key={level}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border p-3 transition-all",
                        active ? "bg-secondary/50 shadow-sm" : "border-border",
                      )}
                      style={active ? { borderColor: meta.color } : undefined}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full"
                          style={{
                            color: meta.color,
                            backgroundColor: `${meta.color}1F`,
                          }}
                        >
                          <Medal className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.range}</p>
                        </div>
                      </div>
                      {active && (
                        <span className="shrink-0 text-xs font-semibold text-primary">
                          Atual
                        </span>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projetos concluídos</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {gamification.historico.length ? (
                  gamification.historico.map((item) => (
                    <div
                      key={item.projeto}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-5 shrink-0 text-success" />
                        <div>
                          <p className="font-medium">{item.projeto}</p>
                          <p className="text-sm text-muted-foreground">Projeto concluído</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(item.data)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Você ainda não tem projetos concluídos. Quando uma turma aceita participar de um projeto concluído, ele aparece aqui.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges Conquistadas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {state.data.badges.length ? (
                  state.data.badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Você ainda não possui badges conquistadas.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {getFields(role, profile).map((field) => (
              <div key={field.label}>
                <Field label={field.label} value={field.value} />
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getSubtitle(role: string, profile: unknown) {
  if (!profile) return "Perfil incompleto"
  if (role === "estudante") {
    const student = profile as Estudante
    return `${student.curso} · ${student.universidade_detalhes.nome}`
  }
  if (role === "professor") {
    const professor = profile as Professor
    return `Professor · ${professor.universidade_detalhes.nome}`
  }
  const ong = profile as Ong
  return `ONG · ${causaSocialLabels[ong.causa_social]}`
}

function getFields(role: string, profile: unknown) {
  if (role === "professor") {
    const professor = profile as Professor
    return [
      { label: "Universidade", value: professor.universidade_detalhes.nome },
      { label: "CPF", value: professor.cpf },
      { label: "Nascimento", value: formatDate(professor.data_nascimento) },
      { label: "Telefone", value: professor.telefone || "-" },
      { label: "Lattes", value: professor.lattes || "-" },
    ]
  }

  const ong = profile as Ong
  return [
    { label: "Razão social", value: ong.razao_social },
    { label: "CNPJ", value: ong.cnpj },
    { label: "Causa social", value: causaSocialLabels[ong.causa_social] },
  ]
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
