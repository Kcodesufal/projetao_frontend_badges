"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, GraduationCap, HeartHandshake, Users } from "lucide-react"
import { AuthShell } from "@/components/auth-shell"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { roleDescriptions, roleLabels, type AppRole } from "@/lib/api"
import { cn } from "@/lib/utils"

const roleIcons: Record<AppRole, typeof Users> = {
  estudante: Users,
  professor: GraduationCap,
  ong: HeartHandshake,
}

const roles: AppRole[] = ["estudante", "professor", "ong"]

export default function CadastroPage() {
  const router = useRouter()
  const { register, loading } = useAuth()
  const { notify } = useToast()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<AppRole | null>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!role) return
    try {
      await register({ nome, email, password, role })
      notify({ kind: "success", title: "Conta criada", description: "Agora complete seu perfil." })
      router.push(`/completar-perfil?perfil=${role}`)
    } catch (err) {
      notify({
        kind: "error",
        title: "Não foi possível criar a conta",
        description: err instanceof Error ? err.message : "Tente novamente.",
      })
    }
  }

  return (
    <AuthShell
      title={step === 1 ? "Como você vai usar o Projetão?" : "Vamos começar"}
      subtitle={
        step === 1
          ? "Escolha o perfil que melhor descreve você."
          : `Crie sua conta como ${role ? roleLabels[role] : ""}.`
      }
    >
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Escolha seu perfil</legend>
            {roles.map((item) => {
              const Icon = roleIcons[item]
              const active = role === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between">
                      <span className="font-heading font-semibold">{roleLabels[item]}</span>
                      {active && <Check className="size-4 text-primary" aria-hidden="true" />}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {roleDescriptions[item]}
                    </span>
                  </span>
                </button>
              )
            })}
          </fieldset>

          <Button size="lg" className="mt-2 w-full" disabled={!role} onClick={() => setStep(2)}>
            Continuar
          </Button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">
              {role === "ong" ? "Nome da organização" : "Nome completo"}
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder={role === "ong" ? "Instituto Exemplo" : "Seu nome"}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Crie uma senha"
              minLength={8}
              required
            />
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={loading}>
              {loading ? "Criando..." : "Continuar"}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
