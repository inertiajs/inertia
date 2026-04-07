import type { FormComponentProps, FormComponentSlotProps } from '@inertiajs/core'
import type { Component, ComponentProps, Snippet } from 'svelte'
import Form from './Form.svelte'

type TypedFormComponent<TForm extends Record<string, any>> = Component<
  Omit<ComponentProps<typeof Form>, 'children' | 'optimistic' | 'transform' | 'resetOnSuccess' | 'resetOnError'> & {
    optimistic?: FormComponentProps<TForm>['optimistic']
    transform?: FormComponentProps<TForm>['transform']
    resetOnSuccess?: FormComponentProps<TForm>['resetOnSuccess']
    resetOnError?: FormComponentProps<TForm>['resetOnError']
    children?: Snippet<[FormComponentSlotProps<TForm>]>
  }
>

export function createForm<TForm extends Record<string, any> = Record<string, any>>(): TypedFormComponent<TForm> {
  return Form as unknown as TypedFormComponent<TForm>
}
