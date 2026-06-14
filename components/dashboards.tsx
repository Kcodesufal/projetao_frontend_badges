"use client"

import Link from "next/link"
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  Plus,
  SendHorizontal,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { GamificationCard } from "@/components/gamification-card"
import { PageHeader } from "@/components/page-header"
import { ProjectCard } from "@/components/project-card"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/components/auth-provider"
import { calculateGamification, formatDate } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

function LoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}

export function Dashboards() {
  const { role } = useAuth()
  const state = useBackendData()

  if (state.loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Carregando painel" description="Buscando dados do backend." />
        <LoadingCards />
      </div>
    )
  }

  if (state.error) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Não foi possível carregar o dashboard"
        description={state.error}
        action={<Button onClick={() => state.reload()}>Tentar novamente</Button>}
      />
    )
  }

  if (role === "estudante") return <StudentDashboard state={state} />
  if (role === "professor") return <TeacherDashboard state={state} />
  return <NgoDashboard state={state} />
}

function StudentDashboard({ state }: { state: ReturnType<typeof useBackendData> }) {
  const { user } = useAuth()
  const gamification = calculateGamification(state.student, state.data)
  const accepted = state.myInscricoes.filter((item) => item.status === "aceito")
  const pending = state.myInscricoes.filter((item) => item.status === "pre_aprovado")

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title={`Olá, ${user?.nome?.split(" ")[0] ?? "estudante"}`}
        description="Acompanhe suas inscrições, turmas e evolução nos projetos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Turmas aceitas" value={accepted.length} icon={GraduationCap} />
        <StatCard label="Inscrições" value={state.myInscricoes.length} icon={ClipboardList} hint={`${pending.length} aguardando`} />
        <StatCard label="Projetos concluídos" value={gamification.projetosConcluidos} icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GamificationCard gamification={gamification} />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Suas inscrições recentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/inscricoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state.myInscricoes.slice(0, 4).length ? (
              state.myInscricoes.slice(0, 4).map((inscricao) => (
                <div
                  key={inscricao.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{inscricao.turma_nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {inscricao.universidade_nome} · {formatDate(inscricao.data_inscricao)}
                    </p>
                  </div>
                  <StatusBadge status={inscricao.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Você ainda não se inscreveu em nenhuma turma.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Projetos para explorar</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/projetos">Explorar</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.projetos.slice(0, 3).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              atividades={state.data.atividades.filter((item) => item.projeto_nome === project.nome).length}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function TeacherDashboard({ state }: { state: ReturnType<typeof useBackendData> }) {
  const { user } = useAuth()
  const pendingStudents = state.myInscricoes.filter((item) => item.status === "pre_aprovado")
  const pendingApps = state.myAplicacoes.filter((item) => item.status === "pendente")
  const studentsCount = state.myInscricoes.filter((item) => item.status === "aceito").length

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title={`Olá, ${user?.nome?.split(" ")[0] ?? "professor"}`}
        description="Gerencie turmas, aprove estudantes e acompanhe aplicações."
        actions={
          <Button asChild>
            <Link href="/turmas">
              <Plus className="size-4" />
              Criar turma
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Turmas" value={state.myTurmas.length} icon={GraduationCap} />
        <StatCard label="Estudantes aceitos" value={studentsCount} icon={Users} />
        <StatCard label="Aplicações" value={state.myAplicacoes.length} icon={SendHorizontal} hint={`${pendingApps.length} aguardando`} />
        <StatCard label="Inscrições pendentes" value={pendingStudents.length} icon={ClipboardList} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Suas turmas</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/turmas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state.myTurmas.slice(0, 5).map((turma) => (
              <div key={turma.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{turma.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {turma.semestre} · {turma.modalidade}
                    </p>
                  </div>
                  <StatusBadge status={turma.ativa ? "ativo" : "inativo"} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Aplicações em andamento</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/aplicacoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state.myAplicacoes.slice(0, 5).map((aplicacao) => (
              <div key={aplicacao.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{aplicacao.projeto_nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {aplicacao.turma_nome} · {aplicacao.atividade_nome}
                  </p>
                </div>
                <StatusBadge status={aplicacao.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NgoDashboard({ state }: { state: ReturnType<typeof useBackendData> }) {
  const { profile, user } = useAuth()
  const displayName = profile && "razao_social" in profile ? profile.razao_social : user?.nome
  const ownActivities = state.data.atividades.filter((atividade) =>
    state.myProjetos.some((projeto) => projeto.nome === atividade.projeto_nome),
  )
  const pendingApps = state.myAplicacoes.filter((item) => item.status === "pendente")

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title={`Olá, ${displayName ?? "ONG"}`}
        description="Gerencie projetos, atividades e aplicações de professores."
        actions={
          <Button asChild>
            <Link href="/projetos">
              <Plus className="size-4" />
              Criar projeto
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projetos" value={state.myProjetos.length} icon={FolderKanban} />
        <StatCard label="Atividades" value={ownActivities.length} icon={CalendarDays} />
        <StatCard label="Aplicações" value={state.myAplicacoes.length} icon={SendHorizontal} />
        <StatCard label="Pendentes" value={pendingApps.length} icon={ClipboardList} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Aplicações aguardando aprovação</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/aplicacoes">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendingApps.length ? (
            pendingApps.slice(0, 5).map((aplicacao) => (
              <div key={aplicacao.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {aplicacao.professor_nome} · {aplicacao.turma_nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {aplicacao.projeto_nome} · {aplicacao.atividade_nome}
                  </p>
                </div>
                <StatusBadge status={aplicacao.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma aplicação pendente por aqui.</p>
          )}
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 font-heading text-xl font-bold">Seus projetos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.myProjetos.slice(0, 3).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              atividades={state.data.atividades.filter((item) => item.projeto_nome === project.nome).length}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
