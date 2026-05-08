'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GENDER_LABEL } from '@/lib/constants'
import { PatientFormValues, patientSchema } from '../schemas/patient.schemas'
import { CreatePatientRequest, Patient } from '../types/patient.types'

interface Props {
  initialValues?: Patient
  onSubmit: (values: CreatePatientRequest) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function PatientForm({ initialValues, onSubmit, isSubmitting, submitLabel = 'Guardar' }: Props) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: initialValues?.firstName ?? '',
      lastName: initialValues?.lastName ?? '',
      documentNumber: initialValues?.documentNumber ?? '',
      birthDate: initialValues?.birthDate ?? '',
      gender: initialValues?.gender ?? '',
      phone: initialValues?.phone ?? '',
      email: initialValues?.email ?? '',
      address: initialValues?.address ?? '',
      healthInsurance: initialValues?.healthInsurance ?? '',
      insuranceNumber: initialValues?.insuranceNumber ?? '',
      medicalNotes: initialValues?.medicalNotes ?? '',
      allergies: initialValues?.allergies ?? '',
    },
  })
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  return (
    <form
      onSubmit={handleSubmit((values) => {
        // Strip empty strings so optional fields don't fail backend validation.
        // The schema accepts '' for ergonomics; the API contract does not.
        const clean = Object.fromEntries(
          Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v])
        ) as unknown as CreatePatientRequest
        onSubmit(clean)
      })}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="firstName" label="Nombre*" error={errors.firstName?.message}>
          <Input id="firstName" {...register('firstName')} />
        </Field>
        <Field id="lastName" label="Apellido*" error={errors.lastName?.message}>
          <Input id="lastName" {...register('lastName')} />
        </Field>
        <Field id="documentNumber" label="DNI / Documento" error={errors.documentNumber?.message}>
          <Input id="documentNumber" {...register('documentNumber')} />
        </Field>
        <Field id="birthDate" label="Fecha de nacimiento" error={errors.birthDate?.message}>
          <Input id="birthDate" type="date" {...register('birthDate')} />
        </Field>
        <Field id="gender" label="Género">
          <Select
            value={watch('gender') || ''}
            onValueChange={(v) => setValue('gender', v as PatientFormValues['gender'])}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GENDER_LABEL).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="phone" label="Teléfono">
          <Input id="phone" {...register('phone')} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} />
        </Field>
        <Field id="address" label="Dirección">
          <Input id="address" {...register('address')} />
        </Field>
        <Field id="healthInsurance" label="Obra social / Seguro">
          <Input id="healthInsurance" {...register('healthInsurance')} />
        </Field>
        <Field id="insuranceNumber" label="N° de afiliado">
          <Input id="insuranceNumber" {...register('insuranceNumber')} />
        </Field>
      </div>

      <Field id="medicalNotes" label="Antecedentes médicos">
        <Textarea id="medicalNotes" rows={3} {...register('medicalNotes')} />
      </Field>
      <Field id="allergies" label="Alergias">
        <Textarea id="allergies" rows={2} {...register('allergies')} />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
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
