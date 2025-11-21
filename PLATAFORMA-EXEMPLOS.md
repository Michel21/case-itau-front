# 📝 Exemplos de Código - Plataforma de Presença

## 🎨 Componentes UI Base

### 1. Button Component (Acessível)

```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        outline: "border border-gray-300 hover:bg-gray-100 focus-visible:ring-blue-500",
        ghost: "hover:bg-gray-100 focus-visible:ring-blue-500",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## 📋 Formulários com React Hook Form + Zod

### 2. Formulário de Cadastro de Adolescente

```typescript
// src/components/forms/adolescente-form.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cadastrarAdolescente } from "@/lib/actions/adolescentes"

// Schema de validação
const adolescenteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dataNascimento: z.string().refine((val) => {
    const idade = new Date().getFullYear() - new Date(val).getFullYear()
    return idade >= 12 && idade <= 17
  }, "Adolescente deve ter entre 12 e 17 anos"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  rg: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "Estado deve ter 2 letras").optional(),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos").optional(),
  responsavelId: z.string().min(1, "Selecione um responsável"),
  observacoes: z.string().optional(),
})

type AdolescenteFormData = z.infer<typeof adolescenteSchema>

interface AdolescenteFormProps {
  responsaveis: { id: string; nome: string }[]
  onSuccess?: () => void
}

export function AdolescenteForm({ responsaveis, onSuccess }: AdolescenteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdolescenteFormData>({
    resolver: zodResolver(adolescenteSchema),
  })

  const onSubmit = async (data: AdolescenteFormData) => {
    setIsSubmitting(true)
    try {
      await cadastrarAdolescente(data)
      reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao cadastrar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="required">
            Nome Completo
          </Label>
          <Input
            id="nome"
            {...register("nome")}
            aria-invalid={!!errors.nome}
            aria-describedby={errors.nome ? "nome-error" : undefined}
          />
          {errors.nome && (
            <p id="nome-error" className="text-sm text-red-600" role="alert">
              {errors.nome.message}
            </p>
          )}
        </div>

        {/* Data de Nascimento */}
        <div className="space-y-2">
          <Label htmlFor="dataNascimento" className="required">
            Data de Nascimento
          </Label>
          <Input
            id="dataNascimento"
            type="date"
            {...register("dataNascimento")}
            aria-invalid={!!errors.dataNascimento}
            aria-describedby={errors.dataNascimento ? "data-error" : undefined}
          />
          {errors.dataNascimento && (
            <p id="data-error" className="text-sm text-red-600" role="alert">
              {errors.dataNascimento.message}
            </p>
          )}
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf" className="required">
            CPF
          </Label>
          <Input
            id="cpf"
            {...register("cpf")}
            placeholder="12345678900"
            maxLength={11}
            aria-invalid={!!errors.cpf}
            aria-describedby={errors.cpf ? "cpf-error" : undefined}
          />
          {errors.cpf && (
            <p id="cpf-error" className="text-sm text-red-600" role="alert">
              {errors.cpf.message}
            </p>
          )}
        </div>

        {/* RG */}
        <div className="space-y-2">
          <Label htmlFor="rg">RG (Opcional)</Label>
          <Input id="rg" {...register("rg")} />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone (Opcional)</Label>
          <Input id="telefone" {...register("telefone")} placeholder="(11) 99999-9999" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (Opcional)</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>

        {/* Responsável */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="responsavelId" className="required">
            Responsável Legal
          </Label>
          <Select id="responsavelId" {...register("responsavelId")}>
            <option value="">Selecione...</option>
            {responsaveis.map((resp) => (
              <option key={resp.id} value={resp.id}>
                {resp.nome}
              </option>
            ))}
          </Select>
          {errors.responsavelId && (
            <p className="text-sm text-red-600" role="alert">
              {errors.responsavelId.message}
            </p>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco">Endereço Completo (Opcional)</Label>
          <Input id="endereco" {...register("endereco")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" {...register("cidade")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado">UF</Label>
            <Input id="estado" {...register("estado")} maxLength={2} placeholder="SP" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" {...register("cep")} maxLength={8} placeholder="12345678" />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações (Opcional)</Label>
          <Textarea id="observacoes" {...register("observacoes")} rows={4} />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Limpar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar Adolescente"}
        </Button>
      </div>
    </form>
  )
}
```

---

## 📊 Dashboard e Estatísticas

### 3. Componente de Dashboard

```typescript
// src/app/dashboard/page.tsx
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { getEstatisticas } from "@/lib/actions/dashboard"
import { FrequenciaChart } from "@/components/charts/frequencia-chart"

export default async function DashboardPage() {
  const stats = await getEstatisticas()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do controle de presença
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Adolescentes
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdolescentes}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Presentes Hoje
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.presentesHoje}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.porcentagemPresenca}% de frequência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ausentes Hoje
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.ausentesHoje}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.justificados} justificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Média Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.mediaMensal}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              +{stats.variacao}% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Frequência */}
      <Card>
        <CardHeader>
          <CardTitle>Frequência dos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Carregando gráfico...</div>}>
            <FrequenciaChart data={stats.frequenciaMensal} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      {stats.alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{alerta.adolescente}</p>
                    <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                  </div>
                  <span className="text-xs text-gray-500">{alerta.data}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## ✅ Server Actions (Next.js 14)

### 4. Actions para Presença

```typescript
// src/lib/actions/presenca.ts
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const checkInSchema = z.object({
  adolescenteId: z.string().cuid(),
  observacao: z.string().optional(),
})

export async function registrarCheckIn(data: z.infer<typeof checkInSchema>) {
  const session = await auth()
  if (!session) {
    throw new Error("Não autenticado")
  }

  const validated = checkInSchema.parse(data)

  // Verificar se já tem check-in hoje
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const presencaExistente = await prisma.presenca.findFirst({
    where: {
      adolescenteId: validated.adolescenteId,
      data: {
        gte: hoje,
      },
    },
  })

  if (presencaExistente) {
    throw new Error("Check-in já realizado hoje")
  }

  // Registrar presença
  const presenca = await prisma.presenca.create({
    data: {
      adolescenteId: validated.adolescenteId,
      checkIn: new Date(),
      status: "PRESENTE",
      observacao: validated.observacao,
      registradoPor: session.user?.name,
    },
    include: {
      adolescente: {
        select: {
          nome: true,
          responsavel: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      },
    },
  })

  // Revalidar páginas
  revalidatePath("/dashboard")
  revalidatePath("/presenca")

  return {
    success: true,
    data: presenca,
  }
}

export async function registrarCheckOut(presencaId: string) {
  const session = await auth()
  if (!session) {
    throw new Error("Não autenticado")
  }

  const presenca = await prisma.presenca.update({
    where: { id: presencaId },
    data: {
      checkOut: new Date(),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/presenca")

  return {
    success: true,
    data: presenca,
  }
}

export async function obterHistoricoPresenca(adolescenteId: string) {
  const historico = await prisma.presenca.findMany({
    where: {
      adolescenteId,
    },
    orderBy: {
      data: "desc",
    },
    take: 30, // Últimos 30 registros
  })

  return historico
}
```

---

## 🔐 Configuração de Autenticação

### 5. NextAuth Configuration

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
      }
      return session
    },
  },
}
```

---

## 📱 Componente de Check-in com QR Code

### 6. Registro Rápido com QR Code

```typescript
// src/components/presenca/qr-check-in.tsx
"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { registrarCheckIn } from "@/lib/actions/presenca"

interface QRCheckInProps {
  adolescenteId: string
  adolescenteNome: string
}

export function QRCheckIn({ adolescenteId, adolescenteNome }: QRCheckInProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const qrValue = JSON.stringify({
    type: "check-in",
    adolescenteId,
    timestamp: Date.now(),
  })

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      await registrarCheckIn({ adolescenteId })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6 text-center">
        <h3 className="text-lg font-semibold">{adolescenteNome}</h3>

        <div className="flex justify-center">
          <QRCodeSVG value={qrValue} size={200} />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Escaneie o QR Code ou clique no botão para registrar presença
          </p>

          <Button
            onClick={handleCheckIn}
            disabled={loading || success}
            className="w-full"
          >
            {loading ? "Registrando..." : success ? "✓ Registrado!" : "Registrar Presença"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

---

Isso cobre os componentes e funcionalidades principais! Execute o script de setup para criar o projeto completo. 🚀

