"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  SendHorizontal,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { Brand } from "@/components/brand"
import { LevelBadge } from "@/components/level-badge"
import { useAuth } from "@/components/auth-provider"
import { useBackendData } from "@/lib/use-backend-data"
import { calculateGamification, roleLabels, type AppRole } from "@/lib/api"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: LucideIcon }

const navByRole: Record<AppRole, NavItem[]> = {
  estudante: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projetos", label: "Projetos", icon: FolderKanban },
    { href: "/turmas", label: "Turmas", icon: GraduationCap },
    { href: "/inscricoes", label: "Inscrições", icon: ClipboardList },
    { href: "/notificacoes", label: "Notificações", icon: Bell },
    { href: "/perfil", label: "Perfil", icon: UserRound },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
    { href: "/gerencia", label: "Gerência", icon: ShieldCheck },
  ],
  professor: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projetos", label: "Projetos", icon: FolderKanban },
    { href: "/turmas", label: "Minhas turmas", icon: GraduationCap },
    { href: "/inscricoes", label: "Inscrições", icon: ClipboardList },
    { href: "/aplicacoes", label: "Aplicações", icon: SendHorizontal },
    { href: "/notificacoes", label: "Notificações", icon: Bell },
    { href: "/perfil", label: "Perfil", icon: UserRound },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
    { href: "/gerencia", label: "Gerência", icon: ShieldCheck },
  ],
  ong: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projetos", label: "Projetos", icon: FolderKanban },
    { href: "/aplicacoes", label: "Aplicações", icon: SendHorizontal },
    { href: "/notificacoes", label: "Notificações", icon: Bell },
    { href: "/perfil", label: "Perfil", icon: UserRound },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ],
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { role, profile } = useAuth()
  const { data } = useBackendData()
  const items = navByRole[role]
  const gamification =
    role === "estudante" ? calculateGamification(profile as never, data) : null

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Brand href="/dashboard" tone="light" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/50">
          {roleLabels[role]}
        </p>
        <ul className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.93rem] font-semibold transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {gamification && (
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-xl bg-sidebar-accent/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sidebar-foreground/70">
                Seu nível
              </span>
              <LevelBadge level={gamification.level} />
            </div>
            <p className="mt-2 text-sm text-sidebar-foreground/80">
              {gamification.projetosConcluidos} de {gamification.metaProximoNivel} projetos
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar/60">
              <div
                className="h-full rounded-full bg-sidebar-primary transition-all duration-700"
                style={{
                  width: `${Math.min(
                    (gamification.projetosConcluidos / gamification.metaProximoNivel) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
