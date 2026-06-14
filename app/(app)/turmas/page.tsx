"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { GraduationCap, Pencil, Plus, Save, Search, Trash2, Users, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, type Estudante, type Professor, type Turma } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

const periodos = ["manha", "tarde", "noite", "integral"] as const
const modalidades = ["presencial", "remoto", "hibrido"] as const
const emptyTurmaForm = {
  nome: "",
  descricao: "",
  periodo: "manha",
  modalidade: "presencial",
  semestre: "2026.1",
  vagas: "30",
}

const label = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}

export default function TurmasPage() {
  const { session, role, profile } = useAuth()
  const { notify } = useToast()
  const searchParams = useSearchParams()
  const state = useBackendData()
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState(searchParams.get("busca") ?? "")
  const [form, setForm] = useState(emptyTurmaForm)
  const [editingTurmaId, setEditingTurmaId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyTurmaForm)

  const studentInscriptionByTurma = useMemo(() => {
    const map = new Map<number, string>()
    state.myInscricoes.forEach((inscricao) => map.set(inscricao.turma, inscricao.status))
    return map
  }, [state.myInscricoes])

  useEffect(() => {
    setQuery(searchParams.get("busca") ?? "")
  }, [searchParams])

  const visibleTurmas = useMemo(() => {
    const source =
      role === "professor"
        ? state.myTurmas
        : state.data.turmas.filter((turma) => turma.ativa)
    const term = query.trim().toLowerCase()
    if (!term) return source

    return source.filter((turma) => {
      const universidade = turma.universidade_detalhes ?? turma.universidade
      return [
        turma.nome,
        turma.descricao,
        turma.semestre,
        turma.periodo,
        turma.modalidade,
        universidade?.nome,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    })
  }, [query, role, state.data.turmas, state.myTurmas])

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateEdit(key: keyof typeof editForm, value: string) {
    setEditForm((current) => ({ ...current, [key]: value }))
  }

  async function createTurma(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || role !== "professor" || !profile) return

    const professor = profile as Professor
    try {
      await apiFetch("/turmas/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          universidade: professor.universidade_detalhes.id,
          periodo: form.periodo,
          modalidade: form.modalidade,
          semestre: form.semestre,
          vagas: Number(form.vagas),
          ativa: true,
        }),
      })
      notify({ kind: "success", title: "Turma criada" })
      setCreating(false)
      setForm(emptyTurmaForm)
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível criar a turma",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  function startEditTurma(turma: Turma) {
    setEditingTurmaId(turma.id)
    setEditForm({
      nome: turma.nome,
      descricao: turma.descricao ?? "",
      periodo: turma.periodo,
      modalidade: turma.modalidade,
      semestre: turma.semestre,
      vagas: String(turma.vagas),
    })
  }

  async function saveTurma(event: React.FormEvent<HTMLFormElement>, turma: Turma) {
    event.preventDefault()
    if (!session?.access || role !== "professor") return
    try {
      await apiFetch(`/turmas/${turma.id}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({
          nome: editForm.nome,
          descricao: editForm.descricao,
          periodo: editForm.periodo,
          modalidade: editForm.modalidade,
          semestre: editForm.semestre,
          vagas: Number(editForm.vagas),
          ativa: turma.ativa,
        }),
      })
      notify({ kind: "success", title: "Turma atualizada" })
      setEditingTurmaId(null)
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar a turma",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function toggleTurma(turma: Turma) {
    if (!session?.access || role !== "professor") return
    try {
      await apiFetch(`/turmas/${turma.id}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({ ativa: !turma.ativa }),
      })
      notify({ kind: "success", title: turma.ativa ? "Turma desativada" : "Turma ativada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível alterar a turma",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteTurma(turma: Turma) {
    if (!session?.access || role !== "professor") return
    const ok = window.confirm(`Excluir a turma "${turma.nome}"? O backend pode bloquear se houver inscrições.`)
    if (!ok) return
    try {
      await apiFetch(`/turmas/${turma.id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Turma excluída" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível excluir a turma",
        description: err instanceof Error ? err.message : "Ela pode ter inscrições vinculadas.",
      })
    }
  }

  async function subscribe(turmaId: number) {
    if (!session?.access || role !== "estudante" || !profile) return
    try {
      await apiFetch("/estudantes/inscricoes/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          estudante: (profile as Estudante).id,
          turma: turmaId,
        }),
      })
      notify({ kind: "success", title: "Inscrição enviada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível se inscrever",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title={role === "professor" ? "Minhas turmas" : "Turmas disponíveis"}
        description={
          role === "professor"
            ? "Gerencie as turmas que você criou."
            : "Escolha uma turma ativa para participar dos projetos."
        }
        actions={
          role === "professor" ? (
            <Button onClick={() => setCreating((value) => !value)}>
              {creating ? <X className="size-4" /> : <Plus className="size-4" />}
              {creating ? "Fechar" : "Criar turma"}
            </Button>
          ) : undefined
        }
      />

      {creating && (
        <Card className="animate-fade-up">
          <CardContent className="p-5">
            <form className="grid gap-4 lg:grid-cols-2" onSubmit={createTurma}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Nome da turma</Label>
                <Input id="nome" value={form.nome} onChange={(event) => update("nome", event.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="semestre">Semestre</Label>
                <Input id="semestre" value={form.semestre} onChange={(event) => update("semestre", event.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={form.descricao} onChange={(event) => update("descricao", event.target.value)} />
              </div>
              <div className="grid gap-4 lg:col-span-2 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="periodo">Período</Label>
                  <select id="periodo" value={form.periodo} onChange={(event) => update("periodo", event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    {periodos.map((periodo) => <option key={periodo} value={periodo}>{label[periodo]}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="modalidade">Modalidade</Label>
                  <select id="modalidade" value={form.modalidade} onChange={(event) => update("modalidade", event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    {modalidades.map((modalidade) => <option key={modalidade} value={modalidade}>{label[modalidade]}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="vagas">Vagas</Label>
                  <Input id="vagas" type="number" min="1" value={form.vagas} onChange={(event) => update("vagas", event.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end lg:col-span-2">
                <Button type="submit">Salvar turma</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por turma, universidade, semestre..."
          className="h-10 pl-9"
          aria-label="Buscar turmas"
        />
      </div>

      {state.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : visibleTurmas.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={role === "professor" ? "Você ainda não criou turmas" : "Nenhuma turma ativa"}
          description={role === "professor" ? "Crie sua primeira turma para receber estudantes." : "Novas turmas aparecerão aqui quando forem criadas."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTurmas.map((turma) => {
            const currentStatus = studentInscriptionByTurma.get(turma.id)
            const universidade = turma.universidade_detalhes ?? turma.universidade
            const editing = editingTurmaId === turma.id
            return (
              <Card key={turma.id} className="interactive-card">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                      {turma.semestre}
                    </span>
                    <StatusBadge status={currentStatus ?? (turma.ativa ? "ativo" : "inativo")} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold">{turma.nome}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {universidade?.nome ?? "Universidade"} · {label[turma.periodo]}
                    </p>
                    {turma.descricao && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{turma.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-4" />
                      {turma.vagas} vagas
                    </span>
                    <span className="font-medium text-foreground">{label[turma.modalidade]}</span>
                  </div>
                  {editing && (
                    <form className="grid gap-3 rounded-lg border border-border bg-card p-3" onSubmit={(event) => saveTurma(event, turma)}>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`turma_${turma.id}_nome`}>Nome</Label>
                        <Input id={`turma_${turma.id}_nome`} value={editForm.nome} onChange={(event) => updateEdit("nome", event.target.value)} required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`turma_${turma.id}_descricao`}>Descrição</Label>
                        <Textarea id={`turma_${turma.id}_descricao`} value={editForm.descricao} onChange={(event) => updateEdit("descricao", event.target.value)} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select value={editForm.periodo} onChange={(event) => updateEdit("periodo", event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                          {periodos.map((periodo) => <option key={periodo} value={periodo}>{label[periodo]}</option>)}
                        </select>
                        <select value={editForm.modalidade} onChange={(event) => updateEdit("modalidade", event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                          {modalidades.map((modalidade) => <option key={modalidade} value={modalidade}>{label[modalidade]}</option>)}
                        </select>
                        <Input value={editForm.semestre} onChange={(event) => updateEdit("semestre", event.target.value)} required />
                        <Input type="number" min="1" value={editForm.vagas} onChange={(event) => updateEdit("vagas", event.target.value)} required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setEditingTurmaId(null)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          <Save className="size-4" />
                          Salvar
                        </Button>
                      </div>
                    </form>
                  )}
                  {role === "professor" && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <Button asChild size="sm" variant="default">
                        <Link href={`/turmas/${turma.id}`}>
                          Ver Alunos
                        </Link>
                      </Button>
                      <Button size="sm" variant={editing ? "secondary" : "outline"} onClick={() => (editing ? setEditingTurmaId(null) : startEditTurma(turma))}>
                        {editing ? <X className="size-4" /> : <Pencil className="size-4" />}
                        {editing ? "Fechar" : "Editar"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleTurma(turma)}>
                        {turma.ativa ? "Desativar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteTurma(turma)}>
                        <Trash2 className="size-4" />
                        Excluir
                      </Button>
                    </div>
                  )}
                  {role === "estudante" && (
                    currentStatus === "recusado" ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                          <span className="text-muted-foreground">Sua inscrição:</span>
                          <StatusBadge status={currentStatus} />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => subscribe(turma.id)}
                        >
                          Solicitar nova inscrição
                        </Button>
                      </div>
                    ) : currentStatus ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                          <span className="text-muted-foreground">Sua inscrição:</span>
                          <StatusBadge status={currentStatus} />
                        </div>
                        <Button asChild size="sm" variant="outline" className="w-full">
                          <Link href={`/turmas/${turma.id}`}>
                            <Users className="size-4" />
                            Ver Turma
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="mt-2 w-full"
                        onClick={() => subscribe(turma.id)}
                      >
                        Inscrever-se
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
