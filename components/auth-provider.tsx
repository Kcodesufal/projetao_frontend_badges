"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  apiFetch,
  decodeJwtUserId,
  isAppRole,
  type AppRole,
  type Estudante,
  type Ong,
  type Professor,
  type Profile,
  type Role,
  type Usuario,
} from "@/lib/api"

type Session = {
  access: string
  refresh: string
  role: Role
  userId: number
  email?: string
}

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  nome: string
  email: string
  password: string
  role: AppRole
}

type AuthContextValue = {
  ready: boolean
  loading: boolean
  session: Session | null
  user: Usuario | null
  profile: Profile | null
  role: AppRole
  hasProfile: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  completeProfile: (payload: Record<string, unknown>) => Promise<void>
  refreshMe: () => Promise<void>
  logout: () => void
}

const STORAGE_KEY = "projetao.session.v1"
const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function storeSession(session: Session | null) {
  if (typeof window === "undefined") return
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

async function fetchProfile(session: Session, user: Usuario | null) {
  if (!isAppRole(session.role)) return null
  const token = session.access
  const userId = user?.id ?? session.userId

  if (session.role === "estudante") {
    const estudantes = await apiFetch<Estudante[]>("/estudantes/", { token })
    return estudantes.find((item) => item.usuario_detalhes.id === userId) ?? null
  }

  if (session.role === "professor") {
    const professores = await apiFetch<Professor[]>("/professores/", { token })
    return professores.find((item) => item.usuario_detalhes.id === userId) ?? null
  }

  const ongs = await apiFetch<Ong[]>("/ongs/", { token })
  return ongs.find((item) => item.usuario_detalhes.id === userId) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [session, setSessionState] = useState<Session | null>(null)
  const [user, setUser] = useState<Usuario | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const setSession = useCallback((next: Session | null) => {
    setSessionState(next)
    storeSession(next)
  }, [])

  const refreshMe = useCallback(async () => {
    const current = readStoredSession()
    if (!current?.access) {
      setSessionState(null)
      setUser(null)
      setProfile(null)
      return
    }

    setSessionState(current)
    try {
      const currentUser = current.userId
        ? await apiFetch<Usuario>(`/auth/usuarios/${current.userId}/`, {
            token: current.access,
          })
        : null

      setUser(currentUser)
      setProfile(await fetchProfile(current, currentUser))
    } catch {
      setUser(null)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    void refreshMe().finally(() => setReady(true))
  }, [refreshMe])

  const login = useCallback(
    async (input: LoginInput) => {
      setLoading(true)
      try {
        const response = await apiFetch<{
          access: string
          refresh: string
          role: Role
        }>("/auth/login/", {
          method: "POST",
          body: JSON.stringify(input),
        })
        const userId = decodeJwtUserId(response.access)
        const next = {
          access: response.access,
          refresh: response.refresh,
          role: response.role,
          userId,
          email: input.email,
        }
        setSession(next)
        const currentUser = await apiFetch<Usuario>(`/auth/usuarios/${userId}/`, {
          token: next.access,
        })
        setUser(currentUser)
        setProfile(await fetchProfile(next, currentUser))
      } finally {
        setLoading(false)
      }
    },
    [setSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true)
      try {
        const response = await apiFetch<{
          access: string
          refresh: string
          role: Role
        }>("/auth/cadastro/", {
          method: "POST",
          body: JSON.stringify(input),
        })
        const userId = decodeJwtUserId(response.access)
        const next = {
          access: response.access,
          refresh: response.refresh,
          role: response.role,
          userId,
          email: input.email,
        }
        setSession(next)
        const currentUser = await apiFetch<Usuario>(`/auth/usuarios/${userId}/`, {
          token: next.access,
        })
        setUser(currentUser)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    },
    [setSession],
  )

  const completeProfile = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!session?.access || !isAppRole(session.role)) {
        throw new Error("Você precisa entrar antes de completar o perfil.")
      }

      const routes: Record<AppRole, string> = {
        estudante: "/estudantes/",
        professor: "/professores/",
        ong: "/ongs/",
      }

      setLoading(true)
      try {
        await apiFetch(routes[session.role], {
          method: "POST",
          token: session.access,
          body: JSON.stringify({
            usuario: session.userId,
            ...payload,
          }),
        })
        setProfile(await fetchProfile(session, user))
      } finally {
        setLoading(false)
      }
    },
    [session, user],
  )

  const logout = useCallback(() => {
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [setSession])

  const value = useMemo<AuthContextValue>(() => {
    const role = isAppRole(session?.role ?? "estudante")
      ? (session?.role as AppRole)
      : "estudante"

    return {
      ready,
      loading,
      session,
      user,
      profile,
      role,
      hasProfile: Boolean(profile),
      login,
      register,
      completeProfile,
      refreshMe,
      logout,
    }
  }, [
    completeProfile,
    loading,
    login,
    logout,
    profile,
    ready,
    refreshMe,
    register,
    session,
    user,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { ready, session, hasProfile, role } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace("/login")
      return
    }
    if (isAppRole(role) && !hasProfile && pathname !== "/completar-perfil") {
      router.replace(`/completar-perfil?perfil=${role}`)
    }
  }, [hasProfile, pathname, ready, role, router, session])

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (!session) return null
  return <>{children}</>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
