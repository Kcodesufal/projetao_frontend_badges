import type { ReactNode } from "react"
import { AuthGate } from "@/components/auth-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="fixed inset-y-0 w-64">
            <AppSidebar />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGate>
  )
}
