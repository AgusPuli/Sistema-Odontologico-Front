'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth, useChangePassword } from '@/features/auth/hooks/use-auth'
import { useCurrentTenant } from '@/features/tenant/hooks/use-tenant'
import {
  ChangePasswordFormValues,
  changePasswordSchema,
} from '@/features/auth/schemas/auth.schemas'
import { DENTAL_SPECIALTY_LABEL } from '@/lib/constants'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: tenant } = useCurrentTenant()
  const { mutate: changePassword, isPending } = useChangePassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi cuenta</h1>

      <Card>
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Info label="Nombre" value={user ? `${user.firstName} ${user.lastName ?? ''}` : null} />
          <Info label="Email" value={user?.email} />
          <Info label="Rol" value={user?.role} />
          <Info
            label="Especialidad"
            value={user?.specialty ? DENTAL_SPECIALTY_LABEL[user.specialty] : null}
          />
          <Info label="N° de matrícula" value={user?.licenseNumber} />
        </CardContent>
      </Card>

      {tenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {tenant.name}
              {tenant.planExpired && <Badge variant="destructive">Plan expirado</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <Info label="Razón social" value={tenant.legalName} />
            <Info label="CUIT / Tax ID" value={tenant.taxId} />
            <Info label="Plan" value={tenant.subscriptionPlan} />
            <Info label="Usuarios máx." value={String(tenant.maxUsers)} />
            <Info label="Email" value={tenant.email} />
            <Info label="Teléfono" value={tenant.phone} />
            <div className="sm:col-span-2">
              <Info label="Dirección" value={tenant.address} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) =>
              changePassword(
                {
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                },
                { onSuccess: () => reset() }
              )
            )}
            className="grid max-w-md gap-3"
          >
            <Field id="currentPassword" label="Contraseña actual" error={errors.currentPassword?.message}>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
            </Field>
            <Field id="newPassword" label="Nueva contraseña" error={errors.newPassword?.message}>
              <Input id="newPassword" type="password" {...register('newPassword')} />
            </Field>
            <Field id="confirmPassword" label="Repetir nueva contraseña" error={errors.confirmPassword?.message}>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            </Field>
            <Button type="submit" disabled={isPending} className="justify-self-start">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Actualizar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p>{value || '-'}</p>
    </div>
  )
}

function Field({
  id,
  label,
  children,
  error,
}: {
  id: string
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
