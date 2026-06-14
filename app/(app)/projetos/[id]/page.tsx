"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  GraduationCap,
  ListChecks,
  Pencil,
  type LucideIcon,
  Plus,
  Save,
  SendHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/components/toast-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  apiFetch,
  formatDate,
  projetoStatusLabels,
  type Atividade,
  type Professor,
  type Projeto,
  type ProjetoStatus,
} from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

const tiposAtividade = ["pratica", "teorica", "workshop", "pesquisa", "extensao"] as const
const tipoLabels: Record<(typeof tiposAtividade)[number], string> = {
  pratica: "Prática",
  teorica: "Teórica",
  workshop: "Workshop",
  pesquisa: "Pesquisa",
  extensao: "Extensão",
}

const emptyProjectForm = {
  nome: "",
  descricao: "",
  objetivo: "",
  publico_alvo: "",
  status: "aberto" as ProjetoStatus,
  data_inicio: "",
  data_fim: "",
  carga_horaria: "20",
  vagas_turmas: "1",
}

const emptyActivityForm = {
  nome: "",
  descricao: "",
  tipo: "pratica",
  carga_horaria: "4",
  data_inicio: "",
  data_fim: "",
  vagas: "1",
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}

function projectToForm(project: Projeto) {
  return {
    nome: project.nome,
    descricao: project.descricao,
    objetivo: project.objetivo,
    publico_alvo: project.publico_alvo,
    status: project.status,
    data_inicio: project.data_inicio,
    data_fim: project.data_fim,
    carga_horaria: String(project.carga_horaria),
    vagas_turmas: String(project.vagas_turmas),
  }
}

function activityToForm(activity: Atividade) {
  return {
    nome: activity.nome,
    descricao: activity.descricao,
    tipo: activity.tipo,
    carga_horaria: String(activity.carga_horaria),
    data_inicio: activity.data_inicio,
    data_fim: activity.data_fim,
    vagas: String(activity.vagas),
  }
}

export default function ProjetoDetalhePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params.id)
  const { session, role, profile } = useAuth()
  const { notify } = useToast()
  const state = useBackendData()
  const project = state.data.projetos.find((item) => item.id === id)
  const atividades = useMemo(
    () => state.data.atividades.filter((atividade) => atividade.projeto_nome === project?.nome),
    [project?.nome, state.data.atividades],
  )
  const [creatingActivity, setCreatingActivity] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null)
  const [projectForm, setProjectForm] = useState(emptyProjectForm)
  const [activityForm, setActivityForm] = useState(emptyActivityForm)
  const [activityEditForm, setActivityEditForm] = useState(emptyActivityForm)
  const [applicationForm, setApplicationForm] = useState({
    turma: "",
    atividade: "",
    justificativa: "",
  })
  const [status, setStatus] = useState<ProjetoStatus>("aberto")
  const [equipe, setEquipe] = useState<any[]>([])
  const [badgeTarget, setBadgeTarget] = useState<{ estudante: number; nome: string; aplicacao: number } | null>(null)
  const [badgeForm, setBadgeForm] = useState({ tipo: "Liderança", nivel: "I", justificativa: "" })

  const tiposBadge = ["Liderança", "Trabalho em Equipe", "Comunicação", "Organização", "Proatividade", "Impacto Social", "Ensino e Capacitação", "Inovação"] as const
  const niveisBadge = ["I", "II", "III"] as const

  const equipeByAtividade = equipe.reduce<Record<string, { nome: string; membros: any[] }>>((acc, m) => {
    const key = String(m.atividade)
    if (!acc[key]) acc[key] = { nome: m.atividade_nome, membros: [] }
    acc[key].membros.push(m)
    return acc
  }, {})

  const isOwnOng =
    role === "ong" &&
    profile &&
    "razao_social" in profile &&
    project?.ong_nome === profile.razao_social

  const projectOpen = project?.status === "aberto" || project?.status === "em_andamento"

  useEffect(() => {
    if (!project) return
    setStatus(project.status)
    setProjectForm(projectToForm(project))

    if (session?.access) {
      apiFetch<any[]>(`/projetos/${id}/equipe/`, { token: session.access })
        .then((data) => setEquipe(data))
        .catch((err) => console.error("Could not fetch equipe", err))
    }
  }, [project, session?.access, id])

  function updateActivity(key: keyof typeof activityForm, value: string) {
    setActivityForm((current) => ({ ...current, [key]: value }))
  }

  function updateProject(key: keyof typeof projectForm, value: string) {
    setProjectForm((current) => ({ ...current, [key]: value }))
  }

  function updateActivityEdit(key: keyof typeof activityEditForm, value: string) {
    setActivityEditForm((current) => ({ ...current, [key]: value }))
  }

  async function createActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !project) return
    try {
      await apiFetch<Atividade>("/atividades/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          projeto: project.id,
          nome: activityForm.nome,
          descricao: activityForm.descricao,
          tipo: activityForm.tipo,
          carga_horaria: Number(activityForm.carga_horaria),
          data_inicio: activityForm.data_inicio,
          data_fim: activityForm.data_fim,
          vagas: Number(activityForm.vagas),
        }),
      })
      notify({ kind: "success", title: "Atividade criada" })
      setCreatingActivity(false)
      setActivityForm(emptyActivityForm)
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível criar a atividade",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !project) return
    try {
      await apiFetch(`/projetos/${project.id}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({
          nome: projectForm.nome,
          descricao: projectForm.descricao,
          objetivo: projectForm.objetivo,
          publico_alvo: projectForm.publico_alvo,
          status: projectForm.status,
          data_inicio: projectForm.data_inicio,
          data_fim: projectForm.data_fim,
          carga_horaria: Number(projectForm.carga_horaria),
          vagas_turmas: Number(projectForm.vagas_turmas),
        }),
      })
      notify({ kind: "success", title: "Projeto atualizado" })
      setEditingProject(false)
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar o projeto",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteProject() {
    if (!session?.access || !project) return
    const ok = window.confirm(`Excluir o projeto "${project.nome}"? Esta ação remove o projeto do backend.`)
    if (!ok) return
    try {
      await apiFetch(`/projetos/${project.id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Projeto excluído" })
      router.push("/projetos")
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível excluir o projeto",
        description: err instanceof Error ? err.message : "Ele pode estar vinculado a atividades ou aplicações.",
      })
    }
  }

  function startEditActivity(activity: Atividade) {
    setEditingActivityId(activity.id)
    setActivityEditForm(activityToForm(activity))
  }

  async function saveActivity(activityId: number) {
    if (!session?.access) return
    try {
      await apiFetch(`/atividades/${activityId}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({
          nome: activityEditForm.nome,
          descricao: activityEditForm.descricao,
          tipo: activityEditForm.tipo,
          carga_horaria: Number(activityEditForm.carga_horaria),
          data_inicio: activityEditForm.data_inicio,
          data_fim: activityEditForm.data_fim,
          vagas: Number(activityEditForm.vagas),
        }),
      })
      notify({ kind: "success", title: "Atividade atualizada" })
      setEditingActivityId(null)
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar a atividade",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteActivity(activity: Atividade) {
    if (!session?.access) return
    const ok = window.confirm(`Excluir a atividade "${activity.nome}"?`)
    if (!ok) return
    try {
      await apiFetch(`/atividades/${activity.id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Atividade excluída" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível excluir a atividade",
        description: err instanceof Error ? err.message : "Ela pode estar vinculada a aplicações.",
      })
    }
  }

  async function updateProjectStatus() {
    if (!session?.access || !project) return
    try {
      await apiFetch(`/projetos/${project.id}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({ status }),
      })
      notify({ kind: "success", title: "Status atualizado" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar o projeto",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function removerEstudante(aplicacaoId: number, estudanteId: number, nome: string) {
    if (!session?.access) return
    const ok = window.confirm(`Remover ${nome} desta atividade? A inscrição dele na turma acadêmica será mantida.`)
    if (!ok) return
    try {
      await apiFetch(`/aplicacoes/${aplicacaoId}/rejeitar-estudante/`, {
        method: "POST",
        token: session.access,
        body: JSON.stringify({ estudante_id: estudanteId }),
      })
      notify({ kind: "success", title: "Estudante removido da atividade" })
      // Recarregar equipe
      apiFetch<any[]>(`/projetos/${id}/equipe/`, { token: session.access }).then(setEquipe)
    } catch (err) {
      notify({ kind: "error", title: "Não foi possível remover o estudante", description: err instanceof Error ? err.message : "Tente novamente." })
    }
  }

  async function emitirBadge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !badgeTarget) return
    try {
      await apiFetch("/badges/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          estudante: badgeTarget.estudante,
          tipo: badgeForm.tipo,
          nivel: badgeForm.nivel,
          descricao: badgeForm.tipo,
          justificativa: badgeForm.justificativa,
        }),
      })
      notify({ kind: "success", title: `Badge emitido para ${badgeTarget.nome}!` })
      setBadgeTarget(null)
      setBadgeForm({ tipo: "Liderança", nivel: "I", justificativa: "" })
    } catch (err) {
      notify({ kind: "error", title: "Não foi possível emitir o badge", description: err instanceof Error ? err.message : "Tente novamente." })
    }
  }

  async function createApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !profile) return
    try {
      await apiFetch("/aplicacoes/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          professor: (profile as Professor).id,
          turma: Number(applicationForm.turma),
          atividade: Number(applicationForm.atividade),
          justificativa: applicationForm.justificativa,
        }),
      })
      notify({
        kind: "success",
        title: "Aplicação enviada",
        description: "A ONG poderá aprovar ou recusar a solicitação.",
      })
      setApplicationForm({ turma: "", atividade: "", justificativa: "" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível enviar a aplicação",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  if (state.loading) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />
  }

  if (!project) {
    return (
      <EmptyState
        icon={Building2}
        title="Projeto não encontrado"
        description="Ele pode ter sido removido ou ainda não foi carregado pelo backend."
      />
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <Link
        href="/projetos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para projetos
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Building2 className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={project.status} />
                  {isOwnOng && (
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        variant={editingProject ? "secondary" : "ghost"}
                        onClick={() => setEditingProject((value) => !value)}
                        aria-label={editingProject ? "Fechar edição" : "Editar projeto"}
                      >
                        {editingProject ? <X className="size-4" /> : <Pencil className="size-4" />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={deleteProject}
                        aria-label="Excluir projeto"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <h1 className="mt-4 text-balance font-heading text-2xl font-bold sm:text-3xl">
                {project.nome}
              </h1>
              <p className="mt-1 text-muted-foreground">{project.ong_nome}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {project.publico_alvo}
                </Badge>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {project.carga_horaria}h
                </Badge>
              </div>
              <Separator className="my-5" />
              {editingProject ? (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProject}>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_nome">Nome do projeto</Label>
                    <Input
                      id="projeto_nome"
                      value={projectForm.nome}
                      onChange={(event) => updateProject("nome", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_publico">Público-alvo</Label>
                    <Input
                      id="projeto_publico"
                      value={projectForm.publico_alvo}
                      onChange={(event) => updateProject("publico_alvo", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label htmlFor="projeto_descricao">Descrição</Label>
                    <Textarea
                      id="projeto_descricao"
                      value={projectForm.descricao}
                      onChange={(event) => updateProject("descricao", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label htmlFor="projeto_objetivo">Objetivo</Label>
                    <Textarea
                      id="projeto_objetivo"
                      value={projectForm.objetivo}
                      onChange={(event) => updateProject("objetivo", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_status">Status</Label>
                    <select
                      id="projeto_status"
                      value={projectForm.status}
                      onChange={(event) => updateProject("status", event.target.value)}
                      className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {Object.entries(projetoStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_carga">Carga horária</Label>
                    <Input
                      id="projeto_carga"
                      type="number"
                      min="1"
                      value={projectForm.carga_horaria}
                      onChange={(event) => updateProject("carga_horaria", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_inicio">Início</Label>
                    <Input
                      id="projeto_inicio"
                      type="date"
                      value={projectForm.data_inicio}
                      onChange={(event) => updateProject("data_inicio", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_fim">Fim</Label>
                    <Input
                      id="projeto_fim"
                      type="date"
                      value={projectForm.data_fim}
                      onChange={(event) => updateProject("data_fim", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="projeto_vagas">Vagas para turmas</Label>
                    <Input
                      id="projeto_vagas"
                      type="number"
                      min="1"
                      value={projectForm.vagas_turmas}
                      onChange={(event) => updateProject("vagas_turmas", event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setEditingProject(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="size-4" />
                      Salvar projeto
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="font-heading text-lg font-semibold">Sobre o projeto</h2>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {project.descricao}
                  </p>
                  <h2 className="mt-5 font-heading text-lg font-semibold">Objetivo</h2>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {project.objetivo}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="size-5 text-primary" />
                Atividades
              </CardTitle>
              {isOwnOng && (
                <Button size="sm" onClick={() => setCreatingActivity((value) => !value)}>
                  <Plus className="size-4" />
                  Atividade
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {creatingActivity && (
                <form className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2" onSubmit={createActivity}>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="atividade_nome">Nome</Label>
                    <Input id="atividade_nome" value={activityForm.nome} onChange={(event) => updateActivity("nome", event.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select id="tipo" value={activityForm.tipo} onChange={(event) => updateActivity("tipo", event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                      {tiposAtividade.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipoLabels[tipo]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="atividade_descricao">Descrição</Label>
                    <Textarea id="atividade_descricao" value={activityForm.descricao} onChange={(event) => updateActivity("descricao", event.target.value)} required />
                  </div>
                  <Input type="date" value={activityForm.data_inicio} onChange={(event) => updateActivity("data_inicio", event.target.value)} required />
                  <Input type="date" value={activityForm.data_fim} onChange={(event) => updateActivity("data_fim", event.target.value)} required />
                  <Input type="number" min="1" value={activityForm.carga_horaria} onChange={(event) => updateActivity("carga_horaria", event.target.value)} required />
                  <Input type="number" min="1" value={activityForm.vagas} onChange={(event) => updateActivity("vagas", event.target.value)} required />
                  <div className="sm:col-span-2">
                    <Button type="submit">Salvar atividade</Button>
                  </div>
                </form>
              )}

              {atividades.length ? (
                atividades.map((atividade) => {
                  const editing = editingActivityId === atividade.id
                  return (
                  <div
                    key={atividade.id}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/60"
                  >
                    {editing ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`atividade_${atividade.id}_nome`}>Nome</Label>
                          <Input
                            id={`atividade_${atividade.id}_nome`}
                            value={activityEditForm.nome}
                            onChange={(event) => updateActivityEdit("nome", event.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`atividade_${atividade.id}_tipo`}>Tipo</Label>
                          <select
                            id={`atividade_${atividade.id}_tipo`}
                            value={activityEditForm.tipo}
                            onChange={(event) => updateActivityEdit("tipo", event.target.value)}
                            className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            {tiposAtividade.map((tipo) => (
                              <option key={tipo} value={tipo}>
                                {tipoLabels[tipo]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <Label htmlFor={`atividade_${atividade.id}_descricao`}>Descrição</Label>
                          <Textarea
                            id={`atividade_${atividade.id}_descricao`}
                            value={activityEditForm.descricao}
                            onChange={(event) => updateActivityEdit("descricao", event.target.value)}
                            required
                          />
                        </div>
                        <Input type="date" value={activityEditForm.data_inicio} onChange={(event) => updateActivityEdit("data_inicio", event.target.value)} required />
                        <Input type="date" value={activityEditForm.data_fim} onChange={(event) => updateActivityEdit("data_fim", event.target.value)} required />
                        <Input type="number" min="1" value={activityEditForm.carga_horaria} onChange={(event) => updateActivityEdit("carga_horaria", event.target.value)} required />
                        <Input type="number" min="1" value={activityEditForm.vagas} onChange={(event) => updateActivityEdit("vagas", event.target.value)} required />
                        <div className="flex justify-end gap-2 sm:col-span-2">
                          <Button type="button" variant="outline" onClick={() => setEditingActivityId(null)}>
                            Cancelar
                          </Button>
                          <Button type="button" onClick={() => saveActivity(atividade.id)}>
                            <Save className="size-4" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                    <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{atividade.nome}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{atividade.descricao}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {tipoLabels[atividade.tipo]} · {atividade.carga_horaria}h · {formatDate(atividade.data_inicio)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{atividade.vagas} vagas</Badge>
                      {isOwnOng && (
                        <div className="flex gap-1">
                          <Button size="icon-sm" variant="ghost" onClick={() => startEditActivity(atividade)} aria-label="Editar atividade">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon-sm" variant="destructive" onClick={() => deleteActivity(atividade)} aria-label="Excluir atividade">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                    )}
                  </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">Este projeto ainda não tem atividades cadastradas.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Info icon={Users} label="Vagas para turmas" value={String(project.vagas_turmas)} />
              <Info icon={Clock3} label="Carga horária" value={`${project.carga_horaria}h`} />
              <Info icon={CalendarDays} label="Período" value={`${formatDate(project.data_inicio)} - ${formatDate(project.data_fim)}`} />
              <Info icon={ListChecks} label="Atividades" value={String(atividades.length)} />
            </CardContent>
          </Card>

          {equipe.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Equipe Alocada
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {Object.entries(equipeByAtividade).map(([ativId, grupo]) => (
                  <div key={ativId} className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{grupo.nome}</p>
                    {grupo.membros.map((membro) => (
                      <div key={membro.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{membro.estudante_nome}</span>
                          <span className="text-xs text-muted-foreground">{membro.turma_nome} · {membro.universidade_nome}</span>
                        </div>
                        {isOwnOng && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBadgeTarget({ estudante: membro.estudante, nome: membro.estudante_nome, aplicacao: membro.aplicacao_id })
                                setBadgeForm({ tipo: "Liderança", nivel: "I", justificativa: "" })
                              }}
                            >
                              🏅 Premiar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removerEstudante(membro.aplicacao_id, membro.estudante, membro.estudante_nome)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Badge modal overlay */}
          {badgeTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
              <Card className="w-full max-w-md animate-fade-up shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>🏅 Premiar {badgeTarget.nome}</span>
                    <Button size="sm" variant="ghost" onClick={() => setBadgeTarget(null)}>
                      <X className="size-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="flex flex-col gap-4" onSubmit={emitirBadge}>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="badge_tipo">Tipo de Badge</Label>
                      <select
                        id="badge_tipo"
                        value={badgeForm.tipo}
                        onChange={(e) => setBadgeForm((f) => ({ ...f, tipo: e.target.value }))}
                        className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        required
                      >
                        {tiposBadge.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="badge_nivel">Nível</Label>
                      <select
                        id="badge_nivel"
                        value={badgeForm.nivel}
                        onChange={(e) => setBadgeForm((f) => ({ ...f, nivel: e.target.value }))}
                        className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        required
                      >
                        {niveisBadge.map((n) => <option key={n} value={n}>Nível {n}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="badge_justificativa">Justificativa</Label>
                      <Textarea
                        id="badge_justificativa"
                        value={badgeForm.justificativa}
                        onChange={(e) => setBadgeForm((f) => ({ ...f, justificativa: e.target.value }))}
                        placeholder="Descreva o motivo do badge..."
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setBadgeTarget(null)}>Cancelar</Button>
                      <Button type="submit">Emitir Badge</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {role === "professor" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SendHorizontal className="size-5 text-primary" />
                  Aplicar turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!projectOpen ? (
                  <p className="text-sm text-muted-foreground">
                    Este projeto não está aberto para aplicações.
                  </p>
                ) : (
                  <form className="flex flex-col gap-3" onSubmit={createApplication}>
                    <select
                      value={applicationForm.turma}
                      onChange={(event) => setApplicationForm((current) => ({ ...current, turma: event.target.value }))}
                      className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      required
                    >
                      <option value="">Selecione a turma</option>
                      {state.myTurmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>{turma.nome} · {turma.semestre}</option>
                      ))}
                    </select>
                    <select
                      value={applicationForm.atividade}
                      onChange={(event) => setApplicationForm((current) => ({ ...current, atividade: event.target.value }))}
                      className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      required
                    >
                      <option value="">Selecione a atividade</option>
                      {atividades.map((atividade) => (
                        <option key={atividade.id} value={atividade.id}>{atividade.nome}</option>
                      ))}
                    </select>
                    <Textarea
                      value={applicationForm.justificativa}
                      onChange={(event) => setApplicationForm((current) => ({ ...current, justificativa: event.target.value }))}
                      placeholder="Explique por que sua turma combina com esta atividade."
                    />
                    <Button type="submit" className="w-full">
                      <SendHorizontal className="size-4" />
                      Enviar aplicação
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {isOwnOng && (
            <Card>
              <CardHeader>
                <CardTitle>Atualizar status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProjetoStatus)}
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {Object.entries(projetoStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <Button onClick={updateProjectStatus}>Salvar status</Button>
              </CardContent>
            </Card>
          )}

          {role === "estudante" && (
            <Card>
              <CardHeader>
                <CardTitle>Participação</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  A participação acontece pela inscrição em uma turma. Depois, o professor aplica a turma em atividades.
                </p>
                <Button asChild className="w-full">
                  <Link href="/turmas">
                    <GraduationCap className="size-4" />
                    Ver turmas
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
