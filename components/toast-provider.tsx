"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastKind = "success" | "error" | "info"
type Toast = {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

type ToastContextValue = {
  notify: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const styles: Record<ToastKind, string> = {
  success: "border-success/20 bg-success/10 text-success",
  error: "border-destructive/20 bg-destructive/10 text-destructive",
  info: "border-primary/20 bg-secondary text-secondary-foreground",
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now()
    setToasts((current) => [...current, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.kind]
          return (
            <div
              key={toast.id}
              className={cn(
                "animate-slide-in rounded-xl border bg-card p-4 shadow-lg",
                styles[toast.kind],
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-sm opacity-80">{toast.description}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider")
  return ctx
}
