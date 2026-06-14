import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LevelBadge } from "@/components/level-badge"
import { cn } from "@/lib/utils"
import { levelMeta, type Level } from "@/lib/api"

type Gamification = {
  level: Level
  projetosConcluidos: number
  metaProximoNivel: number
  proximoNivel: Level | null
}

export function GamificationCard({
  compact = false,
  gamification,
}: {
  compact?: boolean
  gamification: Gamification
}) {
  const { level, projetosConcluidos, metaProximoNivel, proximoNivel } = gamification
  const meta = levelMeta[level]
  const pct = Math.min(Math.round((projetosConcluidos / metaProximoNivel) * 100), 100)
  const radius = 52
  const circ = 2 * Math.PI * radius
  const dash = (pct / 100) * circ

  return (
    <Card className="interactive-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold">Sua jornada</h3>
          <LevelBadge level={level} />
        </div>

        <div className={cn("mt-4 flex items-center gap-5", compact && "flex-col text-center")}>
          <div className="relative size-32 shrink-0">
            <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="10"
                className="stroke-muted"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                className="transition-all duration-700 ease-out"
                stroke={meta.color}
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="size-5" style={{ color: meta.color }} aria-hidden="true" />
              <span className="font-heading text-xl font-bold">{pct}%</span>
            </span>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Você concluiu{" "}
              <span className="font-semibold text-foreground">
                {projetosConcluidos} projetos
              </span>
              .
            </p>
            {proximoNivel ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Faltam{" "}
                <span className="font-semibold text-foreground">
                  {Math.max(metaProximoNivel - projetosConcluidos, 0)} projetos
                </span>{" "}
                para o nível {levelMeta[proximoNivel].label}.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Você atingiu o nível máximo. Parabéns!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
