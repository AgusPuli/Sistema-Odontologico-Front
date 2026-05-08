'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/shared/form-field'
import { LoginFormValues, loginSchema } from '../schemas/auth.schemas'
import { useLogin } from '../hooks/use-auth'

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { mutate: login, isPending } = useLogin()

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Odontograma</CardTitle>
        <CardDescription>Ingresá tus credenciales para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="dentista@clinica.com"
              {...register('email')}
            />
          </FormField>
          <FormField id="password" label="Contraseña" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Iniciar sesión
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            ¿Primera vez?{' '}
            <Link href="/setup" className="text-primary hover:underline">
              Inicializar sistema
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
