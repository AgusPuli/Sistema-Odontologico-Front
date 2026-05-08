'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth'

const NAV: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/appointments', label: 'Turnos', icon: CalendarDays },
  { href: '/treatments', label: 'Tratamientos', icon: Stethoscope },
  { href: '/estimates', label: 'Presupuestos', icon: FileText },
  { href: '/profile', label: 'Mi cuenta', icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { mutate: logout } = useLogout()

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="border-b p-4">
        <p className="text-lg font-semibold leading-tight">Odontograma</p>
        <p className="text-xs text-muted-foreground">Sistema de gestión dental</p>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        {user && (
          <div className="mb-2">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName ?? ''}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
