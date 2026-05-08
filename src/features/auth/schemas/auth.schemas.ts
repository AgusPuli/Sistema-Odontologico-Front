import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const bootstrapSchema = z.object({
  clinicName: z.string().min(1, 'Requerido').max(100),
  adminFirstName: z.string().min(1, 'Requerido').max(100),
  adminLastName: z.string().max(100).optional().or(z.literal('')),
  adminEmail: z.string().email('Email inválido'),
  adminPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
    .regex(/\d/, 'Debe incluir al menos un número'),
})
export type BootstrapFormValues = z.infer<typeof bootstrapSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Requerido'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
      .regex(/\d/, 'Debe incluir al menos un número'),
    confirmPassword: z.string().min(1, 'Requerido'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
