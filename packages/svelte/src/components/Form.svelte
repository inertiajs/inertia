<script lang="ts">
  import {
    formDataToObject,
    resetFormFields,
    mergeDataIntoQueryString,
    type Errors,
    type FormComponentProps,
    type FormDataConvertible,
    type VisitOptions,
  } from '@inertiajs/core'
  import { isEqual } from 'es-toolkit'
  import { onMount } from 'svelte'
  import useForm from '../useForm'

  const noop = () => undefined

  export let action: FormComponentProps['action'] = ''
  export let method: FormComponentProps['method'] = 'get'
  export let headers: FormComponentProps['headers'] = {}
  export let queryStringArrayFormat: FormComponentProps['queryStringArrayFormat'] = 'brackets'
  export let errorBag: FormComponentProps['errorBag'] = null
  export let showProgress: FormComponentProps['showProgress'] = true
  export let transform: FormComponentProps['transform'] = (data) => data
  export let options: FormComponentProps['options'] = {}
  export let onCancelToken: FormComponentProps['onCancelToken'] = noop
  export let onBefore: FormComponentProps['onBefore'] = noop
  export let onStart: FormComponentProps['onStart'] = noop
  export let onProgress: FormComponentProps['onProgress'] = noop
  export let onFinish: FormComponentProps['onFinish'] = noop
  export let onCancel: FormComponentProps['onCancel'] = noop
  export let onSuccess: FormComponentProps['onSuccess'] = noop
  export let onError: FormComponentProps['onError'] = noop
  export let onSubmitComplete: FormComponentProps['onSubmitComplete'] = noop
  export let disableWhileProcessing: boolean = false
  export let invalidateCacheTags: FormComponentProps['invalidateCacheTags'] = []
  export let resetOnError: FormComponentProps['resetOnError'] = false
  export let resetOnSuccess: FormComponentProps['resetOnSuccess'] = false
  export let setDefaultsOnSuccess: FormComponentProps['setDefaultsOnSuccess'] = false

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement
  let isDirty = false
  let defaultData: FormData = new FormData()

  $: _method = typeof action === 'object' ? action.method : (method.toLowerCase() as FormComponentProps['method'])
  $: _action = typeof action === 'object' ? action.url : action

  function getFormData(): FormData {
    return new FormData(formElement)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  function getData(): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData())
  }

  function updateDirtyState(event: Event) {
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData))
  }

  export function submit() {
    const [url, _data] = mergeDataIntoQueryString(_method, _action, getData(), queryStringArrayFormat)

    const maybeReset = (resetOption: boolean | string[] | undefined) => {
      if (!resetOption) {
        return
      }

      if (resetOption === true) {
        reset()
      } else if (resetOption.length > 0) {
        reset(...resetOption)
      }
    }

    const submitOptions: FormSubmitOptions = {
      headers,
      errorBag,
      showProgress,
      invalidateCacheTags,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess: (...args) => {
        if (onSuccess) {
          onSuccess(...args)
        }

        if (onSubmitComplete) {
          onSubmitComplete({
            reset,
            defaults,
          })
        }

        maybeReset(resetOnSuccess)

        if (setDefaultsOnSuccess === true) {
          defaults()
        }
      },
      onError: (...args) => {
        if (onError) {
          onError(...args)
        }

        maybeReset(resetOnError)
      },
      ...options,
    }

    $form.transform(() => transform(_data)).submit(_method, url, submitOptions)
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    submit()
  }

  export function reset(...fields: string[]) {
    resetFormFields(formElement, defaultData, fields)
  }

  export function clearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)
  }

  export function resetAndClearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)
    reset(...fields)
  }

  export function setError(field: string | object, value?: string) {
    if (typeof field === 'string') {
      // @ts-expect-error
      $form.setError(field, value)
    } else {
      $form.setError(field)
    }
  }

  export function defaults() {
    defaultData = getFormData()
    isDirty = false
  }

  onMount(() => {
    defaultData = getFormData()

    const formEvents = ['input', 'change', 'reset']
    formEvents.forEach((e) => formElement.addEventListener(e, updateDirtyState))

    return () => {
      formEvents.forEach((e) => formElement?.removeEventListener(e, updateDirtyState))
    }
  })
  $: slotErrors = $form.errors as Errors
</script>

<form
  bind:this={formElement}
  action={_action}
  method={_method}
  on:submit={handleSubmit}
  {...$$restProps}
  inert={disableWhileProcessing && $form.processing ? true : undefined}
>
  <slot
    errors={slotErrors}
    hasErrors={$form.hasErrors}
    processing={$form.processing}
    progress={$form.progress}
    wasSuccessful={$form.wasSuccessful}
    recentlySuccessful={$form.recentlySuccessful}
    {clearErrors}
    {resetAndClearErrors}
    {setError}
    {isDirty}
    {submit}
    {defaults}
  />
</form>
