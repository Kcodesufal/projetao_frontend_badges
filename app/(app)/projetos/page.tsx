"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { FolderSearch, Plus, Search, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { ProjectCard } from "@/components/project-card"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch, projetoStatusLabels, type Ong, type ProjetoStatus } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

const statuses = ["todos", ...Object.keys(projetoStatusLabels)] as Array<"todos" | ProjetoStatus>

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    />
  )
}

export default function ProjetosPage() {
  const { session, role, profile } = useAuth()
  const { notify } = useToast()
  const searchParams = useSearchParams()
  const state = useBackendData()
  const [query, setQuery] = useState(searchParams.get("busca") ?? "")
  const [status, setStatus] = useState<(typeof statuses)[number]>("todos")
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    objetivo: "",
    publico_alvo: "",
    status: "aberto",
    data_inicio: "",
    data_fim: "",
    carga_horaria: "20",
    vagas_turmas: "1",
  })

  useEffect(() => {
    setQuery(searchParams.get("busca") ?? "")
  }, [searchParams])

  const filtered = useMemo(() => {
    return state.myProjetos.filter((project) => {
      const matchQuery =
        project.nome.toLowerCase().includes(query.toLowerCase()) ||
        project.ong_nome.toLowerCase().includes(query.toLowerCase()) ||
        project.publico_alvo.toLowerCase().includes(query.toLowerCase())
      const matchStatus = status === "todos" || project.status === status
      return matchQuery && matchStatus
    })
  }, [query, state.myProjetos, status])

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || role !== "ong" || !profile) return

    try {
      await apiFetch("/projetos/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          ong: (profile as Ong).id,
          nome: form.nome,
          descricao: form.descricao,
          objetivo: form.objetivo,
          publico_alvo: form.publico_alvo,
          status: form.status,
          data_inicio: form.data_inicio,
          data_fim: form.data_fim,
          carga_horaria: Number(form.carga_horaria),
          vagas_turmas: Number(form.vagas_turmas),
        }),
      })
      notify({ kind: "success", title: "Projeto criado" })
      setCreating(false)
      setForm({
        nome: "",
        descricao: "",
        objetivo: "",
        publico_alvo: "",
        status: "aberto",
        data_inicio: "",
        data_fim: "",
        carga_horaria: "20",
        vagas_turmas: "1",
      })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível criar o projeto",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Projetos"
        description={
          role === "ong"
            ? "Gerencie os projetos da sua organização."
            : "Explore projetos sociais e encontre onde participar."
        }
        actions={
          role === "ong" ? (
            <Button onClick={() => setCreating((value) => !value)}>
              {creating ? <X className="size-4" /> : <Plus className="size-4" />}
              {creating ? "Fechar" : "Criar projeto"}
            </Button>
          ) : undefined
        }
      />

      {creating && (
        <Card className="animate-fade-up">
          <CardContent className="p-5">
            <form className="grid gap-4 lg:grid-cols-2" onSubmit={createProject}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Nome do projeto</Label>
                <Input id="nome" value={form.nome} onChange={(event) => update("nome", event.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="publico_alvo">Público-alvo</Label>
                <Input id="publico_alvo" value={form.publico_alvo} onChange={(event) => update("publico_alvo", event.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={form.descricao} onChange={(event) => update("descricao", event.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Textarea id="objetivo" value={form.objetivo} onChange={(event) => update("objetivo", event.target.value)} required />
              </div>
              <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) => update("status", event.target.value)}
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
                  <Label htmlFor="data_inicio">Início</Label>
                  <Input id="data_inicio" type="date" value={form.data_inicio} onChange={(event) => update("data_inicio", event.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="data_fim">Fim</Label>
                  <Input id="data_fim" type="date" value={form.data_fim} onChange={(event) => update("data_fim", event.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="carga_horaria">Carga horária</Label>
                  <Input id="carga_horaria" type="number" min="1" value={form.carga_horaria} onChange={(event) => update("carga_horaria", event.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="vagas_turmas">Vagas/turmas</Label>
                  <Input id="vagas_turmas" type="number" min="1" value={form.vagas_turmas} onChange={(event) => update("vagas_turmas", event.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end lg:col-span-2">
                <Button type="submit">Salvar projeto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por projeto, ONG ou público..."
            className="pl-9"
            aria-label="Buscar projetos"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-56"
          aria-label="Filtrar por status"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item === "todos" ? "Todos os status" : projetoStatusLabels[item]}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}
      </p>

      {state.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              atividades={state.data.atividades.filter((item) => item.projeto_nome === project.nome).length}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderSearch}
          title="Nenhum projeto encontrado"
          description="Tente ajustar a busca ou os filtros para ver mais resultados."
        />
      )}
    </div>
  )
}
