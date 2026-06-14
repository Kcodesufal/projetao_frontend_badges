"use client"

import { ClipboardList, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch, formatDate } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

export default function InscricoesPage() {
  const { session, role } = useAuth()
  const { notify } = useToast()
  const state = useBackendData()
  const isTeacher = role === "professor"
  const isStudent = role === "estudante"

  async function updateStatus(id: number, status: "aceito" | "recusado") {
    if (!session?.access) return
    try {
      await apiFetch(`/estudantes/inscricoes/${id}/status/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({ status }),
      })
      notify({ kind: "success", title: status === "aceito" ? "Estudante aprovado" : "Inscrição recusada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível atualizar a inscrição",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteInscricao(id: number) {
    if (!session?.access) return
    const ok = window.confirm("Cancelar esta inscrição?")
    if (!ok) return
    try {
      await apiFetch(`/estudantes/inscricoes/${id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Inscrição cancelada" })
      await state.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível cancelar a inscrição",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Inscrições"
        description={
          isTeacher
            ? "Aprove ou recuse estudantes inscritos nas suas turmas."
            : "Acompanhe o status das suas inscrições em turmas."
        }
      />

      {state.loading ? (
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      ) : state.myInscricoes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={isTeacher ? "Nenhuma inscrição nas suas turmas" : "Nenhuma inscrição ainda"}
          description={isTeacher ? "Quando estudantes se inscreverem, eles aparecerão aqui." : "Inscreva-se em uma turma para acompanhar aqui."}
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden p-0 sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {isTeacher && <TableHead>Estudante</TableHead>}
                  <TableHead>Turma</TableHead>
                  <TableHead>Universidade</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">{isTeacher ? "Ações" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.myInscricoes.map((inscricao) => (
                  <TableRow key={inscricao.id}>
                    {isTeacher && <TableCell className="font-medium">{inscricao.estudante_nome}</TableCell>}
                    <TableCell className={isTeacher ? "" : "font-medium"}>{inscricao.turma_nome}</TableCell>
                    <TableCell className="text-muted-foreground">{inscricao.universidade_nome}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(inscricao.data_inscricao)}</TableCell>
                    <TableCell className="text-right">
                      {isTeacher && inscricao.status === "pre_aprovado" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(inscricao.id, "recusado")}>
                            Recusar
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(inscricao.id, "aceito")}>
                            Aprovar
                          </Button>
                        </div>
                      ) : isStudent ? (
                        <div className="flex items-center justify-end gap-2">
                          <StatusBadge status={inscricao.status} />
                          {inscricao.status !== "aceito" && (
                            <Button size="sm" variant="destructive" onClick={() => deleteInscricao(inscricao.id)}>
                              <Trash2 className="size-4" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      ) : (
                        <StatusBadge status={inscricao.status} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex flex-col gap-3 sm:hidden">
            {state.myInscricoes.map((inscricao) => (
              <Card key={inscricao.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{isTeacher ? inscricao.estudante_nome : inscricao.turma_nome}</p>
                  <StatusBadge status={inscricao.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {inscricao.turma_nome} · {formatDate(inscricao.data_inscricao)}
                </p>
                {isTeacher && inscricao.status === "pre_aprovado" && (
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" size="sm" variant="outline" onClick={() => updateStatus(inscricao.id, "recusado")}>
                      Recusar
                    </Button>
                    <Button className="flex-1" size="sm" onClick={() => updateStatus(inscricao.id, "aceito")}>
                      Aprovar
                    </Button>
                  </div>
                )}
                {isStudent && inscricao.status !== "aceito" && (
                  <Button className="mt-3 w-full" size="sm" variant="destructive" onClick={() => deleteInscricao(inscricao.id)}>
                    <Trash2 className="size-4" />
                    Cancelar inscrição
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
