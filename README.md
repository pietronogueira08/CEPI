# CEPI — Centro Educacional Pequena Isa

<div align="center">
  <h3>Sistema de Gestão Escolar Premium</h3>
  <p>Grussaí, RJ · Next.js 15 · TypeScript · Prisma · Auth.js</p>
</div>

---

## 🚀 Tecnologias

| Categoria | Stack |
|-----------|-------|
| **Framework** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript |
| **ORM** | Prisma (SQLite dev / PostgreSQL prod) |
| **Autenticação** | Auth.js v5 (NextAuth) + MFA/TOTP |
| **Estilização** | Tailwind CSS v4 + CSS Variables |
| **Animações** | Framer Motion |
| **Ícones** | Lucide React |
| **MFA** | otplib (TOTP) + QRCode |

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── (auth)/          # Login, MFA Setup
│   ├── (dashboard)/     # Dashboards por role
│   │   ├── admin/       # Diretor
│   │   ├── secretary/   # Secretaria
│   │   ├── teacher/     # Professor + Diário de Classe
│   │   ├── parent/      # Responsável + Boletim
│   │   └── student/     # Aluno + Boletim
│   └── api/             # Auth.js + MFA APIs
├── components/
│   ├── layout/          # Sidebar responsiva
│   ├── financial/       # InvoiceCard animado
│   ├── grades/          # GradeInput tátil
│   └── skeleton/        # Loading screens
├── lib/
│   ├── auth.ts          # Auth.js + MFA
│   ├── db.ts            # Prisma singleton
│   ├── mfa.ts           # TOTP utilities
│   └── actions/         # Server Actions
└── middleware.ts        # Proteção de rotas por role
```

## 👥 Perfis de Usuário

| Perfil | Acesso | MFA Obrigatório |
|--------|--------|-----------------|
| **ADMIN** (Diretor) | Total | ✅ Sim |
| **SECRETARY** (Secretaria) | Financeiro, Matrículas | ✅ Sim |
| **TEACHER** (Professor) | Turmas, Notas, Frequência | ❌ |
| **PARENT** (Responsável) | Boletim, Financeiro | ❌ |
| **STUDENT** (Aluno) | Boletim, Frequência | ❌ |

## ⚙️ Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env conforme necessário
```

### 3. Criar banco de dados e aplicar schema
```bash
npm run db:push
```

### 4. Popular com dados de demonstração
```bash
npm run db:seed
```

### 5. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🔐 Contas de Demo

| Perfil | Email | Senha | MFA |
|--------|-------|-------|-----|
| Diretor | `diretor@cepi.edu.br` | `Admin@123` | Configurar na 1ª entrada |
| Secretária | `secretaria@cepi.edu.br` | `Secret@123` | Configurar na 1ª entrada |
| Professor | `carlos@cepi.edu.br` | `Teacher@123` | — |
| Responsável | `roberto.pai@email.com` | `Parent@123` | — |
| Aluno | `joao@cepi.edu.br` | `Student@123` | — |

## ✨ Funcionalidades Premium

### 🎨 Design System
- Paleta CEPI: Azul Marinho Royal + Amarelo Girassol
- Glassmorphism em componentes selecionados
- Microinterações com Framer Motion
- Mobile-First com sidebar responsiva
- Skeleton screens para todos os estados de carregamento

### 💳 Módulo Financeiro
- Expansão fluida de boletos com animação Framer Motion
- Animação de "Sucesso" premium ao marcar como pago
- Código de barras e PIX com cópia com um toque
- Dashboard financeiro com taxa de arrecadação

### 📝 Diário de Classe
- Input de notas com feedback visual tátil (verde/amarelo/vermelho)
- Auto-save com animação de check
- Tabela responsiva por turma e disciplina

### 📊 Boletim Escolar
- Cards interativos no mobile por disciplina
- Tabela completa no desktop com médias e situação
- Compartilhado entre Aluno e Responsável

### 🔔 Sistema de Notificações
- Interface `INotificationProvider` modular
- Preparado para injeção de IA/Chatbot sem refatoração

## 🗄️ Banco de Dados

```bash
npm run db:studio   # Abrir Prisma Studio (GUI)
npm run db:push     # Aplicar schema
npm run db:seed     # Popular dados de demo
```

## 📦 Deploy

Para produção, configure:
```env
DATABASE_URL="postgresql://..."  # Migrar de SQLite para PostgreSQL
NEXTAUTH_SECRET="<secret-forte>"
NEXTAUTH_URL="https://seu-dominio.com"
```

---

<div align="center">
  Desenvolvido com ❤️ para o CEPI — Centro Educacional Pequena Isa, Grussaí/RJ
</div>
