<script lang="ts">
  import {
    formDataToObject,
    resetFormFields,
    mergeDataIntoQueryString,
    type Errors,
    type FormComponentProps,
    type Method,
    type FormDataConvertible,
    type VisitOptions,
    isUrlMethodPair,
  } from '@inertiajs/core'
  import { isEqual } from 'lodash-es'
  import { onMount } from 'svelte'
  import useForm from '../useForm.svelte'

  const noop = () => undefined

  interface Props {
    action?: FormComponentProps['action']
    method?: FormComponentProps['method']
    headers?: FormComponentProps['headers']
    queryStringArrayFormat?: FormComponentProps['queryStringArrayFormat']
    errorBag?: FormComponentProps['errorBag']
    showProgress?: FormComponentProps['showProgress']
    transform?: FormComponentProps['transform']
    options?: FormComponentProps['options']
    onCancelToken?: FormComponentProps['onCancelToken']
    onBefore?: FormComponentProps['onBefore']
    onStart?: FormComponentProps['onStart']
    onProgress?: FormComponentProps['onProgress']
    onFinish?: FormComponentProps['onFinish']
    onCancel?: FormComponentProps['onCancel']
    onSuccess?: FormComponentProps['onSuccess']
    onError?: FormComponentProps['onError']
    onSubmitComplete?: FormComponentProps['onSubmitComplete']
    disableWhileProcessing?: boolean
    invalidateCacheTags?: FormComponentProps['invalidateCacheTags']
    resetOnError?: FormComponentProps['resetOnError']
    resetOnSuccess?: FormComponentProps['resetOnSuccess']
    setDefaultsOnSuccess?: FormComponentProps['setDefaultsOnSuccess']
    children?: import('svelte').Snippet<[any]>
    [key: string]: any
  }

  let {
    action = $bindable(''),
    method = 'get',
    headers = {},
    queryStringArrayFormat = 'brackets',
    errorBag = null,
    showProgress = true,
    transform = (data) => data,
    options = {},
    onCancelToken = noop,
    onBefore = noop,
    onStart = noop,
    onProgress = noop,
    onFinish = noop,
    onCancel = noop,
    onSuccess = noop,
    onError = noop,
    onSubmitComplete = noop,
    disableWhileProcessing = false,
    invalidateCacheTags = [],
    resetOnError = false,
    resetOnSuccess = false,
    setDefaultsOnSuccess = false,
    children,
    ...rest
  }: Props = $props()

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement = $state(null!)
  let isDirty = $state(false)
  let defaultData: FormData = new FormData()

  const _method = $derived(isUrlMethodPair(action) ? action.method : ((method ?? 'get').toLowerCase() as Method))
  const _action = $derived(isUrlMethodPair(action) ? action.url : (action as string))

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
      queryStringArrayFormat,
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

    form.transform(() => transform!(_data)).submit(_method, url, submitOptions)
  }

  function handleSubmit(event: Event) {
    event.preventDefault()
    submit()
  }

  function handleReset(event: Event) {
    // Only intercept native reset events (from reset buttons/inputs)
    if (event.isTrusted) {
      event.preventDefault()
      reset()
    }
  }

  export function reset(...fields: string[]) {
    resetFormFields(formElement, defaultData, fields)
  }

  export function clearErrors(...fields: string[]) {
    // @ts-expect-error
    form.clearErrors(...fields)
  }

  export function resetAndClearErrors(...fields: string[]) {
    // @ts-expect-error
    form.clearErrors(...fields)
    reset(...fields)
  }

  export function setError(field: string | object, value?: string) {
    if (typeof field === 'string') {
      // @ts-expect-error
      form.setError(field, value)
    } else {
      form.setError(field)
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
  const slotErrors = $derived(form.errors as Errors)
</script>

{/* @ts-expect-error method type does not match here*/ null}
<form
  bind:this={formElement}
  action={_action}
  method={_method}
  onsubmit={handleSubmit}
  onreset={handleReset}
  {...rest}
  inert={disableWhileProcessing && form.processing ? true : undefined}
>
  {@render children?.({
    errors: slotErrors,
    hasErrors: form.hasErrors,
    processing: form.processing,
    progress: form.progress,
    wasSuccessful: form.wasSuccessful,
    recentlySuccessful: form.recentlySuccessful,
    clearErrors,
    resetAndClearErrors,
    setError,
    isDirty,
    submit,
    defaults,
    getData,
    getFormData,
  })}
</form>
