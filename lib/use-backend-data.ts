"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  apiFetch,
  type Aplicacao,
  type Atividade,
  type BackendSnapshot,
  type Estudante,
  type Ong,
  type Professor,
  type Projeto,
  type Turma,
  type Universidade,
  type Inscricao,
  type Badge,
} from "@/lib/api"
import { useAuth } from "@/components/auth-provider"

const emptySnapshot: BackendSnapshot = {
  projetos: [],
  atividades: [],
  turmas: [],
  minhasTurmas: [],
  inscricoes: [],
  aplicacoes: [],
  estudantes: [],
  professores: [],
  ongs: [],
  universidades: [],
  badges: [],
}

export function useBackendData() {
  const { session, role, profile } = useAuth()
  const [data, setData] = useState<BackendSnapshot>(emptySnapshot)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session?.access) {
      setData(emptySnapshot)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [
        projetos,
        atividades,
        turmas,
        inscricoes,
        aplicacoes,
        estudantes,
        professores,
        ongs,
        universidades,
        badges,
      ] = await Promise.all([
        apiFetch<Projeto[]>("/projetos/", { token: session.access }),
        apiFetch<Atividade[]>("/atividades/", { token: session.access }),
        apiFetch<Turma[]>("/turmas/", { token: session.access }),
        apiFetch<Inscricao[]>("/estudantes/inscricoes/", { token: session.access }),
        apiFetch<Aplicacao[]>("/aplicacoes/", { token: session.access }),
        apiFetch<Estudante[]>("/estudantes/", { token: session.access }),
        apiFetch<Professor[]>("/professores/", { token: session.access }),
        apiFetch<Ong[]>("/ongs/", { token: session.access }),
        apiFetch<Universidade[]>("/professores/universidades/", { token: session.access }),
        apiFetch<Badge[]>("/badges/", { token: session.access }),
      ])

      let minhasTurmas: Turma[] = []
      if (role === "professor") {
        try {
          minhasTurmas = await apiFetch<Turma[]>("/turmas/minhas-turmas/", {
            token: session.access,
          })
        } catch {
          minhasTurmas = []
        }
      }

      setData({
        projetos,
        atividades,
        turmas,
        minhasTurmas,
        inscricoes,
        aplicacoes,
        estudantes,
        professores,
        ongs,
        universidades,
        badges,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.")
    } finally {
      setLoading(false)
    }
  }, [role, session?.access])

  useEffect(() => {
    void load()
  }, [load])

  const derived = useMemo(() => {
    const student = role === "estudante" ? (profile as Estudante | null) : null
    const professor = role === "professor" ? (profile as Professor | null) : null
    const ong = role === "ong" ? (profile as Ong | null) : null

    const myInscricoes = student
      ? data.inscricoes.filter((inscricao) => inscricao.estudante === student.id)
      : professor
        ? data.inscricoes.filter((inscricao) =>
            data.minhasTurmas.some((turma) => turma.id === inscricao.turma),
          )
        : data.inscricoes

    const myProjectNames = new Set(
      ong
        ? data.projetos
            .filter((projeto) => projeto.ong_nome === ong.razao_social)
            .map((projeto) => projeto.nome)
        : data.projetos.map((projeto) => projeto.nome),
    )

    const myAplicacoes =
      role === "ong"
        ? data.aplicacoes.filter((aplicacao) => myProjectNames.has(aplicacao.projeto_nome))
        : role === "professor"
          ? data.aplicacoes.filter((aplicacao) =>
              data.minhasTurmas.some((turma) => turma.nome === aplicacao.turma_nome),
            )
          : data.aplicacoes

    const myProjetos =
      role === "ong"
        ? data.projetos.filter((projeto) => projeto.ong_nome === ong?.razao_social)
        : data.projetos

    return {
      student,
      professor,
      ong,
      myInscricoes,
      myAplicacoes,
      myProjetos,
      myTurmas: role === "professor" ? data.minhasTurmas : data.turmas,
    }
  }, [data, profile, role])

  return {
    data,
    ...derived,
    loading,
    error,
    reload: load,
  }
}
