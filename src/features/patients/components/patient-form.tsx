'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/form-field'
import { GENDER_LABEL } from '@/lib/constants'
import { cleanEmptyStrings } from '@/lib/form-utils'
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(cleanEmptyStrings(values) as CreatePatientRequest)
      })}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="Nombre" required error={errors.firstName?.message}>
          <Input id="firstName" {...register('firstName')} />
        </FormField>
        <FormField id="lastName" label="Apellido" required error={errors.lastName?.message}>
          <Input id="lastName" {...register('lastName')} />
        </FormField>
        <FormField id="documentNumber" label="DNI / Documento" error={errors.documentNumber?.message}>
          <Input id="documentNumber" {...register('documentNumber')} />
        </FormField>
        <FormField id="birthDate" label="Fecha de nacimiento" error={errors.birthDate?.message}>
          <Input id="birthDate" type="date" {...register('birthDate')} />
        </FormField>
        <FormField id="gender" label="Género">
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
        </FormField>
        <FormField id="phone" label="Teléfono">
          <Input id="phone" {...register('phone')} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} />
        </FormField>
        <FormField id="address" label="Dirección">
          <Input id="address" {...register('address')} />
        </FormField>
        <FormField id="healthInsurance" label="Obra social / Seguro">
          <Input id="healthInsurance" {...register('healthInsurance')} />
        </FormField>
        <FormField id="insuranceNumber" label="N° de afiliado">
          <Input id="insuranceNumber" {...register('insuranceNumber')} />
        </FormField>
      </div>

      <FormField id="medicalNotes" label="Antecedentes médicos">
        <Textarea id="medicalNotes" rows={3} {...register('medicalNotes')} />
      </FormField>
      <FormField id="allergies" label="Alergias">
        <Textarea id="allergies" rows={2} {...register('allergies')} />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
