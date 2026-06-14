"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildNotifications, countActionableNotifications } from "@/lib/notifications"
import { buildSearchResults, fallbackSearchHref } from "@/lib/search"
import { useBackendData } from "@/lib/use-backend-data"
import { getInitials, roleLabels } from "@/lib/api"
import { cn } from "@/lib/utils"

function subtitleFromProfile(role: string, profile: unknown) {
  const item = profile as Record<string, unknown> | null
  if (!item) return "Perfil incompleto"
  if (role === "estudante") {
    return `${item.curso ?? "Estudante"} · ${
      (item.universidade_detalhes as { nome?: string } | undefined)?.nome ?? "Universidade"
    }`
  }
  if (role === "professor") {
    return `Professor · ${
      (item.universidade_detalhes as { nome?: string } | undefined)?.nome ?? "Universidade"
    }`
  }
  return `ONG · ${item.causa_social ?? "Impacto social"}`
}

const notificationStyles = {
  info: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
}

export function AppTopbar() {
  const router = useRouter()
  const { user, profile, role, logout } = useAuth()
  const backend = useBackendData()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const searchRef = useRef<HTMLFormElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  const displayName =
    role === "ong" && profile && "razao_social" in profile
      ? profile.razao_social
      : user?.nome ?? "Projetão"

  const searchResults = useMemo(
    () => buildSearchResults(role, profile, backend.data, searchQuery),
    [backend.data, profile, role, searchQuery],
  )
  const notifications = useMemo(
    () => buildNotifications(role, profile, backend.data),
    [backend.data, profile, role],
  )
  const actionableNotifications = countActionableNotifications(notifications)

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (!searchRef.current?.contains(target)) setSearchOpen(false)
      if (!notificationsRef.current?.contains(target)) setNotificationsOpen(false)
      if (!accountRef.current?.contains(target)) setAccountOpen(false)
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  function navigateTo(href: string) {
    setSearchOpen(false)
    setNotificationsOpen(false)
    setAccountOpen(false)
    router.push(href)
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    navigateTo(searchResults[0]?.href ?? fallbackSearchHref(query))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-64 animate-slide-in">
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
      </div>

      <form
        ref={searchRef}
        onSubmit={submitSearch}
        className="relative hidden max-w-md flex-1 sm:block"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          type="search"
          placeholder="Buscar projetos, turmas, aplicações..."
          className="h-10 pl-9 pr-9"
          aria-label="Buscar no sistema"
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Limpar busca"
            onClick={() => {
              setSearchQuery("")
              setSearchOpen(false)
            }}
          >
            <X className="size-4" />
          </button>
        )}

        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-fade-up">
            {searchQuery.trim().length < 2 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para pesquisar.
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[420px] overflow-y-auto p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    className="flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => navigateTo(result.href)}
                  >
                    <span className="text-xs font-semibold uppercase text-primary">
                      {result.group}
                    </span>
                    <span className="text-sm font-semibold">{result.title}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {result.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm font-semibold">Nada encontrado</p>
                <button
                  type="button"
                  className="mt-1 text-sm text-primary hover:underline"
                  onClick={() => navigateTo(fallbackSearchHref(searchQuery.trim()))}
                >
                  Ver projetos com esse termo
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <div ref={notificationsRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir notificações"
            aria-expanded={notificationsOpen}
            className="relative"
            onClick={() => {
              setNotificationsOpen((value) => !value)
              setAccountOpen(false)
            }}
          >
            <Bell className="size-5" />
            {actionableNotifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold leading-5 text-accent-foreground">
                {actionableNotifications}
              </span>
            ) : (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-success animate-soft-pulse" />
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-fade-up">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Notificações</p>
                  <p className="text-xs text-muted-foreground">
                    {actionableNotifications > 0
                      ? `${actionableNotifications} pendência${actionableNotifications === 1 ? "" : "s"}`
                      : "Sem pendências críticas"}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/notificacoes" onClick={() => setNotificationsOpen(false)}>
                    Ver todas
                  </Link>
                </Button>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {notifications.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full gap-3 rounded-md px-3 py-2 text-left transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => navigateTo(item.href)}
                  >
                    <span
                      className={cn(
                        "mt-1 size-2.5 shrink-0 rounded-full",
                        notificationStyles[item.kind],
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={accountRef} className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Abrir menu do usuário"
            aria-expanded={accountOpen}
            onClick={() => {
              setAccountOpen((value) => !value)
              setNotificationsOpen(false)
            }}
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left sm:block">
              <span className="block text-[0.92rem] font-semibold leading-tight">{displayName}</span>
              <span className="block max-w-56 truncate text-xs text-muted-foreground">
                {roleLabels[role]} · {subtitleFromProfile(role, profile)}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                accountOpen && "rotate-180",
              )}
            />
          </button>

          {accountOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-fade-up">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Conta"}</p>
              </div>
              <div className="p-2">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
                  onClick={() => setAccountOpen(false)}
                >
                  <UserRound className="size-4" />
                  Meu perfil
                </Link>
                <Link
                  href="/notificacoes"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
                  onClick={() => setAccountOpen(false)}
                >
                  <Bell className="size-4" />
                  Notificações
                </Link>
                <Link
                  href="/configuracoes"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
                  onClick={() => setAccountOpen(false)}
                >
                  <Settings className="size-4" />
                  Configurações
                </Link>
                <Link
                  href="/gerencia"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted",
                    role === "ong" && "hidden",
                  )}
                  onClick={() => setAccountOpen(false)}
                >
                  <ShieldCheck className="size-4" />
                  Gerência
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                  onClick={() => {
                    logout()
                    setAccountOpen(false)
                    router.replace("/login")
                  }}
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
