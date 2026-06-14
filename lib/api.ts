export type Role =
  | "estudante"
  | "professor"
  | "ong"
  | "voluntario_independente"
  | "administrador"

export type AppRole = "estudante" | "professor" | "ong"

export type Usuario = {
  id: number
  email: string
  nome: string
  role: Role
  is_active: boolean
  data_criacao: string
}

export type Universidade = {
  id: number
  nome: string
}

export type Estudante = {
  id: number
  usuario_detalhes: Usuario
  universidade_detalhes: Universidade
  cpf: string
  data_nascimento: string
  matricula: string
  curso: string
  periodo_curso: number
  telefone: string
  lattes: string
  data_criacao: string
}

export type Professor = {
  id: number
  usuario_detalhes: Usuario
  universidade_detalhes: Universidade
  cpf: string
  data_nascimento: string
  telefone: string
  lattes: string
  data_criacao: string
}

export type Ong = {
  id: number
  usuario_detalhes: Usuario
  cnpj: string
  razao_social: string
  causa_social: CausaSocial
  data_criacao: string
}

export type Profile = Estudante | Professor | Ong

export type Turma = {
  id: number
  nome: string
  descricao: string
  universidade?: Universidade
  universidade_detalhes?: Universidade
  periodo: "manha" | "tarde" | "noite" | "integral"
  modalidade: "presencial" | "remoto" | "hibrido"
  semestre: string
  vagas: number
  ativa: boolean
  total_vinculos?: number
  data_criacao: string
}

export type Inscricao = {
  id: number
  estudante: number
  estudante_nome: string
  turma: number
  turma_nome: string
  universidade_nome: string
  status: "pre_aprovado" | "aceito" | "recusado"
  data_inscricao: string
  data_atualizacao: string
}

export type ProjetoStatus =
  | "rascunho"
  | "aberto"
  | "em_andamento"
  | "concluido"
  | "cancelado"

export type Projeto = {
  id: number
  ong_nome: string
  nome: string
  descricao: string
  objetivo: string
  publico_alvo: string
  status: ProjetoStatus
  data_inicio: string
  data_fim: string
  carga_horaria: number
  vagas_turmas: number
  data_criacao: string
  data_atualizacao: string
}

export type Atividade = {
  id: number
  projeto_nome: string
  nome: string
  descricao: string
  tipo: "pratica" | "teorica" | "workshop" | "pesquisa" | "extensao"
  carga_horaria: number
  data_inicio: string
  data_fim: string
  vagas: number
  data_criacao: string
}

export type Aplicacao = {
  id: number
  professor_nome: string
  turma_nome: string
  atividade_nome: string
  projeto_nome: string
  justificativa: string
  status: "pendente" | "aceita" | "recusada"
  feedback_ong: string
  data_aplicacao: string
  data_atualizacao: string
}

export type CausaSocial =
  | "educacao"
  | "saude"
  | "meio_ambiente"
  | "direitos_humanos"
  | "assistencia_social"
  | "cultura"
  | "esporte"
  | "tecnologia"

export type Level =
  | "bronze"
  | "prata"
  | "ouro"
  | "platina"
  | "esmeralda"
  | "diamante"
  | "mestre"
  | "grao_mestre"
  | "desafiante"

export type BackendSnapshot = {
  projetos: Projeto[]
  atividades: Atividade[]
  turmas: Turma[]
  minhasTurmas: Turma[]
  inscricoes: Inscricao[]
  aplicacoes: Aplicacao[]
  estudantes: Estudante[]
  professores: Professor[]
  ongs: Ong[]
  universidades: Universidade[]
}

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/backend"

export const roleLabels: Record<AppRole, string> = {
  estudante: "Estudante",
  professor: "Professor",
  ong: "ONG",
}

export const roleDescriptions: Record<AppRole, string> = {
  estudante: "Participe de turmas e acompanhe seu progresso em projetos sociais.",
  professor: "Crie turmas, aprove estudantes e aplique turmas em atividades.",
  ong: "Publique projetos, crie atividades e selecione turmas participantes.",
}

export const levelOrder: Level[] = [
  "bronze",
  "prata",
  "ouro",
  "platina",
  "esmeralda",
  "diamante",
  "mestre",
  "grao_mestre",
  "desafiante",
]

export const levelMeta: Record<
  Level,
  { label: string; range: string; minProjetos: number; color: string }
> = {
  bronze: {
    label: "Bronze",
    range: "0-1 projeto concluído",
    minProjetos: 0,
    color: "#B87333",
  },
  prata: {
    label: "Prata",
    range: "2-3 projetos concluídos",
    minProjetos: 2,
    color: "#8E9AA3",
  },
  ouro: {
    label: "Ouro",
    range: "4-5 projetos concluídos",
    minProjetos: 4,
    color: "#D4A017",
  },
  platina: {
    label: "Platina",
    range: "6-8 projetos concluídos",
    minProjetos: 6,
    color: "#7DD3FC",
  },
  esmeralda: {
    label: "Esmeralda",
    range: "9-11 projetos concluídos",
    minProjetos: 9,
    color: "#059669",
  },
  diamante: {
    label: "Diamante",
    range: "12-15 projetos concluídos",
    minProjetos: 12,
    color: "#38BDF8",
  },
  mestre: {
    label: "Mestre",
    range: "16-20 projetos concluídos",
    minProjetos: 16,
    color: "#7C3AED",
  },
  grao_mestre: {
    label: "Grão-mestre",
    range: "21-27 projetos concluídos",
    minProjetos: 21,
    color: "#DB2777",
  },
  desafiante: {
    label: "Desafiante",
    range: "28+ projetos concluídos",
    minProjetos: 28,
    color: "#DC2626",
  },
}

export const causaSocialLabels: Record<CausaSocial, string> = {
  educacao: "Educação",
  saude: "Saúde",
  meio_ambiente: "Meio ambiente",
  direitos_humanos: "Direitos humanos",
  assistencia_social: "Assistência social",
  cultura: "Cultura e arte",
  esporte: "Esporte",
  tecnologia: "Tecnologia e inovação",
}

export const projetoStatusLabels: Record<ProjetoStatus, string> = {
  rascunho: "Rascunho",
  aberto: "Aberto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

type ApiOptions = RequestInit & {
  token?: string | null
}

function buildHeaders(options: ApiOptions) {
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`)
  }
  return headers
}

function messageFromPayload(payload: unknown) {
  if (!payload) return "Algo deu errado. Tente novamente."
  if (typeof payload === "string") return payload
  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>
    const detail = record.detail ?? record.non_field_errors
    if (Array.isArray(detail)) return detail.join(" ")
    if (typeof detail === "string") return detail
    const first = Object.values(record)[0]
    if (Array.isArray(first)) return first.join(" ")
    if (typeof first === "string") return first
  }
  return "Algo deu errado. Tente novamente."
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options),
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(response.status, messageFromPayload(payload), payload)
  }

  return payload as T
}

export function decodeJwtUserId(token: string) {
  try {
    const [, payload] = token.split(".")
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(window.atob(normalized))
    return Number(decoded.user_id ?? decoded.userId ?? decoded.sub)
  } catch {
    return NaN
  }
}

export function isAppRole(role: Role): role is AppRole {
  return role === "estudante" || role === "professor" || role === "ong"
}

export function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date)
}

export function getInitials(name?: string) {
  if (!name) return "PR"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function getLevel(totalProjetos: number): Level {
  return (
    [...levelOrder]
      .reverse()
      .find((level) => totalProjetos >= levelMeta[level].minProjetos) ?? "bronze"
  )
}

export function getNextLevel(totalProjetos: number) {
  const currentLevel = getLevel(totalProjetos)
  const currentIndex = levelOrder.indexOf(currentLevel)
  const next = levelOrder[currentIndex + 1] ?? null

  return {
    next,
    target: next ? levelMeta[next].minProjetos : Math.max(totalProjetos, levelMeta.desafiante.minProjetos),
  }
}

export function calculateGamification(
  estudante: Estudante | null | undefined,
  snapshot: Pick<BackendSnapshot, "inscricoes" | "aplicacoes" | "projetos">,
) {
  if (!estudante) {
    return {
      level: "bronze" as Level,
      projetosConcluidos: 0,
      metaProximoNivel: 3,
      proximoNivel: "prata" as Level,
      historico: [] as { projeto: string; data: string }[],
    }
  }

  const acceptedTurmas = new Set(
    snapshot.inscricoes
      .filter((inscricao) => inscricao.estudante === estudante.id && inscricao.status === "aceito")
      .map((inscricao) => inscricao.turma_nome),
  )
  const concludedProjects = new Set(
    snapshot.projetos
      .filter((projeto) => projeto.status === "concluido")
      .map((projeto) => projeto.nome),
  )
  const matchedProjects = new Map<string, string>()

  snapshot.aplicacoes
    .filter((aplicacao) => aplicacao.status === "aceita")
    .forEach((aplicacao) => {
      if (
        acceptedTurmas.has(aplicacao.turma_nome) &&
        concludedProjects.has(aplicacao.projeto_nome)
      ) {
        matchedProjects.set(aplicacao.projeto_nome, aplicacao.data_atualizacao)
      }
    })

  const projetosConcluidos = matchedProjects.size
  const level = getLevel(projetosConcluidos)
  const next = getNextLevel(projetosConcluidos)

  return {
    level,
    projetosConcluidos,
    metaProximoNivel: next.target,
    proximoNivel: next.next,
    historico: Array.from(matchedProjects.entries()).map(([projeto, data]) => ({
      projeto,
      data,
    })),
  }
}
