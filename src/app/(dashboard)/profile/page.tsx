'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { InfoField } from '@/components/shared/info-field'
import { FormField } from '@/components/shared/form-field'
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
      <PageHeader title="Mi cuenta" description="Gestioná tu perfil y los datos de la clínica" />

      <Card>
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <InfoField
            label="Nombre"
            value={user ? `${user.firstName} ${user.lastName ?? ''}` : null}
          />
          <InfoField label="Email" value={user?.email} />
          <InfoField label="Rol" value={user?.role} />
          <InfoField
            label="Especialidad"
            value={user?.specialty ? DENTAL_SPECIALTY_LABEL[user.specialty] : null}
          />
          <InfoField label="N° de matrícula" value={user?.licenseNumber} />
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
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <InfoField label="Razón social" value={tenant.legalName} />
            <InfoField label="CUIT / Tax ID" value={tenant.taxId} />
            <InfoField label="Plan" value={tenant.subscriptionPlan} />
            <InfoField label="Usuarios máx." value={String(tenant.maxUsers)} />
            <InfoField label="Email" value={tenant.email} />
            <InfoField label="Teléfono" value={tenant.phone} />
            <InfoField label="Dirección" value={tenant.address} className="sm:col-span-2" />
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
            <FormField
              id="currentPassword"
              label="Contraseña actual"
              error={errors.currentPassword?.message}
            >
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
            </FormField>
            <FormField
              id="newPassword"
              label="Nueva contraseña"
              error={errors.newPassword?.message}
              hint="Mínimo 8 caracteres con mayúscula, minúscula y número."
            >
              <Input id="newPassword" type="password" {...register('newPassword')} />
            </FormField>
            <FormField
              id="confirmPassword"
              label="Repetir nueva contraseña"
              error={errors.confirmPassword?.message}
            >
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            </FormField>
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
