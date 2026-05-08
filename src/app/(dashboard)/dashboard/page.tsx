'use client'
import Link from 'next/link'
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  FileText,
  Stethoscope,
  Users,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { LoadingState } from '@/components/shared/loading-state'
import { formatMoney } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard'

const QUICK_LINKS = [
  { href: '/patients/new', label: 'Nuevo paciente', icon: Users },
  { href: '/appointments', label: 'Ver agenda', icon: CalendarDays },
  { href: '/treatments', label: 'Catálogo de tratamientos', icon: Stethoscope },
  { href: '/estimates', label: 'Presupuestos', icon: FileText },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenido${user ? `, ${user.firstName}` : ''}`}
        description="Resumen de la actividad de tu clínica"
      />

      {isLoading && <LoadingState />}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pacientes activos"
              value={stats.activePatients}
              hint={`${stats.totalPatients} en total`}
              icon={Users}
            />
            <StatCard
              label="Turnos hoy"
              value={stats.appointmentsToday}
              hint={`${stats.appointmentsThisWeek} esta semana`}
              icon={CalendarCheck2}
            />
            <StatCard
              label="Tratamientos pendientes"
              value={stats.pendingTreatmentItems}
              hint="A realizar / en curso"
              icon={ClipboardList}
            />
            <StatCard
              label="Presupuestos por cobrar"
              value={formatMoney(stats.estimatedRevenuePending)}
              hint={`${stats.activeEstimates} activos`}
              icon={Wallet}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Próximos turnos"
              value={stats.upcomingAppointments}
              icon={CalendarDays}
            />
            <StatCard
              label="Catálogo de tratamientos"
              value={stats.treatmentsInCatalog}
              icon={Stethoscope}
            />
            <StatCard
              label="Pacientes en cartera"
              value={stats.totalPatients}
              icon={Users}
            />
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <Button asChild key={href} variant="outline" className="h-auto justify-start gap-3 p-4">
                <Link href={href}>
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
