<script lang="ts">
  import {
    formDataToObject,
    mergeDataIntoQueryString,
    type FormDataConvertible,
    type FormComponentOptions,
    type Method,
    type PendingVisit,
    type Progress,
    type VisitOptions,
  } from '@inertiajs/core'
  import { isEqual } from 'es-toolkit'
  import { onMount } from 'svelte'
  import useForm from '../useForm'

  export let action: string | { url: string; method: Method }
  export let method: Method = 'get'
  export let headers: Record<string, string> = {}
  export let queryStringArrayFormat: 'brackets' | 'indices' = 'brackets'
  export let errorBag: string | null = null
  export let showProgress: boolean = true
  export let transform: (data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible> = (data) =>
    data
  export let options: FormComponentOptions = {}
  export let onCancelToken: ({ cancel }: { cancel: () => void }) => void = () => {}
  export let onBefore: () => boolean | void = () => {}
  export let onStart: (visit: PendingVisit) => void = () => {}
  export let onProgress: (progress: Progress | undefined) => void = () => {}
  export let onFinish: (visit: PendingVisit) => void = () => {}
  export let onCancel: () => void = () => {}
  export let onSuccess: () => void = () => {}
  export let onError: () => void = () => {}

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement
  let isDirty = false
  let defaultValues: Record<string, FormDataConvertible> = {}

  $: _method = typeof action === 'object' ? action.method : (method.toLowerCase() as Method)
  $: _action = typeof action === 'object' ? action.url : action

  function getData(): Record<string, FormDataConvertible> {
    return formDataToObject(new FormData(formElement))
  }

  function updateDirtyState(event: Event) {
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), defaultValues)
  }

  function submit() {
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

  function reset() {
    formElement.reset()
  }

  function clearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)
  }

  function resetAndClearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.resetAndClearErrors(...fields)
  }

  function setError(field: string | object, value?: string) {
    if (typeof field === 'string') {
      // @ts-expect-error
      $form.setError(field, value)
    } else {
      // @ts-expect-error
      $form.setError(field)
    }
  }

  onMount(() => {
    defaultValues = getData()

    const formEvents = ['input', 'change', 'reset']
    formEvents.forEach((e) => formElement.addEventListener(e, updateDirtyState))

    return () => {
      formEvents.forEach((e) => formElement?.removeEventListener(e, updateDirtyState))
    }
  })
</script>

<form
  bind:this={formElement}
  action={_action}
  method={_method}
  on:submit={handleSubmit} {...$$restProps}
>
  <slot
    errors={$form.errors}
    hasErrors={$form.hasErrors}
    processing={$form.processing}
    progress={$form.progress}
    wasSuccessful={$form.wasSuccessful}
    recentlySuccessful={$form.recentlySuccessful}
    {clearErrors}
    {resetAndClearErrors}
    {setError}
    {isDirty}
    {reset}
    {submit}
  />
</form>
