import { type FormDataConvertible, type FormDataKeys } from '@inertiajs/core'
import * as React from 'react'
import { type InertiaFormProps } from '.'

export interface InertiaFormFieldProps<
  TData extends Record<string, FormDataConvertible> = Record<string, FormDataConvertible>,
  TName extends FormDataKeys<TData> = FormDataKeys<TData>,
> {
  name: TName
  state: {
    value: TData[TName]
    error: string | undefined
    valid: boolean
    invalid: boolean
  }
  setValue: (value: TData[TName]) => void
  setError: (error: string) => void
  clearError: () => void
  reset: () => void
  resetAndClearError: () => void
}

function Controller<
  TData extends Record<string, FormDataConvertible> = Record<string, FormDataConvertible>,
  TName extends FormDataKeys<TData> = FormDataKeys<TData>,
>({
  form,
  name,
  children,
}: {
  form: InertiaFormProps<TData>
  name: TName
  children: ((field: InertiaFormFieldProps<TData, TName>) => React.ReactNode) | React.ReactNode
}): React.ReactNode {
  const state = React.useMemo(() => {
    const error = form.errors[name]

    return {
      value: form.data[name],
      error,
      valid: !!error,
      invalid: !error,
    }
  }, [form, name])

  const setValue = React.useCallback(
    (value: TData[TName]) => {
      form.setData({ [name]: value } as Partial<object>)
    },
    [form, name],
  )

  const setError = React.useCallback(
    (error: string) => {
      form.setError(name, error)
    },
    [form, name],
  )
  const clearError = React.useCallback(() => {
    form.clearErrors(name)
  }, [form, name])

  const reset = React.useCallback(() => {
    form.reset(name)
  }, [form, name])
  const resetAndClearError = React.useCallback(() => {
    form.resetAndClearErrors(name)
  }, [form, name])

  return typeof children === 'function'
    ? children({
        name,
        state,
        setValue,
        setError,
        clearError,
        reset,
        resetAndClearError,
      })
    : children
}

export default Controller
