# Projetão — Guia de Design e UI/UX

Guia visual e de experiência para implementação do frontend do **Projetão**, a plataforma que conecta ONGs, professores universitários e estudantes em projetos sociais.

> Foco: ferramenta web real (dashboard, formulários, listagens, acompanhamento de progresso). **Não** é uma landing page de startup.

---

## 1. Conceito visual geral

**Personalidade da interface:** organizada, confiável, social e educacional. Uma ferramenta de trabalho que pessoas usam com frequência — clara o suficiente para um estudante novo e densa o suficiente para um professor gerenciar várias turmas.

**Sensação que o produto deve passar:**
- Confiança institucional (universidade + ONG), sem parecer burocrático.
- Propósito social e humano (impacto real, comunidade).
- Progresso e conquista (a gamificação reforça o engajamento, sem infantilizar).

**Estilo visual recomendado:**
- Design limpo, "data-friendly", inspirado em ferramentas de produtividade (Linear, Notion, Vercel Dashboard) com um toque humano vindo da cor e dos cards.
- Layout arejado, hierarquia tipográfica forte, cantos suavemente arredondados (`radius` ~12px).
- Sombras sutis em vez de bordas pesadas. Cor usada com intenção (verde-azulado = marca/ação; laranja = destaque pontual; medalhas = gamificação).
- Evitar gradientes decorativos, blobs e ilustrações abstratas. Usar ícones consistentes e fotos/avatares reais quando houver pessoas/projetos.

---

## 2. Paleta de cores

| Token | HEX | Quando usar |
|---|---|---|
| **Primária (Teal)** | `#0F766E` | Cor da marca. Botões primários, links, estados ativos da navegação, foco, ícones de destaque. |
| Primária hover | `#0D625C` | Hover/active de elementos primários. |
| Primária suave (superfície) | `#E9F1F0` | Fundo de chips, badges informativos, item de menu ativo, realces leves. |
| **Secundária / Acento (Laranja)** | `#F97316` | Apenas como destaque pontual: CTA secundário de alta importância, alertas de ação, indicador de "novo". Nunca como cor dominante. |
| **Fundo (app)** | `#F5F8F7` | Fundo geral das páginas. |
| **Superfície / Card** | `#FFFFFF` | Cards, modais, inputs, tabelas, painéis. |
| **Sidebar (escura)** | `#0F3D39` | Fundo da navegação lateral, dando contraste e "âncora" visual. |
| **Texto principal** | `#0F1A19` | Títulos e corpo de texto. |
| **Texto secundário** | `#5A6B69` | Legendas, descrições, placeholders, metadados. |
| **Borda / divisória** | `#E2E8E7` | Bordas de cards, inputs, separadores. |
| **Sucesso** | `#16A34A` | Aprovações, conclusões, status "concluído"/"aprovado". |
| **Alerta / Atenção** | `#D97706` | Pendências, "aguardando aprovação", prazos próximos. |
| **Erro** | `#DC2626` | Recusas, erros de formulário, ações destrutivas. |

### Cores de gamificação

| Nível | HEX | Uso |
|---|---|---|
| **Bronze** | `#B87333` | Estudante iniciante (poucos projetos concluídos). Badge, anel de progresso, ícone de medalha. |
| **Prata** | `#8E9AA3` | Nível intermediário. |
| **Gold** | `#D4A017` | Nível avançado / referência. |

**Regras de uso da cor:**
- Mantenha o teal como a única cor "de ação" recorrente. O laranja aparece em <10% das telas.
- Cores de status (verde/amarelo/vermelho) só em badges, ícones e textos curtos de estado — nunca como fundo de seções grandes.
- Cores de medalha só aparecem no contexto de gamificação (perfil, badge de nível, ranking).
- Sempre que mudar a cor de fundo de um elemento, ajuste a cor do texto para manter contraste.

---

## 3. Tipografia

- **Títulos:** `Plus Jakarta Sans` (Google Fonts) — geométrica, moderna, confiável.
- **Texto / interface:** `Inter` (Google Fonts) — excelente legibilidade em tabelas e formulários.
- **Mono (opcional):** `Geist Mono` para IDs, códigos de turma, valores técnicos.

| Estilo | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| H1 | 30–32px (`text-3xl`) | 700 | 1.2 | Título de página / dashboard. |
| H2 | 24px (`text-2xl`) | 700 | 1.25 | Títulos de seção. |
| H3 | 20px (`text-xl`) | 600 | 1.3 | Títulos de card / bloco. |
| H4 | 16px (`text-base`) | 600 | 1.4 | Subtítulos, rótulos de grupo. |
| Body | 15–16px | 400/500 | 1.5–1.6 | Texto padrão. |
| Body small | 14px (`text-sm`) | 400 | 1.5 | Texto secundário, descrições. |
| Caption | 12–13px (`text-xs`) | 500 | 1.4 | Metadados, labels de badge, timestamps. |
| Botão | 14–15px | 600 | 1 | Sempre semibold; nunca abaixo de 14px. |

**Regras:** no máximo 2 famílias; nunca texto de corpo abaixo de 14px; títulos em `text-balance`, parágrafos longos em `text-pretty`.

---

## 4. Layout

**Estilo de dashboard:** shell fixo com **navegação lateral (sidebar) à esquerda** + topbar fina. A sidebar escura ancora a marca e a navegação por perfil; o conteúdo fica em fundo claro.

- **Sidebar:** largura 260px (recolhível para 72px só ícones). Itens com ícone + label, item ativo com fundo `--sidebar-accent` e barra/realce primário. Bloco do usuário + nível no rodapé.
- **Topbar:** 56–64px. Título da página/breadcrumb à esquerda; busca, notificações e troca de perfil/avatar à direita.
- **Conteúdo:** largura máxima ~1200px (`max-w-6xl`), centralizado, padding `px-6 py-6` (desktop) / `px-4 py-4` (mobile).
- **Grid:** 12 colunas conceituais com `gap-6`. Cards de métrica em `grid sm:grid-cols-2 lg:grid-cols-4`. Conteúdo principal + lateral em `lg:grid-cols-3` (2/3 + 1/3).
- **Espaçamento:** escala Tailwind (4/6/8). Use `gap-*` para espaçamento entre filhos; nunca misture `margin`/`padding` com `gap` no mesmo elemento.
- **Responsividade:** mobile-first. Sidebar vira drawer (off-canvas) em telas pequenas; topbar ganha botão hambúrguer. Tabelas viram cards empilhados ou ganham scroll horizontal controlado.

**Telas com muitos formulários:** agrupar em seções com título + descrição curta à esquerda e campos à direita (padrão "settings"). Formulários longos divididos em **steps** ou **abas**. Ações fixas (`Salvar`/`Cancelar`) em rodapé sticky.

**Telas com tabelas:** filtros e busca acima da tabela, contagem de resultados, paginação no rodapé. Linhas com ação principal por clique + menu de ações (`...`). Densidade confortável (linhas ~52px).

---

## 5. Componentes principais

**Botões**
- Primário: fundo teal, texto branco, `radius-lg`, `h-10`, peso 600. Hover escurece.
- Secundário (outline): borda + texto teal, fundo transparente/branco.
- Ghost: sem borda, para ações terciárias e itens de menu.
- Destrutivo: vermelho, somente para excluir/recusar (com confirmação).
- Tamanhos: `sm` (h-8), `default` (h-10), `lg` (h-11). Ícone à esquerda do texto, 16–18px.

**Inputs / Selects**
- Altura 40px, borda `--input`, `radius-md`, fundo branco. Label acima (peso 500). Foco com anel teal (`ring-2`). Mensagem de ajuda/erro abaixo em 13px. Estado de erro: borda + texto vermelho. Placeholder em texto secundário.

**Cards**
- Fundo branco, borda `--border` sutil, `radius-xl`, padding `p-5/p-6`, sombra leve no hover quando clicável. Cabeçalho (título + ação) + corpo + rodapé opcional.

**Tabelas / Listas**
- Cabeçalho com texto secundário em maiúsculas suaves (12–13px), linhas divididas por borda clara, zebra opcional muito sutil. Em mobile, converter para lista de cards.

**Badges de status** (pílula, 12px, peso 600):
- Aprovado/Concluído → fundo verde suave + texto verde.
- Pendente/Aguardando → fundo âmbar suave + texto âmbar.
- Recusado/Erro → fundo vermelho suave + texto vermelho.
- Informativo (ex.: "Inscrito") → fundo teal suave + texto teal.

**Card de projeto:** imagem/cover ou ícone da ONG, nome do projeto, nome da ONG, tags de área (educação, meio ambiente...), status, nº de vagas/turmas, CTA "Ver detalhes".

**Card de turma:** código da turma, disciplina, professor, semestre, nº de estudantes, projeto vinculado (ou "sem projeto"), status da aplicação.

**Barra / progresso de gamificação:** anel ou barra mostrando progresso até o próximo nível. Cor segue o nível atual (bronze/prata/gold). Exibir "X de Y projetos concluídos" e o próximo marco. Acompanhar de badge de nível e XP/contagem.

**Estados:**
- *Vazio:* ícone neutro + título curto + 1 frase + CTA. Ex.: "Você ainda não está em nenhuma turma."
- *Loading:* skeletons com a forma do conteúdo (cards/linhas), nunca spinner solto em tela cheia.
- *Erro:* mensagem clara + ação de tentar novamente. Não culpar o usuário.

---

## 6. Direção por perfil

**Estudante** — foco em acompanhamento e motivação.
- Destaque para o **card de gamificação** (nível atual + progresso) logo no topo.
- "Minhas turmas", "Projetos vinculados", próximas atividades, status de inscrições.
- Tom encorajador. Visual mais leve e celebratório (badges, progresso).

**Professor** — foco em gestão.
- Métricas: nº de turmas, estudantes pendentes de aprovação, aplicações em andamento.
- Ações rápidas: "Criar turma", "Aprovar estudantes", "Aplicar turma em atividade".
- Tabelas e listas em primeiro plano; eficiência > decoração.

**ONG** — foco em projetos e curadoria.
- Métricas: projetos ativos, atividades abertas, aplicações de professores pendentes.
- Ações: "Criar projeto", "Criar atividade", "Aprovar/recusar aplicações".
- Visual institucional e confiável; destaque para impacto (estudantes envolvidos, projetos concluídos).

---

## 7. Telas recomendadas

1. **Login** — formulário central (email + senha), logo, link "Criar conta" e "Esqueci a senha".
2. **Cadastro com escolha de perfil** — passo 1: escolher perfil (Estudante / Professor / ONG) em cards selecionáveis; passo 2: dados básicos.
3. **Completar perfil** — campos específicos por perfil (estudante: curso/universidade; professor: instituição/departamento; ONG: nome, área de atuação, CNPJ).
4. **Dashboard** — visão por perfil (ver seção 6).
5. **Listagem de projetos** — busca + filtros (área, status, ONG), grid de cards de projeto.
6. **Detalhe do projeto** — cabeçalho com ONG, descrição, atividades, turmas aplicadas, vagas, CTA contextual por perfil.
7. **Minhas turmas** — lista/grid de turmas (estudante vê as que participa; professor as que criou).
8. **Inscrições** — estudante acompanha status (inscrito, aprovado, recusado) por turma/atividade.
9. **Aplicações** — professor aplica turmas em atividades; ONG aprova/recusa (tabela com ações).
10. **Perfil / Gamificação** — dados, nível (bronze/prata/gold), progresso, histórico de projetos concluídos.

---

## 8. Microcopy (pt-BR)

**Tom de voz:** próximo, claro e respeitoso. Direto sem ser seco. Trata o usuário por "você". Verbos de ação nos botões.

**Botões:** `Entrar`, `Criar conta`, `Continuar`, `Salvar alterações`, `Criar projeto`, `Criar turma`, `Aplicar turma`, `Aprovar`, `Recusar`, `Ver detalhes`, `Inscrever-se`.

**Títulos:** "Bem-vindo de volta", "Vamos começar", "Como você vai usar o Projetão?", "Seus projetos", "Aprovações pendentes".

**Mensagens de erro:** "Não conseguimos entrar. Verifique seu email e senha.", "Este campo é obrigatório.", "Use um email válido.", "Algo deu errado. Tente novamente."

**Estados vazios:**
- "Você ainda não está em nenhuma turma. Explore os projetos disponíveis."
- "Nenhuma aplicação pendente por aqui. Tudo em dia!"
- "Você ainda não concluiu nenhum projeto. Sua jornada começa agora."

**Sucesso/confirmação:** "Turma criada com sucesso.", "Aplicação enviada. Aguarde a aprovação da ONG.", "Estudante aprovado."

---

## 9. Acessibilidade

- **Contraste:** texto principal sobre fundo ≥ 4.5:1; texto grande/ícones ≥ 3:1. Teal `#0F766E` sobre branco e branco sobre teal passam em AA.
- **Tamanhos mínimos:** corpo ≥ 14px; alvos de toque ≥ 44×44px; espaçamento suficiente entre ações.
- **Foco visual:** anel de foco visível (`ring-2` teal) em todos os elementos interativos; nunca remover outline sem substituto.
- **Cor não é o único sinal:** status sempre acompanhado de **texto e/ou ícone** (ex.: "Aprovado" com check, não só verde). Gamificação mostra rótulo do nível, não só a cor da medalha.
- **Semântica:** HTML semântico (`header`, `nav`, `main`, `table`), labels associados a inputs, `alt` em imagens, roles/ARIA corretos. Navegação completa por teclado.

---

## 10. Regras de design

**Evitar:**
- Roxo/violeta e gradientes decorativos; blobs e formas abstratas como enfeite.
- Excesso de cores ou mais de 2 fontes.
- Emojis como ícones.
- Densidade exagerada sem respiro; ou o oposto, telas vazias e infladas.
- Visual genérico de landing page (hero gigante, "marketing speak").

**Priorizar:**
- Hierarquia clara, espaçamento consistente e alinhamento à grade.
- Estados completos (vazio, loading, erro) em toda lista/tela.
- Feedback imediato em ações (toasts, mudanças de status).
- Consistência de componentes (mesmo botão, badge e card em todo lugar).

**Como manter profissional, moderno e confiável:**
- Uma cor de marca dominante (teal), acento usado com parcimônia.
- Sombras sutis, cantos suaves, tipografia forte.
- Conteúdo real e dados claros acima de decoração.
- Microcopy humano e objetivo, em pt-BR.
