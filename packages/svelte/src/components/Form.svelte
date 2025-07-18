<script lang="ts">
  import {
    formDataToObject,
    mergeDataIntoQueryString,
    type FormDataConvertible,
    type Method,
    type PendingVisit,
    type PreserveStateOption,
    type Progress,
    type VisitOptions,
  } from '@inertiajs/core'
  import { isEqual } from 'es-toolkit'
  import { onMount } from 'svelte'
  import useForm from '../useForm'

  interface InertiaFormSubmitProps {
    preserveScroll?: PreserveStateOption
    preserveState?: PreserveStateOption
    preserveUrl?: boolean
    replace?: boolean
    only?: string[]
    except?: string[]
    reset?: string[]
  }

  export let action: string | { url: string; method: Method }
  export let method: Method = 'get'
  export let headers: Record<string, string> = {}
  export let queryStringArrayFormat: 'brackets' | 'indices' = 'brackets'
  export let errorBag: string | null = null
  export let showProgress: boolean = true
  export let transform: (data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible> = (data) =>
    data
  export let submitOptions: InertiaFormSubmitProps = {
    replace: false,
    preserveScroll: false,
    preserveState: null,
    preserveUrl: false,
    only: [],
    except: [],
    reset: [],
  }
  export let onCancelToken: (cancelToken: import('axios').CancelTokenSource) => void = () => {}
  export let onBefore: () => boolean | void = () => {}
  export let onStart: (visit: PendingVisit) => void = () => {}
  export let onProgress: (progress: Progress) => void = () => {}
  export let onFinish: (visit: PendingVisit) => void = () => {}
  export let onCancel: () => void = () => {}
  export let onSuccess: () => void = () => {}
  export let onError: () => void = () => {}

  type FormOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

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
    const [url, _data] = mergeDataIntoQueryString(
      _method,
      _action,
      getData(),
      queryStringArrayFormat,
    )

    const options: FormOptions = {
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
      replace: submitOptions.replace,
      preserveScroll: submitOptions.preserveScroll,
      preserveState: submitOptions.preserveState ?? _method !== 'get',
      preserveUrl: submitOptions.preserveUrl,
      only: submitOptions.only || [],
      except: submitOptions.except || [],
      reset: submitOptions.reset || [],
    }

    $form.transform(() => transform(_data)).submit(_method, url, options)
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    submit()
  }

  function reset() {
    formElement.reset()
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
  on:submit={handleSubmit}
  {...$$restProps}
>
  <slot
    errors={$form.errors}
    hasErrors={$form.hasErrors}
    processing={$form.processing}
    progress={$form.progress}
    wasSuccessful={$form.wasSuccessful}
    recentlySuccessful={$form.recentlySuccessful}
    clearErrors={(...fields) => {
      $form.clearErrors(...fields)
    }}
    resetAndClearErrors={(...fields) => {
      $form.resetAndClearErrors(...fields)
    }}
    setError={(field, value) => {
      if (typeof field === 'string') {
        $form.setError(field, value)
      } else {
        $form.setError(field)
      }
    }}
    {isDirty}
    {reset}
    {submit}
  />
</form>
