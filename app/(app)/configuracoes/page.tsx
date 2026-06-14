"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  GraduationCap,
  KeyRound,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { useToast } from "@/components/toast-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  apiFetch,
  causaSocialLabels,
  roleLabels,
  type CausaSocial,
  type Estudante,
  type Ong,
  type Professor,
} from "@/lib/api"
import { useBackendData } from "@/lib/use-backend-data"

type ProfileForm = {
  nome_universidade: string
  curso: string
  periodo_curso: string
  telefone: string
  lattes: string
  data_nascimento: string
  razao_social: string
  causa_social: CausaSocial
}

const emptyProfileForm: ProfileForm = {
  nome_universidade: "",
  curso: "",
  periodo_curso: "",
  telefone: "",
  lattes: "",
  data_nascimento: "",
  razao_social: "",
  causa_social: "educacao",
}

export default function ConfiguracoesPage() {
  const { session, user, role, profile, refreshMe } = useAuth()
  const backend = useBackendData()
  const { notify } = useToast()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [passwordForm, setPasswordForm] = useState({
    senha_atual: "",
    senha_nova: "",
    confirmar_senha: "",
  })

  useEffect(() => {
    if (!profile) return

    if (role === "ong") {
      const ong = profile as Ong
      setProfileForm({
        ...emptyProfileForm,
        razao_social: ong.razao_social ?? "",
        causa_social: ong.causa_social ?? "educacao",
      })
      return
    }

    if (role === "professor") {
      const professor = profile as Professor
      setProfileForm({
        ...emptyProfileForm,
        nome_universidade: professor.universidade_detalhes?.nome ?? "",
        telefone: professor.telefone ?? "",
        lattes: professor.lattes ?? "",
        data_nascimento: professor.data_nascimento ?? "",
      })
      return
    }

    const estudante = profile as Estudante
    setProfileForm({
      ...emptyProfileForm,
      nome_universidade: estudante.universidade_detalhes?.nome ?? "",
      curso: estudante.curso ?? "",
      periodo_curso: String(estudante.periodo_curso ?? ""),
      telefone: estudante.telefone ?? "",
      lattes: estudante.lattes ?? "",
      data_nascimento: estudante.data_nascimento ?? "",
    })
  }, [profile, role])

  function updateProfile<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfileForm((current) => ({ ...current, [key]: value }))
  }

  function updatePassword(key: keyof typeof passwordForm, value: string) {
    setPasswordForm((current) => ({ ...current, [key]: value }))
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access || !profile) return

    const routes = {
      estudante: `/estudantes/${(profile as Estudante).id}/`,
      professor: `/professores/${(profile as Professor).id}/`,
      ong: `/ongs/${(profile as Ong).id}/`,
    }

    const payload =
      role === "ong"
        ? {
            razao_social: profileForm.razao_social,
            causa_social: profileForm.causa_social,
          }
        : role === "professor"
          ? {
              nome_universidade: profileForm.nome_universidade,
              telefone: profileForm.telefone,
              lattes: profileForm.lattes,
              data_nascimento: profileForm.data_nascimento,
            }
          : {
              nome_universidade: profileForm.nome_universidade,
              curso: profileForm.curso,
              periodo_curso: Number(profileForm.periodo_curso),
              telefone: profileForm.telefone,
              lattes: profileForm.lattes,
              data_nascimento: profileForm.data_nascimento,
            }

    setSavingProfile(true)
    try {
      await apiFetch(routes[role], {
        method: "PATCH",
        token: session.access,
        body: JSON.stringify(payload),
      })
      await refreshMe()
      await backend.reload()
      notify({ kind: "success", title: "Perfil atualizado" })
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel atualizar o perfil",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session?.access) return
    if (passwordForm.senha_nova !== passwordForm.confirmar_senha) {
      notify({
        kind: "error",
        title: "As senhas nao conferem",
        description: "Repita a nova senha do mesmo jeito nos dois campos.",
      })
      return
    }

    setSavingPassword(true)
    try {
      await apiFetch("/auth/trocar-senha/", {
        method: "POST",
        token: session.access,
        body: JSON.stringify({
          senha_atual: passwordForm.senha_atual,
          senha_nova: passwordForm.senha_nova,
        }),
      })
      setPasswordForm({ senha_atual: "", senha_nova: "", confirmar_senha: "" })
      notify({ kind: "success", title: "Senha atualizada" })
    } catch (err) {
      notify({
        kind: "error",
        title: "Nao foi possivel trocar a senha",
        description: err instanceof Error ? err.message : "Confira a senha atual.",
      })
    } finally {
      setSavingPassword(false)
    }
  }

  if (!profile) {
    return (
      <EmptyState
        icon={UserRound}
        title="Perfil incompleto"
        description="Complete o perfil para liberar as configuracoes da conta."
      />
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Configuracoes"
        description="Mantenha seu perfil alinhado com o backend e atualize sua senha de acesso."
      />

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b border-border bg-secondary/40">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Conta
          </CardTitle>
          <Badge variant="secondary">{roleLabels[role]}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <ReadOnly label="Nome" value={user?.nome ?? "Usuario"} />
          <ReadOnly label="E-mail" value={user?.email ?? session?.email ?? "-"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {role === "ong" ? (
              <Building2 className="size-5 text-primary" />
            ) : (
              <GraduationCap className="size-5 text-primary" />
            )}
            Dados do perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
            {role === "ong" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="razao_social">Razao social</Label>
                  <Input
                    id="razao_social"
                    value={profileForm.razao_social}
                    onChange={(event) => updateProfile("razao_social", event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="causa_social">Causa social</Label>
                  <select
                    id="causa_social"
                    value={profileForm.causa_social}
                    onChange={(event) =>
                      updateProfile("causa_social", event.target.value as CausaSocial)
                    }
                    className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {Object.entries(causaSocialLabels).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nome_universidade">Universidade</Label>
                  <Input
                    id="nome_universidade"
                    list="universidades"
                    value={profileForm.nome_universidade}
                    onChange={(event) => updateProfile("nome_universidade", event.target.value)}
                    required
                  />
                  <datalist id="universidades">
                    {backend.data.universidades.map((universidade) => (
                      <option key={universidade.id} value={universidade.nome} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profileForm.telefone}
                    onChange={(event) => updateProfile("telefone", event.target.value)}
                  />
                </div>
                {role === "estudante" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="curso">Curso</Label>
                      <Input
                        id="curso"
                        value={profileForm.curso}
                        onChange={(event) => updateProfile("curso", event.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="periodo_curso">Periodo do curso</Label>
                      <Input
                        id="periodo_curso"
                        type="number"
                        min="1"
                        value={profileForm.periodo_curso}
                        onChange={(event) => updateProfile("periodo_curso", event.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={profileForm.data_nascimento}
                    onChange={(event) => updateProfile("data_nascimento", event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lattes">Lattes</Label>
                  <Input
                    id="lattes"
                    value={profileForm.lattes}
                    onChange={(event) => updateProfile("lattes", event.target.value)}
                    placeholder="https://lattes.cnpq.br/..."
                  />
                </div>
              </>
            )}
            <div className="flex justify-end md:col-span-2">
              <Button type="submit" disabled={savingProfile}>
                <Save className="size-4" />
                {savingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={changePassword}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha_atual">Senha atual</Label>
              <Input
                id="senha_atual"
                type="password"
                value={passwordForm.senha_atual}
                onChange={(event) => updatePassword("senha_atual", event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha_nova">Nova senha</Label>
              <Input
                id="senha_nova"
                type="password"
                minLength={8}
                value={passwordForm.senha_nova}
                onChange={(event) => updatePassword("senha_nova", event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmar_senha">Confirmar nova senha</Label>
              <Input
                id="confirmar_senha"
                type="password"
                minLength={8}
                value={passwordForm.confirmar_senha}
                onChange={(event) => updatePassword("confirmar_senha", event.target.value)}
                required
              />
            </div>
            <div className="flex justify-end md:col-span-3">
              <Button type="submit" disabled={savingPassword}>
                <KeyRound className="size-4" />
                {savingPassword ? "Atualizando..." : "Trocar senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
