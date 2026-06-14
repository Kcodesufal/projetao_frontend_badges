"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpenText,
  Building2,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/toast-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch, formatDate, type Universidade, type Usuario } from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

const docs = [
  {
    title: "Swagger",
    description: "Documentacao interativa da API.",
    href: "/api/backend/docs/",
  },
  {
    title: "Redoc",
    description: "Referencia tecnica em leitura longa.",
    href: "/api/backend/redoc/",
  },
  {
    title: "Schema",
    description: "OpenAPI bruto para conferir contratos.",
    href: "/api/backend/schema/",
  },
]

const roleText: Record<string, string> = {
  estudante: "Estudante",
  professor: "Professor",
  ong: "ONG",
  administrador: "Administrador",
  voluntario_independente: "Voluntario",
}

export default function GerenciaPage() {
  const router = useRouter()
  const { session, role } = useAuth()
  const backend = useBackendData()
  const { notify } = useToast()
  const [users, setUsers] = useState<Usuario[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [newUniversity, setNewUniversity] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [query, setQuery] = useState("")

  const loadUsers = useCallback(async () => {
    if (!session?.access) return
    setUsersLoading(true)
    try {
      const response = await apiFetch<Usuario[]>("/auth/usuarios/", {
        token: session.access,
      })
      setUsers(response)
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel carregar usuarios",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    } finally {
      setUsersLoading(false)
    }
  }, [notify, session?.access])

  useEffect(() => {
    if (role === "ong") {
      router.replace("/dashboard")
      return
    }
    void loadUsers()
  }, [loadUsers, role, router])

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return users
    return users.filter((user) =>
      [user.nome, user.email, user.role, roleText[user.role]]
        .join(" ")
        .toLowerCase()
        .includes(term),
    )
  }, [query, users])

  async function createUniversity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !newUniversity.trim()) return

    try {
      await apiFetch<Universidade>("/professores/universidades/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({ nome: newUniversity.trim() }),
      })
      setNewUniversity("")
      notify({ kind: "success", title: "Universidade criada" })
      await backend.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel criar universidade",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function saveUniversity(id: number) {
    if (!session?.access || !editingName.trim()) return

    try {
      await apiFetch<Universidade>(`/professores/universidades/${id}/`, {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify({ nome: editingName.trim() }),
      })
      setEditingId(null)
      setEditingName("")
      notify({ kind: "success", title: "Universidade atualizada" })
      await backend.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel atualizar universidade",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  async function deleteUniversity(university: Universidade) {
    if (!session?.access) return
    const ok = window.confirm(
      `Excluir "${university.nome}"? O backend pode bloquear se ela estiver em uso.`,
    )
    if (!ok) return

    try {
      await apiFetch(`/professores/universidades/${university.id}/`, {
        method: "DELETE",
        token: session.access,
      })
      notify({ kind: "success", title: "Universidade excluida" })
      await backend.reload()
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel excluir universidade",
        description: err instanceof Error ? err.message : "Ela pode estar vinculada a turmas ou perfis.",
      })
    }
  }

  if (role === "ong") return null

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Gerencia"
        description="Ferramentas de administracao que o backend ja expoe para o sistema."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {docs.map((doc) => (
          <Card key={doc.href} className="interactive-card">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                <BookOpenText className="size-5" />
              </span>
              <div className="flex-1">
                <h2 className="font-heading text-lg font-semibold">{doc.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={doc.href} target="_blank">
                  Abrir
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Universidades
          </CardTitle>
          <Badge variant="secondary">{backend.data.universidades.length} cadastradas</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={createUniversity}>
            <div className="flex-1">
              <Label htmlFor="nova_universidade" className="sr-only">
                Nova universidade
              </Label>
              <Input
                id="nova_universidade"
                value={newUniversity}
                onChange={(event) => setNewUniversity(event.target.value)}
                placeholder="Nome da universidade"
              />
            </div>
            <Button type="submit">
              <Plus className="size-4" />
              Criar universidade
            </Button>
          </form>

          {backend.loading ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          ) : backend.data.universidades.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhuma universidade"
              description="Cadastre uma universidade para professores e estudantes se vincularem."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {backend.data.universidades.map((university) => (
                <div
                  key={university.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  {editingId === university.id ? (
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{university.nome}</p>
                      <p className="text-xs text-muted-foreground">ID {university.id}</p>
                    </div>
                  )}
                  <div className="flex shrink-0 gap-1">
                    {editingId === university.id ? (
                      <>
                        <Button size="icon-sm" variant="ghost" onClick={() => saveUniversity(university.id)} aria-label="Salvar universidade">
                          <Save className="size-4" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar edicao">
                          <X className="size-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(university.id)
                            setEditingName(university.nome)
                          }}
                          aria-label="Editar universidade"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => deleteUniversity(university)}
                          aria-label="Excluir universidade"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" />
              Usuarios
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar usuario..."
                className="w-full sm:w-64"
              />
              <Badge variant="secondary">{filteredUsers.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="m-5 h-56 animate-pulse rounded-xl bg-muted" />
          ) : filteredUsers.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={UsersRound}
                title="Nenhum usuario encontrado"
                description="Ajuste a busca para listar usuarios cadastrados."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{roleText[user.role] ?? user.role}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.data_criacao)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <StatusBadge status={user.is_active ? "ativo" : "inativo"} />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
