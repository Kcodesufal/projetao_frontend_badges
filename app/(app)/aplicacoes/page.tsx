"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus, SendHorizontal, Trash2, Users, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { apiFetch, formatDate, type Professor } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}

export default function AplicacoesPage() {
  const { session, role, profile } = useAuth()
  const { notify } = useToast()
  const state = useBackendData()
  const isNgo = role === "ong"
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ turma: "", atividade: "", justificativa: "" })
  const [feedback, setFeedback] = useState<Record<number, string>>({})

  const openActivities = useMemo(() => {
    const openProjectNames = new Set(
      state.data.projetos
        .filter((project) => project.status === "aberto" || project.status === "em_andamento")
        .map((project) => project.nome),
    )
    return state.data.atividades.filter((activity) => openProjectNames.has(activity.projeto_nome))
  }, [state.data.atividades, state.data.projetos])

  async function createApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || role !== "professor" || !profile) return
    try {
      await apiFetch("/aplicacoes/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          professor: (profile as Professor).id,
          turma: Number(form.turma),
          atividade: Number(form.atividade),
          justificativa: form.justificativa,
        }),
      })
      notify({ kind: "success", title: "Aplicação enviada" })
      setCreating(false)
      setForm({ turma: "", atividade: "", justificativa: "" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível enviar a aplicação",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function updateApplication(id: number, status: "aceita" | "recusada") {
    if (!session?.access) return
    try {
      await apiFetch(`/aplicacoes/${id}/status/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({
          status,
          feedback_ong: feedback[id] ?? "",
        }),
      })
      notify({ kind: "success", title: status === "aceita" ? "Aplicação aprovada" : "Aplicação recusada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar a aplicação",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteApplication(id: number) {
    if (!session?.access || role !== "professor") return
    const ok = window.confirm("Cancelar esta aplicação?")
    if (!ok) return
    try {
      await apiFetch(`/aplicacoes/${id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Aplicação cancelada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível cancelar a aplicação",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Aplicações"
        description={
          isNgo
            ? "Aprove ou recuse as turmas que aplicaram aos seus projetos."
            : "Acompanhe e envie aplicações das suas turmas em atividades."
        }
        actions={
          !isNgo ? (
            <Button onClick={() => setCreating((value) => !value)}>
              {creating ? <X className="size-4" /> : <Plus className="size-4" />}
              {creating ? "Fechar" : "Nova aplicação"}
            </Button>
          ) : undefined
        }
      />

      {creating && (
        <Card className="animate-fade-up">
          <CardContent className="p-5">
            <form className="grid gap-4 lg:grid-cols-3" onSubmit={createApplication}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="turma">Turma</Label>
                <select
                  id="turma"
                  value={form.turma}
                  onChange={(event) => setForm((current) => ({ ...current, turma: event.target.value }))}
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  <option value="">Selecione</option>
                  {state.myTurmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>{turma.nome} · {turma.semestre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="atividade">Atividade</Label>
                <select
                  id="atividade"
                  value={form.atividade}
                  onChange={(event) => setForm((current) => ({ ...current, atividade: event.target.value }))}
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  <option value="">Selecione</option>
                  {openActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>{activity.projeto_nome} · {activity.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-3">
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  value={form.justificativa}
                  onChange={(event) => setForm((current) => ({ ...current, justificativa: event.target.value }))}
                  placeholder="Explique como a turma pode contribuir."
                />
              </div>
              <div className="flex justify-end lg:col-span-3">
                <Button type="submit">Enviar aplicação</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {state.loading ? (
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      ) : state.myAplicacoes.length === 0 ? (
        <EmptyState
          icon={SendHorizontal}
          title="Nenhuma aplicação por aqui"
          description={isNgo ? "Quando professores aplicarem turmas aos seus projetos, elas aparecerão aqui." : "Envie uma aplicação para começar."}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isNgo && <TableHead>Professor</TableHead>}
                <TableHead>Projeto</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">{isNgo ? "Ações" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.myAplicacoes.map((aplicacao) => (
                <TableRow key={aplicacao.id}>
                  {isNgo && <TableCell className="font-medium">{aplicacao.professor_nome}</TableCell>}
                  <TableCell className={isNgo ? "" : "font-medium"}>{aplicacao.projeto_nome}</TableCell>
                  <TableCell className="text-muted-foreground">{aplicacao.turma_nome}</TableCell>
                  <TableCell className="text-muted-foreground">{aplicacao.atividade_nome}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(aplicacao.data_aplicacao)}</TableCell>
                  <TableCell className="min-w-72 text-right">
                    {isNgo && aplicacao.status === "pendente" ? (
                      <div className="flex flex-col items-end gap-2">
                        <Button asChild size="sm" variant="ghost" className="self-end">
                          <Link href={`/turmas/${aplicacao.turma_id}`} target="_blank">
                            <Users className="size-4" />
                            Ver Alunos
                          </Link>
                        </Button>
                        <input
                          value={feedback[aplicacao.id] ?? ""}
                          onChange={(event) => setFeedback((current) => ({ ...current, [aplicacao.id]: event.target.value }))}
                          placeholder="Feedback opcional"
                          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateApplication(aplicacao.id, "recusada")}>
                            Recusar
                          </Button>
                          <Button size="sm" onClick={() => updateApplication(aplicacao.id, "aceita")}>
                            Aprovar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <StatusBadge status={aplicacao.status} />
                        {!isNgo && aplicacao.status === "pendente" && (
                          <Button size="sm" variant="destructive" onClick={() => deleteApplication(aplicacao.id)}>
                            <Trash2 className="size-4" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
