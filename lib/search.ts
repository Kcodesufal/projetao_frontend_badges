import {
  projetoStatusLabels,
  type AppRole,
  type BackendSnapshot,
  type Profile,
} from "@/lib/api"

export type SearchResult = {
  id: string
  title: string
  description: string
  href: string
  group: "Projetos" | "Turmas" | "Atividades" | "Aplicações" | "Inscrições" | "Perfil" | "Sistema"
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function matches(query: string, values: Array<string | number | undefined | null>) {
  return values.some((value) => normalize(String(value ?? "")).includes(query))
}

export function buildSearchResults(
  role: AppRole,
  profile: Profile | null,
  snapshot: BackendSnapshot,
  rawQuery: string,
) {
  const query = normalize(rawQuery)
  if (query.length < 2) return []

  const results: SearchResult[] = []
  const projectByName = new Map(snapshot.projetos.map((project) => [project.nome, project]))

  const systemPages = [
    {
      id: "system-settings",
      title: "Configurações",
      description: "Editar perfil e trocar senha",
      href: "/configuracoes",
    },
    {
      id: "system-management",
      title: "Gerência",
      description: "Usuários, universidades e documentação da API",
      href: "/gerencia",
    },
    {
      id: "system-notifications",
      title: "Notificações",
      description: "Pendências e avisos calculados pelo sistema",
      href: "/notificacoes",
    },
  ]

  systemPages
    .filter((page) => role !== "ong" || page.href !== "/gerencia")
    .forEach((page) => {
    if (matches(query, [page.title, page.description])) {
      results.push({
        ...page,
        group: "Sistema",
      })
    }
  })

  snapshot.projetos.forEach((project) => {
    if (
      matches(query, [
        project.nome,
        project.descricao,
        project.objetivo,
        project.publico_alvo,
        project.ong_nome,
        projetoStatusLabels[project.status],
      ])
    ) {
      results.push({
        id: `project-${project.id}`,
        title: project.nome,
        description: `${project.ong_nome} · ${projetoStatusLabels[project.status]}`,
        href: `/projetos/${project.id}`,
        group: "Projetos",
      })
    }
  })

  snapshot.turmas.forEach((turma) => {
    const university = turma.universidade_detalhes ?? turma.universidade
    if (
      matches(query, [
        turma.nome,
        turma.descricao,
        turma.semestre,
        turma.periodo,
        turma.modalidade,
        university?.nome,
      ])
    ) {
      results.push({
        id: `class-${turma.id}`,
        title: turma.nome,
        description: `${university?.nome ?? "Universidade"} · ${turma.semestre}`,
        href: `/turmas?busca=${encodeURIComponent(rawQuery)}`,
        group: "Turmas",
      })
    }
  })

  snapshot.atividades.forEach((activity) => {
    const project = projectByName.get(activity.projeto_nome)
    if (
      matches(query, [
        activity.nome,
        activity.descricao,
        activity.tipo,
        activity.projeto_nome,
        activity.carga_horaria,
      ])
    ) {
      results.push({
        id: `activity-${activity.id}`,
        title: activity.nome,
        description: `${activity.projeto_nome} · ${activity.tipo}`,
        href: project ? `/projetos/${project.id}` : "/projetos",
        group: "Atividades",
      })
    }
  })

  snapshot.aplicacoes.forEach((application) => {
    if (
      matches(query, [
        application.projeto_nome,
        application.atividade_nome,
        application.turma_nome,
        application.professor_nome,
        application.status,
        application.justificativa,
        application.feedback_ong,
      ])
    ) {
      results.push({
        id: `application-${application.id}`,
        title: application.atividade_nome,
        description: `${application.turma_nome} · ${application.status}`,
        href: "/aplicacoes",
        group: "Aplicações",
      })
    }
  })

  snapshot.inscricoes.forEach((inscription) => {
    if (
      matches(query, [
        inscription.estudante_nome,
        inscription.turma_nome,
        inscription.universidade_nome,
        inscription.status,
      ])
    ) {
      results.push({
        id: `inscription-${inscription.id}`,
        title: inscription.turma_nome,
        description: `${inscription.estudante_nome} · ${inscription.status}`,
        href: "/inscricoes",
        group: "Inscrições",
      })
    }
  })

  const profileText =
    role === "ong" && profile && "razao_social" in profile
      ? [profile.razao_social, profile.causa_social, profile.cnpj]
      : profile && "universidade_detalhes" in profile
        ? [
            profile.usuario_detalhes.nome,
            profile.usuario_detalhes.email,
            profile.universidade_detalhes.nome,
            "curso" in profile ? profile.curso : "professor",
          ]
        : []

  if (profile && matches(query, profileText)) {
    results.unshift({
      id: "profile-current",
      title: "Meu perfil",
      description: "Dados cadastrais e gamificação",
      href: "/perfil",
      group: "Perfil",
    })
  }

  return results.slice(0, 12)
}

export function fallbackSearchHref(rawQuery: string) {
  return `/projetos?busca=${encodeURIComponent(rawQuery)}`
}
