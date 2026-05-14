# 🖥️ Meeting Room Booking — Frontend

Sistema de agendamento de salas de reunião desenvolvido como desafio técnico. Esta documentação cobre o **planejamento do frontend**, arquitetura adotada, design system e decisões de design tomadas antes da implementação.

---

## Sumário

- [Sobre o sistema](#sobre-o-sistema)
- [Tecnologias](#tecnologias)
- [Dependências](#dependências)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Design system](#design-system)
- [Dark mode](#dark-mode)
- [Páginas e funcionalidades](#páginas-e-funcionalidades)
- [Checklist de desenvolvimento](#checklist-de-desenvolvimento)
- [Como rodar localmente](#como-rodar-localmente)
- [Responsividade](#responsividade)

---

## Sobre o sistema

Interface web para gerenciamento de reservas de salas de reunião. Permite que usuários autenticados visualizem salas disponíveis, criem e cancelem reservas, e acompanhem os agendamentos em lista ou calendário interativo.

Três salas são disponibilizadas de forma fixa. A autenticação é simulada via mock com JWT.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Vue 3 (Composition API) |
| UI Framework | Quasar |
| Linguagem | TypeScript |
| Gerenciamento de estado | Pinia |
| Roteamento | Vue Router 4 |
| Calendário interativo | FullCalendar + @fullcalendar/vue3 |
| Requisições HTTP | Axios |
| Dark mode | CSS custom properties + Quasar dark plugin |
| Testes | Vitest |

---

## Dependências

### Produção

| Pacote | Versão sugerida | Finalidade |
|---|---|---|
| `vue` | ^3.4 | Framework principal |
| `quasar` | ^2.x | Componentes UI e utilitários |
| `pinia` | ^2.x | Gerenciamento de estado global |
| `vue-router` | ^4.x | Roteamento SPA |
| `axios` | ^1.x | Cliente HTTP |
| `@tabler/icons-vue` | ^3.x | Conjunto de ícones (vocabulário fechado do design system) |
| `@fullcalendar/vue3` | ^6.x | Componente Vue do FullCalendar |
| `@fullcalendar/core` | ^6.x | Core do FullCalendar |
| `@fullcalendar/daygrid` | ^6.x | View de mês/grade do calendário |
| `@fullcalendar/timegrid` | ^6.x | View de semana/dia com horários |
| `@fullcalendar/interaction` | ^6.x | Suporte a clique e drag no calendário |

### Desenvolvimento

| Pacote | Finalidade |
|---|---|
| `@quasar/app-vite` | Build tooling do Quasar com Vite |
| `typescript` | Compilador TypeScript |
| `vitest` | Test runner — zero config com TypeScript |
| `@vue/test-utils` | Utilitários de teste para componentes Vue |
| `@types/node` | Tipos nativos do Node.js |

### Instalação

```bash
npm install vue quasar pinia vue-router axios @tabler/icons-vue \
  @fullcalendar/vue3 @fullcalendar/core @fullcalendar/daygrid \
  @fullcalendar/timegrid @fullcalendar/interaction

npm install -D @quasar/app-vite typescript vitest @vue/test-utils @types/node
```

---

## Arquitetura

O projeto adota **Feature-first Architecture**, variação pragmática do Feature-Sliced Design. Cada feature é um módulo autossuficiente com seus próprios componentes, composables, store e service. A camada `shared` contém tudo que é transversal — design system, cliente HTTP, componentes base.

```
Pages → Features → Shared
```

### Regra de dependência

As importações sempre apontam para baixo:

- **Pages** importam de `features/` e `shared/`
- **Features** importam de `shared/` — **nunca de outras features**
- **Shared** não importa de nada do projeto

Essa regra evita acoplamento circular e garante que cada feature possa ser desenvolvida e testada de forma independente.

### Pages

Orquestram as features para compor uma tela. Não contêm lógica de negócio — apenas importam componentes, chamam composables e leem stores. Uma page por rota.

| Page | Rota | Descrição |
|---|---|---|
| `LoginPage` | `/login` | Tela de login mock |
| `RoomsPage` | `/rooms` | Listagem das 3 salas com status |
| `BookingsPage` | `/bookings` | Lista de reservas do usuário |
| `CalendarPage` | `/calendar` | Visualização em calendário interativo |

### Features

Cada feature contém:

- `components/` — componentes Vue específicos da feature
- `composables/` — lógica reutilizável (sem UI)
- `store/` — estado global da feature via Pinia
- `services/` — chamadas HTTP ao backend

#### auth
Responsável por login, logout e persistência do token JWT.

- `LoginForm.vue` — formulário de login com validação
- `useAuth.ts` — lógica de login/logout, leitura do token
- `auth.store.ts` — usuário logado, token, estado de autenticação
- `auth.service.ts` — `POST /auth/login`

#### bookings
Responsável por criar, listar e cancelar reservas.

- `BookingCard.vue` — exibe uma reserva com status e ação de cancelar
- `BookingForm.vue` — formulário de criação com seleção de sala e horário
- `useBookings.ts` — validações de formulário, CRUD de reservas
- `booking.store.ts` — lista de reservas carregadas
- `booking.service.ts` — `GET/POST/DELETE /bookings`

#### rooms
Responsável por listar as salas e expor a ação de reservar.

- `RoomCard.vue` — card de sala com nome e botão "Reservar"
- `room.store.ts` — lista de salas
- `room.service.ts` — `GET /rooms`

#### calendar
Responsável pela visualização em calendário interativo.

- `CalendarView.vue` — wrapper do FullCalendar com configuração e eventos
- `useCalendar.ts` — mapeia `Booking[]` para o formato de eventos do FullCalendar

### Shared

Consumido por todas as features. Nunca importa de features.

- `http.ts` — instância Axios configurada com `baseURL` e interceptor de token JWT
- `BaseButton.vue` — wrapper do botão Quasar com variantes do design system
- `BaseInput.vue` — wrapper do input Quasar com estados do design system
- `BaseCard.vue` — card genérico com variante de acento lateral
- `AppBadge.vue` — badge de status semântico
- `design-system/` — tokens CSS, tipografia e override do tema Quasar

### Router

`router/index.ts` define as rotas e o **navigation guard** que redireciona para `/login` quando não há token válido.

---

## Estrutura de pastas

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.vue
│   │   ├── composables/
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   └── auth.store.ts
│   │   └── services/
│   │       └── auth.service.ts
│   │
│   ├── bookings/
│   │   ├── components/
│   │   │   ├── BookingCard.vue
│   │   │   └── BookingForm.vue
│   │   ├── composables/
│   │   │   └── useBookings.ts
│   │   ├── store/
│   │   │   └── booking.store.ts
│   │   └── services/
│   │       └── booking.service.ts
│   │
│   ├── rooms/
│   │   ├── components/
│   │   │   └── RoomCard.vue
│   │   ├── store/
│   │   │   └── room.store.ts
│   │   └── services/
│   │       └── room.service.ts
│   │
│   └── calendar/
│       ├── components/
│       │   └── CalendarView.vue
│       └── composables/
│           └── useCalendar.ts
│
├── shared/
│   ├── http.ts
│   ├── components/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseCard.vue
│   │   └── AppBadge.vue
│   ├── composables/
│   │   └── useTheme.ts
│   └── design-system/
│       ├── tokens.css
│       ├── tokens.dark.css
│       ├── typography.css
│       └── quasar-theme.scss
│
├── layouts/
│   └── AuthenticatedLayout.vue  ← header com toggle de dark mode + logout
│
├── pages/
│   ├── LoginPage.vue
│   ├── RoomsPage.vue
│   ├── BookingsPage.vue
│   └── CalendarPage.vue
│
├── router/
│   └── index.ts
│
├── boot/
│   ├── auth.ts                  ← hidrata o auth.store com o token do localStorage
│   └── theme.ts                 ← aplica preferência salva de dark mode
│
└── main.ts

tests/
└── unit/
    ├── useAuth.test.ts
    ├── useBookings.test.ts
    └── useCalendar.test.ts
```

---

## Design system

O design system é definido em `shared/design-system/` e consumido por todos os componentes via variáveis CSS e classes utilitárias. O objetivo é manter consistência visual sem depender de convenções implícitas.

### Paleta de cores

Os tokens são definidos em duas camadas: `tokens.css` com os valores de light mode (padrão), e `tokens.dark.css` com os overrides aplicados via classe `.body--dark` do Quasar.

**Light mode (padrão)**

| Token | Valor | Uso |
|---|---|---|
| `--brand-600` | `#1a56a0` | Ações primárias, links, foco |
| `--brand-700` | `#154a8e` | Hover de ações primárias |
| `--brand-200` | `#b5d0f5` | Bordas de elementos brand |
| `--brand-50` | `#e8f0fb` | Fundos sutis brand |
| `--neutral-900` | `#212529` | Texto principal |
| `--neutral-700` | `#495057` | Texto secundário |
| `--neutral-500` | `#adb5bd` | Texto muted, placeholders |
| `--neutral-300` | `#dee2e6` | Bordas padrão |
| `--neutral-100` | `#f1f3f5` | Fundos de superfície |
| `--surface` | `#ffffff` | Fundo de cards e modais |
| `--page-bg` | `#f8f9fa` | Fundo geral da página |
| `--success` | `#1a7a4a` | Confirmado, disponível |
| `--warning` | `#8a5700` | Pendente, reservado em breve |
| `--danger` | `#b91c1c` | Cancelado, erro, ocupado |
| `--info` | `#1a56a0` | Informativo, em andamento |

**Dark mode (`.body--dark`)**

| Token | Valor | Uso |
|---|---|---|
| `--brand-600` | `#4d8fd4` | Ações primárias — mais claro para contraste |
| `--brand-200` | `#1e3a5f` | Bordas brand sutis |
| `--brand-50` | `#0f2035` | Fundos brand em dark |
| `--neutral-900` | `#f1f3f5` | Texto principal (invertido) |
| `--neutral-700` | `#ced4da` | Texto secundário |
| `--neutral-500` | `#6c757d` | Texto muted |
| `--neutral-300` | `#343a40` | Bordas padrão |
| `--neutral-100` | `#1e2124` | Fundos de superfície |
| `--surface` | `#212529` | Fundo de cards e modais |
| `--page-bg` | `#161a1d` | Fundo geral da página |
| `--success` | `#2ecc71` | Confirmado (mais luminoso) |
| `--warning` | `#f5a623` | Pendente (mais luminoso) |
| `--danger` | `#e05252` | Cancelado (mais luminoso) |
| `--info` | `#4d8fd4` | Informativo |

### Tipografia

| Nome | Tamanho | Peso | Uso |
|---|---|---|---|
| `heading-xl` | 24px | 500 | Títulos de página |
| `heading-lg` | 20px | 500 | Títulos de seção |
| `heading-md` | 16px | 500 | Títulos de card |
| `body` | 14px | 400 | Texto geral |
| `caption` | 12px | 400 | Metadados, datas, autores |
| `label` | 13px | 500 | Labels de formulário |

### Espaçamento

Escala de 7 passos: `4px · 8px · 12px · 16px · 24px · 32px · 48px`

Usada para `gap`, `padding` e `margin`. Nunca valores arbitrários fora dessa escala.

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 4px | Badges, pills pequenos |
| `--radius-md` | 6px | Inputs, botões, elementos inline |
| `--radius-lg` | 10px | Cards, modais, containers |
| `--radius-xl` | 14px | Containers de página |

### Componentes base

#### BaseButton

Variantes semânticas: `primary` · `secondary` · `ghost` · `danger`
Tamanhos: `sm` (28px) · `md` (36px, padrão) · `lg` (44px)
Estado `disabled` consistente em todas as variantes.

#### BaseInput

Estados: `default` · `focus` (anel azul 3px) · `error` (borda + fundo vermelho + mensagem abaixo) · `disabled` (fundo cinza, cursor proibido)
Variantes: `text` · `datetime-local` · `select` · `textarea`

#### BaseCard

Variante padrão: fundo branco, borda `0.5px` neutra, `border-radius-lg`.
Variante com acento: borda lateral colorida para sinalizar categoria ou alerta (brand / success / warning / danger).

#### AppBadge

5 variantes semânticas: `success` · `warning` · `danger` · `info` · `neutral`
Suporte a dot colorido e ícone Tabler inline.

### Ícones

Biblioteca: **Tabler Icons** (outline). Vocabulário fechado de 16 ícones usados no sistema:

`calendar` · `calendar-plus` · `clock` · `users` · `building` · `trash` · `edit` · `check` · `x` · `alert-circle` · `login` · `logout` · `filter` · `chevron-down` · `arrow-left` · `arrow-right`

### Avatares

3 tamanhos: `sm` (24px) · `md` (32px) · `lg` (40px)
Iniciais geradas automaticamente do nome do usuário logado. Fundo brand-50, texto brand-600.

### Override do Quasar

`quasar-theme.scss` sobrescreve as variáveis de cor do Quasar (`$primary`, `$secondary`, `$positive`, `$negative`, `$warning`) com os tokens do design system. Isso garante que os componentes nativos do Quasar sigam a paleta sem precisar de props de cor em cada uso.

---

## Dark mode

O dark mode é implementado em duas camadas que trabalham juntas: o **Quasar Dark Plugin** controla o estado global (ligado/desligado/automático), e os **tokens CSS** fazem a adaptação visual sem nenhuma lógica condicional nos componentes.

### Como funciona

O Quasar aplica automaticamente a classe `.body--dark` no `<body>` quando o dark mode está ativo. Os tokens de dark mode são definidos em `tokens.dark.css` escopados nessa classe:

```css
/* tokens.css — valores padrão (light) */
:root {
  --surface: #ffffff;
  --page-bg: #f8f9fa;
  --neutral-900: #212529;
  --brand-600: #1a56a0;
}

/* tokens.dark.css — overrides para dark mode */
.body--dark {
  --surface: #212529;
  --page-bg: #161a1d;
  --neutral-900: #f1f3f5;
  --brand-600: #4d8fd4;
}
```

Como todos os componentes usam variáveis CSS (`var(--surface)`, `var(--neutral-900)` etc.), a troca de tema acontece automaticamente — nenhum componente precisa de lógica condicional de cor.

### Controle do tema

O estado do dark mode é gerenciado pelo `useQuasar` do Quasar e persistido via `localStorage`:

```ts
// shared/composables/useTheme.ts
import { useQuasar } from 'quasar'

export function useTheme() {
  const $q = useQuasar()

  function toggleDark() {
    $q.dark.toggle()
    localStorage.setItem('dark-mode', String($q.dark.isActive))
  }

  function initTheme() {
    const saved = localStorage.getItem('dark-mode')
    if (saved !== null) {
      $q.dark.set(saved === 'true')
    } else {
      $q.dark.set('auto') // segue preferência do sistema operacional
    }
  }

  return { isDark: $q.dark.isActive, toggleDark, initTheme }
}
```

`initTheme` é chamado no boot file `src/boot/theme.ts`. O toggle é exposto num botão no `AuthenticatedLayout` (header das páginas privadas).

### FullCalendar em dark mode

O FullCalendar usa suas próprias variáveis CSS. O override é feito em `tokens.dark.css` escopado na classe `.body--dark`:

```css
.body--dark .fc {
  --fc-border-color: var(--neutral-300);
  --fc-page-bg-color: var(--surface);
  --fc-neutral-bg-color: var(--neutral-100);
  --fc-today-bg-color: var(--brand-50);
  color: var(--neutral-900);
}
```

---

## Páginas e funcionalidades

### LoginPage `/login`

- Formulário com campos `username` e `password`
- Validação de campos obrigatórios
- Chamada ao backend via `auth.service.ts`
- Em caso de sucesso: salva token no `auth.store`, redireciona para `/rooms`
- Em caso de erro: exibe mensagem inline no formulário

### RoomsPage `/rooms`

- Lista as 3 salas com `RoomCard`
- Cada card exibe o nome da sala e um botão "Reservar"
- Botão "Reservar" abre o `BookingForm` com a sala pré-selecionada

### BookingsPage `/bookings`

- Lista as reservas do usuário logado via `booking.store`
- Cada item renderizado com `BookingCard`
- Botão "Cancelar" visível somente nas reservas do usuário logado
- Botão flutuante "Nova reserva" abre `BookingForm`

### CalendarPage `/calendar`

- `CalendarView` com FullCalendar em view semanal (padrão)
- Botões de navegação para alternar entre mês, semana e dia
- Eventos coloridos por sala
- Clique em evento abre card com detalhes da reserva
- Clique em slot vazio abre `BookingForm` com data/hora pré-preenchida

### BookingForm (componente modal)

- Campos: título, sala, data de início, data de término
- Validações locais antes de submeter:
  - Campos obrigatórios
  - `startTime` não pode estar no passado
  - `startTime` deve ser anterior a `endTime`
- Validação de conflito feita pelo backend — exibe erro retornado na resposta

---

## Checklist de desenvolvimento

### Etapa 1 — Setup do projeto

- [x] Criar projeto com `npm create quasar@latest` selecionando **SPA mode** + Vite + TypeScript + Vue Router + Pinia
- [x] Configurar `tsconfig.json` com `strict: true` e path aliases (`@/` → `src/`)
- [x] Configurar scripts no `package.json` (`dev`, `build`, `test`, `test:watch`)
- [x] Criar `.env` e `.env.example` com `VITE_API_BASE_URL`
- [x] Configurar `.gitignore`

### Etapa 2 — Design system

- [x] Criar `shared/design-system/tokens.css` com variáveis de cor (light), espaçamento e radius
- [x] Criar `shared/design-system/tokens.dark.css` com overrides escopados em `.body--dark`
- [x] Criar `shared/design-system/typography.css` com a escala tipográfica
- [x] Criar `shared/design-system/quasar-theme.scss` com override das variáveis do Quasar
- [x] Importar os arquivos no `main.ts` / `quasar.config.ts`
- [x] Criar `src/boot/theme.ts` para inicializar o tema com a preferência salva (somente no cliente)

### Etapa 3 — Shared: componentes base

- [x] Implementar `BaseButton.vue` (variantes + tamanhos + disabled)
- [x] Implementar `BaseInput.vue` (estados: default, focus, error, disabled)
- [x] Implementar `BaseCard.vue` (padrão + variante acento)
- [x] Implementar `AppBadge.vue` (5 variantes semânticas + dot)
- [x] Implementar `shared/composables/useTheme.ts` com toggle e persistência em `localStorage`
- [x] Implementar `shared/http.ts` — instância Axios com `baseURL` e interceptor de token

### Etapa 4 — Router e navigation guard

- [x] Configurar rotas em `router/index.ts` (`/login`, `/rooms`, `/bookings`, `/calendar`)
- [x] Implementar navigation guard que verifica token no `auth.store` antes de cada rota protegida
- [x] Redirecionar para `/login` quando não autenticado

### Etapa 5 — Feature: auth

- [x] Implementar `auth.service.ts` com `POST /auth/login`
- [x] Implementar `auth.store.ts` com estado do usuário e token, persistido em `localStorage`
- [x] Criar `src/boot/auth.ts` para hidratar a store com o token salvo no `localStorage`
- [x] Implementar `useAuth.ts` com lógica de login e logout
- [x] Implementar `LoginForm.vue` com validação e feedback de erro
- [x] Implementar `LoginPage.vue` orquestrando o formulário

### Etapa 6 — Feature: rooms

- [x] Implementar `room.service.ts` com `GET /rooms`
- [x] Implementar `room.store.ts` com lista de salas
- [x] Implementar `RoomCard.vue` com nome da sala e botão "Reservar"
- [x] Implementar `RoomsPage.vue` carregando e exibindo os cards

### Etapa 7 — Feature: bookings

- [ ] Implementar `booking.service.ts` com `GET`, `POST` e `DELETE /bookings`
- [ ] Implementar `booking.store.ts` com lista de reservas
- [ ] Implementar `useBookings.ts` com validações de formulário e CRUD
- [ ] Implementar `BookingCard.vue` com botão de cancelar condicional (somente dono)
- [ ] Implementar `BookingForm.vue` com validações locais e tratamento de erro de conflito
- [ ] Implementar `BookingsPage.vue` com lista e botão de nova reserva

### Etapa 8 — Feature: calendar

- [ ] Instalar e configurar FullCalendar (`@fullcalendar/vue3`, `daygrid`, `timegrid`, `interaction`)
- [ ] Adicionar override das variáveis CSS do FullCalendar em `tokens.dark.css` para dark mode
- [ ] Implementar `useCalendar.ts` mapeando `Booking[]` para eventos do FullCalendar
- [ ] Implementar `CalendarView.vue` com views mês/semana/dia e eventos coloridos por sala
- [ ] Implementar clique em evento exibindo detalhes da reserva
- [ ] Implementar clique em slot vazio abrindo `BookingForm` com data pré-preenchida
- [ ] Implementar `CalendarPage.vue`

### Etapa 9 — Testes unitários

Escritos com Vitest + `@vue/test-utils` após os composables estarem implementados.

**`useAuth`**
- [ ] Salva token e usuário no store após login bem-sucedido
- [ ] Limpa store após logout

**`useBookings`**
- [ ] Lança erro de validação quando `startTime` está no passado
- [ ] Lança erro de validação quando `startTime >= endTime`
- [ ] Chama `booking.service` com os dados corretos em criação bem-sucedida

**`useCalendar`**
- [ ] Mapeia corretamente `Booking[]` para o formato de eventos do FullCalendar
- [ ] Aplica cor correta por sala

### Etapa 10 — Finalização

- [ ] Revisar consistência visual em todas as páginas com o design system
- [ ] Validar dark mode em todas as páginas — verificar contraste, bordas e fundos
- [ ] Garantir que nenhuma cor está hardcoded nos componentes (apenas `var()`)
- [ ] Garantir que nenhuma lógica de negócio está nas pages ou nos componentes
- [ ] Confirmar que todos os testes passam (`npm test`)
- [ ] Confirmar que a regra de dependência entre features está sendo respeitada
- [ ] Validar layout em mobile, tablet e desktop usando o grid system do Quasar
- [ ] Atualizar README com instruções definitivas de como rodar localmente
- [ ] Commitar com histórico organizado por etapa

---

## Como rodar localmente

> O backend precisa estar rodando em `http://localhost:3000` antes de subir o frontend. Veja [../backend/README.md](../backend/README.md).

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Conferir VITE_API_BASE_URL=http://localhost:3000

# Rodar em desenvolvimento (Vite com hot reload)
npm run dev

# Rodar testes
npm test

# Rodar testes em watch mode
npm run test:watch

# Build de produção (SPA estática em /dist/spa)
npm run build
```

---

## Responsividade

O critério "Responsividade" do desafio é marcado como **não obrigatório**, mas é avaliado. O projeto usa o **grid system do Quasar** (`<q-page>`, `<q-page-container>`, classes `row` / `col-12 col-md-6 col-lg-4` etc.) e os breakpoints padrão do Quasar (`sm`, `md`, `lg`, `xl`) para adaptar:

- **Mobile** (< 600px): cards em coluna única, `BookingForm` ocupa a tela inteira.
- **Tablet** (600–1024px): salas em 2 colunas, calendário em view diária.
- **Desktop** (≥ 1024px): salas em 3 colunas, calendário em view semanal.

Não há esforço dedicado para refinar o layout mobile — apenas a garantia de que nenhuma página quebra.

---

## O que foi deixado de fora (intencionalmente)

- Sem SSR — desafio não pede e adiciona complexidade desproporcional (boot guards, hydration, etc.); SPA do Quasar atende
- Sem i18n — sistema interno em português, sem múltiplos idiomas
- Sem Storybook — design system documentado no README, tamanho do projeto não justifica
- Sem testes de componente com montagem completa — foco nos composables onde a lógica vive