'use client'
import Link from 'next/link'
import { CalendarDays, FileText, Stethoscope, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'

const QUICK_LINKS = [
  { href: '/patients', label: 'Pacientes', icon: Users, description: 'Gestionar pacientes y odontogramas' },
  { href: '/appointments', label: 'Turnos', icon: CalendarDays, description: 'Agenda diaria y semanal' },
  { href: '/treatments', label: 'Catálogo de tratamientos', icon: Stethoscope, description: 'Procedimientos por especialidad' },
  { href: '/estimates', label: 'Presupuestos', icon: FileText, description: 'Presupuestos por paciente' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Bienvenido{user ? `, ${user.firstName}` : ''}</h1>
        <p className="text-muted-foreground">Panel principal del sistema</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, icon: Icon, description }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
