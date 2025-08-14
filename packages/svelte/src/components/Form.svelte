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
  export let disableWhileProcessing: boolean = false

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement
  let isDirty = false
  let defaults: FormData = new FormData()

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
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaults))
  }

  export function submit() {
    const [url, _data] = mergeDataIntoQueryString(_method, _action, getData(), queryStringArrayFormat)

    const submitOptions: FormSubmitOptions = {
      headers,
      errorBag,
      showProgress,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      ...options,
    }

    $form.transform(() => transform(_data)).submit(_method, url, submitOptions)
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    submit()
  }

  export function reset(...fields: string[]) {
    if (fields.length === 0) {
      // Svelte doesn't set the default values correctly in the DOM
      // See: https://github.com/sveltejs/svelte/issues/9230
      fields = [...defaults.keys()]
    }

    resetFormFields(formElement, defaults, fields)
  }

  export function clearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)
  }

  export function resetAndClearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)
    reset(fields)
  }

  export function setError(field: string | object, value?: string) {
    if (typeof field === 'string') {
      // @ts-expect-error
      $form.setError(field, value)
    } else {
      // @ts-expect-error
      $form.setError(field)
    }
  }

  onMount(() => {
    defaults = getFormData()

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
  on:submit={handleSubmit} {...$$restProps}
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
  />
</form>
