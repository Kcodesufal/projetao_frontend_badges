"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, ClipboardList, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch, formatDate } from "@/lib/api"

export default function MinhasAtividadesPage() {
  const { session, role } = useAuth()
  const [atividades, setAtividades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!session?.access) return

    const endpoint =
      role === "estudante"
        ? "/estudantes/minhas-atividades/"
        : role === "professor"
        ? "/aplicacoes/?status=aceita"
        : null

    if (!endpoint) {
      setLoading(false)
      return
    }

    apiFetch<any[]>(endpoint, { token: session.access })
      .then((data) => setAtividades(data))
      .catch((err) => console.error("Could not fetch atividades", err))
      .finally(() => setLoading(false))
  }, [session?.access, role])

  const filtered = atividades.filter((item) => {
    const q = query.toLowerCase()
    return (
      item.atividade_nome?.toLowerCase().includes(q) ||
      item.projeto_nome?.toLowerCase().includes(q) ||
      item.ong_nome?.toLowerCase().includes(q) ||
      item.turma_nome?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Minhas Atividades"
        description={
          role === "estudante"
            ? "Veja todas as atividades de projetos em que você está participando."
            : "Visualize as atividades aprovadas para as suas turmas."
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por atividade, projeto, ONG ou turma..."
          className="pl-9"
          aria-label="Buscar atividades"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma atividade encontrada"
          description={
            role === "estudante"
              ? "Você ainda não está participando de nenhuma atividade. Inscreva-se em uma turma para começar."
              : "Nenhuma atividade foi aprovada para suas turmas ainda."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item, i) => (
            <Card key={`${item.aplicacao_id}-${i}`} className="transition-colors hover:bg-muted/40">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <ClipboardList className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold leading-tight">{item.atividade_nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.projeto_nome} · {item.ong_nome}
                    </span>
                    {item.turma_nome && (
                      <span className="text-xs text-muted-foreground">Turma: {item.turma_nome}</span>
                    )}
                    {item.data_inicio && item.data_fim && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        {formatDate(item.data_inicio)} – {formatDate(item.data_fim)}
                      </span>
                    )}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/projetos/${item.projeto_id}`}>Ver Projeto</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
