"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { causaSocialLabels, type AppRole, type CausaSocial } from "@/lib/api"

const causas = Object.keys(causaSocialLabels) as CausaSocial[]

function SelectField({
  id,
  value,
  onChange,
  children,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      required
    >
      {children}
    </select>
  )
}

function CompletarPerfilContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { notify } = useToast()
  const { session, role: authRole, user, completeProfile, loading, hasProfile } = useAuth()
  const role = ((params.get("perfil") as AppRole | null) ?? authRole) as AppRole
  const [form, setForm] = useState<Record<string, string>>({
    nome_universidade: "",
    cpf: "",
    data_nascimento: "",
    matricula: "",
    curso: "",
    periodo_curso: "1",
    telefone: "",
    lattes: "",
    cnpj: "",
    razao_social: "",
    causa_social: "educacao",
  })

  useEffect(() => {
    if (!session) router.replace("/login")
  }, [router, session])

  useEffect(() => {
    if (hasProfile) router.replace("/dashboard")
  }, [hasProfile, router])

  useEffect(() => {
    if (role === "ong" && user?.nome && !form.razao_social) {
      setForm((current) => ({ ...current, razao_social: user.nome }))
    }
  }, [form.razao_social, role, user?.nome])

  const title = useMemo(() => {
    if (role === "ong") return "Complete o perfil da ONG"
    if (role === "professor") return "Complete seu perfil de professor"
    return "Complete seu perfil de estudante"
  }, [role])

  function update(key: string, value: string) {
    let formatted = value
    if (key === "cpf") {
      formatted = value.replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14)
    } else if (key === "cnpj") {
      formatted = value.replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
        .slice(0, 18)
    } else if (key === "telefone") {
      formatted = value.replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2")
        .slice(0, 15)
    }
    setForm((current) => ({ ...current, [key]: formatted }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (role === "ong") {
        await completeProfile({
          cnpj: form.cnpj,
          razao_social: form.razao_social,
          causa_social: form.causa_social,
        })
      } else if (role === "professor") {
        await completeProfile({
          nome_universidade: form.nome_universidade,
          cpf: form.cpf,
          data_nascimento: form.data_nascimento,
          telefone: form.telefone,
          lattes: form.lattes,
        })
      } else {
        await completeProfile({
          nome_universidade: form.nome_universidade,
          cpf: form.cpf,
          data_nascimento: form.data_nascimento,
          matricula: form.matricula,
          curso: form.curso,
          periodo_curso: Number(form.periodo_curso),
          telefone: form.telefone,
          lattes: form.lattes,
        })
      }
      notify({ kind: "success", title: "Perfil concluído" })
      router.replace("/dashboard")
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível salvar o perfil",
        description: err instanceof Error ? err.message : "Confira os campos e tente novamente.",
      })
    }
  }

  return (
    <AuthShell title={title} subtitle="Esses dados conectam você aos projetos certos.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {role === "ong" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="razao_social">Razão social</Label>
              <Input
                id="razao_social"
                value={form.razao_social}
                onChange={(event) => update("razao_social", event.target.value)}
                placeholder="Instituto Exemplo"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(event) => update("cnpj", event.target.value)}
                placeholder="00.000.000/0000-00"
                minLength={18}
                maxLength={18}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="causa_social">Causa social</Label>
              <SelectField
                id="causa_social"
                value={form.causa_social}
                onChange={(value) => update("causa_social", value)}
              >
                {causas.map((causa) => (
                  <option key={causa} value={causa}>
                    {causaSocialLabels[causa]}
                  </option>
                ))}
              </SelectField>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome_universidade">Universidade</Label>
              <Input
                id="nome_universidade"
                value={form.nome_universidade}
                onChange={(event) => update("nome_universidade", event.target.value)}
                placeholder="Nome da universidade"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(event) => update("cpf", event.target.value)}
                  placeholder="000.000.000-00"
                  minLength={14}
                  maxLength={14}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data_nascimento">Data de nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={form.data_nascimento}
                  onChange={(event) => update("data_nascimento", event.target.value)}
                  required
                />
              </div>
            </div>
            {role === "estudante" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      value={form.matricula}
                      onChange={(event) => update("matricula", event.target.value)}
                      placeholder="Sua matrícula"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="periodo_curso">Período</Label>
                    <SelectField
                      id="periodo_curso"
                      value={form.periodo_curso}
                      onChange={(value) => update("periodo_curso", value)}
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((periodo) => (
                        <option key={periodo} value={periodo}>
                          {periodo}º período
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    value={form.curso}
                    onChange={(event) => update("curso", event.target.value)}
                    placeholder="Ex.: Pedagogia"
                    required
                  />
                </div>
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={(event) => update("telefone", event.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lattes">Lattes</Label>
                <Input
                  id="lattes"
                  type="url"
                  value={form.lattes}
                  onChange={(event) => update("lattes", event.target.value)}
                  placeholder="https://lattes.cnpq.br/..."
                />
              </div>
            </div>
          </>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Salvando..." : "Concluir cadastro"}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function CompletarPerfilPage() {
  return (
    <Suspense fallback={null}>
      <CompletarPerfilContent />
    </Suspense>
  )
}
