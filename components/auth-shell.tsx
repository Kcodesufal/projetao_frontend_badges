import type { ReactNode } from "react"
import { GraduationCap, HeartHandshake, Users } from "lucide-react"
import { Brand } from "@/components/brand"

const highlights = [
  { icon: HeartHandshake, title: "ONGs", text: "Publicam projetos sociais e atividades." },
  { icon: GraduationCap, title: "Professores", text: "Criam turmas e as aplicam em projetos." },
  { icon: Users, title: "Estudantes", text: "Participam e evoluem com a gamificação." },
]

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex lg:w-[44%]">
        <Brand href="/login" tone="light" />
        <div className="flex flex-col gap-6 animate-fade-up">
          <h2 className="text-pretty font-heading text-3xl font-bold leading-tight text-sidebar-foreground">
            Conectando quem ensina, quem aprende e quem transforma.
          </h2>
          <ul className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, title: itemTitle, text }) => (
              <li key={itemTitle} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading font-semibold text-sidebar-foreground">
                    {itemTitle}
                  </p>
                  <p className="text-sm text-sidebar-foreground/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-sidebar-foreground/60">
          Projetos sociais com propósito, do cadastro à conquista.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Brand href="/login" />
          </div>
          <div className="mb-6">
            <h1 className="text-balance font-heading text-2xl font-bold sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
