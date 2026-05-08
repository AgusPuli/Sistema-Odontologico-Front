'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/form-field'
import { cleanEmptyStrings } from '@/lib/form-utils'
import { useBootstrap } from '@/features/auth/hooks/use-auth'
import {
  BootstrapFormValues,
  bootstrapSchema,
} from '@/features/auth/schemas/auth.schemas'
import type { BootstrapRequest } from '@/features/auth/types/auth.types'

/**
 * First-run setup screen. Calls POST /auth/bootstrap to create the first
 * tenant + SUPERADMIN. The backend rejects duplicate calls with 409, in
 * which case the hook redirects to /login automatically.
 */
export default function SetupPage() {
  const { mutate, isPending } = useBootstrap()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BootstrapFormValues>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: {
      clinicName: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
    },
  })

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">Inicializar sistema</CardTitle>
        <CardDescription>
          Esta pantalla aparece sólo la primera vez. Creá la clínica y la cuenta del administrador
          principal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) =>
            mutate(cleanEmptyStrings(values) as BootstrapRequest)
          )}
          className="space-y-4"
        >
          <FormField id="clinicName" label="Nombre de la clínica" required error={errors.clinicName?.message}>
            <Input id="clinicName" placeholder="Clínica Dental Pérez" {...register('clinicName')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="adminFirstName" label="Tu nombre" required error={errors.adminFirstName?.message}>
              <Input id="adminFirstName" {...register('adminFirstName')} />
            </FormField>
            <FormField id="adminLastName" label="Tu apellido" error={errors.adminLastName?.message}>
              <Input id="adminLastName" {...register('adminLastName')} />
            </FormField>
          </div>
          <FormField id="adminEmail" label="Email" required error={errors.adminEmail?.message}>
            <Input id="adminEmail" type="email" {...register('adminEmail')} />
          </FormField>
          <FormField
            id="adminPassword"
            label="Contraseña"
            required
            error={errors.adminPassword?.message}
            hint="Mínimo 8 caracteres con mayúscula, minúscula y número."
          >
            <Input id="adminPassword" type="password" {...register('adminPassword')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear cuenta y entrar
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            ¿El sistema ya está inicializado?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
