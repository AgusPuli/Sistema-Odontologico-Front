import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

/**
 * Form field wrapper: <Label /> + control + error/hint.
 * Replaces the duplicated Field() helpers that lived inline in each form.
 *
 * Usage:
 *   <FormField id="email" label="Email" required error={errors.email?.message}>
 *     <Input id="email" type="email" {...register('email')} />
 *   </FormField>
 */
export function FormField({ id, label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
