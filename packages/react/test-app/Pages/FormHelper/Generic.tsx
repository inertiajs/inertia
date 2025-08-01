import type { FormDataConvertible } from '@inertiajs/core'
import type { InertiaFormProps } from '@inertiajs/react'

interface GenericProps<TFormData extends Record<string, FormDataConvertible>> {
  form: InertiaFormProps<TFormData>
}

export default function Generic<TFormData extends Record<string, FormDataConvertible>>({ 
  form 
}: GenericProps<TFormData>) {
  return (
    <div>
      {/* Generic form component */}
    </div>
  )
}