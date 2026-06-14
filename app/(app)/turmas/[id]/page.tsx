"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, GraduationCap, X, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, type Turma } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

export default function TurmaDetalhePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { session, role } = useAuth()
  const { notify } = useToast()
  const state = useBackendData()
  
  const turma = state.data.turmas.find((item) => item.id === id) || state.myTurmas.find((item) => item.id === id)
  const [inscricoes, setInscricoes] = useState<any[]>([])
  const [atividades, setAtividades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isProfessor = role === "professor"
  const isOng = role === "ong"

  useEffect(() => {
    if (!session?.access) return
    
    Promise.all([
      apiFetch<any[]>(`/turmas/${id}/inscricoes/`, { token: session.access }),
      apiFetch<any[]>(`/turmas/${id}/atividades/`, { token: session.access })
    ])
      .then(([inscData, ativData]) => {
        setInscricoes(inscData)
        setAtividades(ativData)
      })
      .catch((err) => console.error("Could not fetch data", err))
      .finally(() => setLoading(false))
  }, [id, session?.access])

  async function updateStatus(inscricaoId: number, status: string) {
    if (!session?.access) return
    try {
      await apiFetch(`/estudantes/inscricoes/${inscricaoId}/status/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({ status }),
      })
      notify({ kind: "success", title: "Status atualizado" })
      setInscricoes((current) =>
        current.map((i) => (i.id === inscricaoId ? { ...i, status } : i))
      )
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar o status",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteInscricao(inscricaoId: number) {
    if (!session?.access) return
    const ok = window.confirm("Excluir esta inscrição?")
    if (!ok) return
    try {
      await apiFetch(`/estudantes/inscricoes/${inscricaoId}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Inscrição removida" })
      setInscricoes((current) => current.filter((i) => i.id !== inscricaoId))
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível remover a inscrição",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  if (state.loading || loading) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />
  }

  if (!turma) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Turma não encontrada"
        description="Ela pode ter sido removida ou não está disponível."
      />
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <Link
        href="/turmas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para turmas
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <GraduationCap className="size-6" aria-hidden="true" />
                </span>
                <StatusBadge status={turma.ativa ? "ativo" : "inativo"} />
              </div>
              <h1 className="mt-4 text-balance font-heading text-xl font-bold">
                {turma.nome}
              </h1>
              <p className="mt-1 text-muted-foreground">{typeof turma.universidade_detalhes?.nome === "string" ? turma.universidade_detalhes.nome : (typeof turma.universidade?.nome === "string" ? turma.universidade.nome : "")}</p>
              <div className="mt-4">
                <h2 className="font-heading text-md font-semibold">Descrição</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {turma.descricao || "Sem descrição."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <p><strong>Semestre:</strong> {turma.semestre}</p>
                <p><strong>Período:</strong> {turma.periodo}</p>
                <p><strong>Modalidade:</strong> {turma.modalidade}</p>
                <p><strong>Vagas:</strong> {turma.vagas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          {atividades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Atividades do Projeto ({atividades.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {atividades.map((ativ) => (
                    <div key={ativ.aplicacao_id} className="flex flex-col rounded-lg border p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="font-medium">{ativ.atividade_nome}</span>
                          <span className="text-sm text-muted-foreground">Projeto: {ativ.projeto_nome} ({ativ.ong_nome})</span>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/projetos/${ativ.projeto_id}`}>Ver Projeto</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {isOng ? `Equipe da Turma — somente leitura (${inscricoes.length})` : `Alunos Inscritos (${inscricoes.length})`}
              </CardTitle>
              {isOng && (
                <p className="text-xs text-muted-foreground">
                  Visualização da lista de estudantes inscritos. Apenas o professor pode aprovar ou recusar.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {inscricoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum aluno inscrito nesta turma ainda.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {inscricoes.map((inscricao) => (
                    <div key={inscricao.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{inscricao.estudante_nome}</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={inscricao.status} />
                          <span className="text-xs text-muted-foreground">
                            Inscrito em {new Date(inscricao.data_inscricao).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {isProfessor && (
                        <div className="flex items-center gap-2">
                          {inscricao.status === "pre_aprovado" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateStatus(inscricao.id, "aceito")}
                              >
                                <Check className="size-4 mr-1" /> Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateStatus(inscricao.id, "recusado")}
                              >
                                <X className="size-4 mr-1" /> Recusar
                              </Button>
                            </>
                          )}
                          {(inscricao.status === "aceito" || inscricao.status === "recusado") && (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={() => deleteInscricao(inscricao.id)}
                              aria-label="Remover inscrição"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
