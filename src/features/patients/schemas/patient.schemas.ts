import { z } from 'zod'

export const patientSchema = z.object({
  firstName: z.string().min(1, 'Requerido').max(100),
  lastName: z.string().min(1, 'Requerido').max(100),
  documentNumber: z.string().max(30).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  healthInsurance: z.string().max(100).optional().or(z.literal('')),
  insuranceNumber: z.string().max(50).optional().or(z.literal('')),
  medicalNotes: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
})

export type PatientFormValues = z.infer<typeof patientSchema>
