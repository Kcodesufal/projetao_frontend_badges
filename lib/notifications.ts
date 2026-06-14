import {
  calculateGamification,
  type AppRole,
  type BackendSnapshot,
  type Estudante,
  type Ong,
  type Profile,
  type Professor,
} from "@/lib/api"

export type NotificationItem = {
  id: string
  title: string
  description: string
  href: string
  kind: "info" | "success" | "warning" | "danger"
  date?: string
}

function projectNamesForOng(profile: Ong | null, snapshot: BackendSnapshot) {
  if (!profile) return new Set<string>()
  return new Set(
    snapshot.projetos
      .filter((project) => project.ong_nome === profile.razao_social)
      .map((project) => project.nome),
  )
}

export function buildNotifications(
  role: AppRole,
  profile: Profile | null,
  snapshot: BackendSnapshot,
) {
  const items: NotificationItem[] = []

  if (!profile) {
    return [
      {
        id: "profile-incomplete",
        title: "Complete seu perfil",
        description: "Algumas funções ficam bloqueadas até o perfil estar completo.",
        href: `/completar-perfil?perfil=${role}`,
        kind: "warning" as const,
      },
    ]
  }

  if (role === "estudante") {
    const student = profile as Estudante
    const myInscriptions = snapshot.inscricoes.filter(
      (inscription) => inscription.estudante === student.id,
    )

    myInscriptions
      .filter((inscription) => inscription.status !== "pre_aprovado")
      .forEach((inscription) => {
        items.push({
          id: `inscription-${inscription.id}`,
          title:
            inscription.status === "aceito"
              ? "Inscrição aceita"
              : "Inscrição recusada",
          description: `${inscription.turma_nome} respondeu sua solicitação.`,
          href: "/inscricoes",
          kind: inscription.status === "aceito" ? "success" : "danger",
          date: inscription.data_atualizacao,
        })
      })

    const pendingCount = myInscriptions.filter(
      (inscription) => inscription.status === "pre_aprovado",
    ).length
    if (pendingCount > 0) {
      items.push({
        id: "student-pending-inscriptions",
        title: `${pendingCount} inscrição${pendingCount === 1 ? "" : "ões"} aguardando`,
        description: "Acompanhe o andamento das suas solicitações de turma.",
        href: "/inscricoes",
        kind: "warning",
      })
    }

    const gamification = calculateGamification(student, snapshot)
    gamification.historico.forEach((entry) => {
      items.push({
        id: `project-history-${entry.projeto}`,
        title: "Projeto concluído computado",
        description: `${entry.projeto} já conta para sua gamificação.`,
        href: "/perfil",
        kind: "success",
        date: entry.data,
      })
    })

    const openProjects = snapshot.projetos.filter(
      (project) => project.status === "aberto" || project.status === "em_andamento",
    ).length
    if (openProjects > 0) {
      items.push({
        id: "student-open-projects",
        title: `${openProjects} projeto${openProjects === 1 ? "" : "s"} para explorar`,
        description: "Veja oportunidades abertas para as turmas.",
        href: "/projetos",
        kind: "info",
      })
    }
  }

  if (role === "professor") {
    const professor = profile as Professor
    const myTurmaNames = new Set(snapshot.minhasTurmas.map((turma) => turma.nome))
    const pendingStudents = snapshot.inscricoes.filter(
      (inscription) =>
        myTurmaNames.has(inscription.turma_nome) && inscription.status === "pre_aprovado",
    ).length
    if (pendingStudents > 0) {
      items.push({
        id: "teacher-pending-students",
        title: `${pendingStudents} estudante${pendingStudents === 1 ? "" : "s"} aguardando`,
        description: "Aprove ou recuse inscrições nas suas turmas.",
        href: "/inscricoes",
        kind: "warning",
      })
    }

    const myApplications = snapshot.aplicacoes.filter((application) =>
      myTurmaNames.has(application.turma_nome),
    )
    const accepted = myApplications.filter((application) => application.status === "aceita")
    const rejected = myApplications.filter((application) => application.status === "recusada")
    const pending = myApplications.filter((application) => application.status === "pendente")

    if (accepted.length > 0) {
      items.push({
        id: "teacher-accepted-applications",
        title: `${accepted.length} aplicação${accepted.length === 1 ? "" : "ões"} aceita${accepted.length === 1 ? "" : "s"}`,
        description: "A ONG aprovou participação de turma em atividade.",
        href: "/aplicacoes",
        kind: "success",
        date: accepted[0]?.data_atualizacao,
      })
    }

    if (rejected.length > 0) {
      items.push({
        id: "teacher-rejected-applications",
        title: `${rejected.length} aplicação${rejected.length === 1 ? "" : "ões"} recusada${rejected.length === 1 ? "" : "s"}`,
        description: "Veja o feedback da ONG para ajustar próximas aplicações.",
        href: "/aplicacoes",
        kind: "danger",
        date: rejected[0]?.data_atualizacao,
      })
    }

    if (pending.length > 0) {
      items.push({
        id: "teacher-pending-applications",
        title: `${pending.length} aplicação${pending.length === 1 ? "" : "ões"} em análise`,
        description: "Acompanhe a resposta das ONGs.",
        href: "/aplicacoes",
        kind: "warning",
      })
    }

    if (snapshot.minhasTurmas.length === 0) {
      items.push({
        id: `teacher-create-class-${professor.id}`,
        title: "Crie sua primeira turma",
        description: "Turmas conectam estudantes aos projetos das ONGs.",
        href: "/turmas",
        kind: "info",
      })
    }
  }

  if (role === "ong") {
    const ong = profile as Ong
    const projectNames = projectNamesForOng(ong, snapshot)
    const myProjects = snapshot.projetos.filter((project) => projectNames.has(project.nome))
    const myApplications = snapshot.aplicacoes.filter((application) =>
      projectNames.has(application.projeto_nome),
    )
    const pendingApplications = myApplications.filter(
      (application) => application.status === "pendente",
    )

    if (pendingApplications.length > 0) {
      items.push({
        id: "ong-pending-applications",
        title: `${pendingApplications.length} aplicação${pendingApplications.length === 1 ? "" : "ões"} aguardando`,
        description: "Professores estão solicitando participação em atividades.",
        href: "/aplicacoes",
        kind: "warning",
        date: pendingApplications[0]?.data_aplicacao,
      })
    }

    const drafts = myProjects.filter((project) => project.status === "rascunho")
    if (drafts.length > 0) {
      items.push({
        id: "ong-draft-projects",
        title: `${drafts.length} projeto${drafts.length === 1 ? "" : "s"} em rascunho`,
        description: "Publique projetos quando estiverem prontos para receber turmas.",
        href: "/projetos",
        kind: "info",
      })
    }

    const projectsWithoutActivities = myProjects.filter(
      (project) =>
        !snapshot.atividades.some((activity) => activity.projeto_nome === project.nome),
    )
    if (projectsWithoutActivities.length > 0) {
      const first = projectsWithoutActivities[0]
      items.push({
        id: "ong-projects-without-activities",
        title: `${projectsWithoutActivities.length} projeto${projectsWithoutActivities.length === 1 ? "" : "s"} sem atividade`,
        description: "Crie atividades para professores poderem aplicar turmas.",
        href: `/projetos/${first.id}`,
        kind: "info",
      })
    }
  }

  if (items.length === 0) {
    items.push({
      id: "all-clear",
      title: "Tudo em dia",
      description: "Nenhuma pendência importante no momento.",
      href: "/dashboard",
      kind: "success",
    })
  }

  return items.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function countActionableNotifications(items: NotificationItem[]) {
  return items.filter((item) => item.kind === "warning" || item.kind === "danger").length
}
