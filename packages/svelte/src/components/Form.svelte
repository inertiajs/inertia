<script lang="ts">
  import {
    formDataToObject,
    FormComponentResetSymbol,
    resetFormFields,
    mergeDataIntoQueryString,
    type Errors,
    type FormComponentProps,
    type FormComponentRef,
    type FormComponentSlotProps,
    type Method,
    type FormDataConvertible,
    type VisitOptions,
    isUrlMethodPair,
    UseFormUtils,
  } from '@inertiajs/core'
  import { type NamedInputEvent, type ValidationConfig, type Validator } from 'laravel-precognition'
  import { isEqual } from 'lodash-es'
  import { onMount } from 'svelte'
  import { setFormContext } from './formContext'
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
    validateFiles?: FormComponentProps['validateFiles']
    validationTimeout?: FormComponentProps['validationTimeout']
    optimistic?: FormComponentProps['optimistic']
    withAllErrors?: FormComponentProps['withAllErrors']
    children?: import('svelte').Snippet<[FormComponentSlotProps]>
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
    validateFiles = false,
    validationTimeout = 1500,
    optimistic,
    withAllErrors = false,
    children,
    ...rest
  }: Props = $props()

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
  type FormSubmitter = HTMLElement | null

  const getTransformedData = (): Record<string, FormDataConvertible> => {
    const [_url, data] = getUrlAndData()
    return transform!(data)
  }

  const form = useForm<Record<string, any>>({}).withPrecognition(
    () => _method,
    () => getUrlAndData()[0],
  )

  form.transform(getTransformedData)

  let formElement: HTMLFormElement = $state(null!)
  let isDirty = $state(false)
  let defaultData: FormData = new FormData()

  const _method = $derived(isUrlMethodPair(action) ? action.method : ((method ?? 'get').toLowerCase() as Method))
  const _action = $derived(isUrlMethodPair(action) ? action.url : (action as string))

  export function getFormData(submitter?: FormSubmitter): FormData {
    return new FormData(formElement, submitter)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  export function getData(submitter?: FormSubmitter): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData(submitter))
  }

  function getUrlAndData(submitter?: FormSubmitter): [string, Record<string, FormDataConvertible>] {
    return mergeDataIntoQueryString(_method, _action, getData(submitter), queryStringArrayFormat)
  }

  function updateDirtyState(event: Event) {
    if (event.type === 'reset' && (event as CustomEvent).detail?.[FormComponentResetSymbol]) {
      // When the form is reset programmatically, prevent native reset behavior
      event.preventDefault()
    }

    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData))
  }

  export function submit(submitter?: FormSubmitter) {
    const [url, data] = getUrlAndData(submitter)
    const formTarget = (submitter as HTMLButtonElement | HTMLInputElement | null)?.getAttribute('formtarget')

    if (formTarget === '_blank' && _method === 'get') {
      window.open(url, '_blank')
      return
    }

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
      optimistic: optimistic ? (pageProps) => optimistic(pageProps, data) : undefined,
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

    // We need transform because we can't override the default data with different keys (by design)
    form.transform(() => transform!(data)).submit(_method, url, submitOptions)

    // Reset the transformer back so the submitter is not used for future submissions
    form.transform(getTransformedData)
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    submit(event.submitter)
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

    form.reset(...fields)
  }

  export function clearErrors(...fields: string[]) {
    form.clearErrors(...fields)
  }

  export function resetAndClearErrors(...fields: string[]) {
    clearErrors(...fields)
    reset(...fields)
  }

  export function setError(fieldOrFields: string | Record<string, string>, maybeValue?: string) {
    form.setError((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors)
  }

  export function defaults() {
    defaultData = getFormData()
    isDirty = false
  }

  export function validate(field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) {
    return form.validate(...UseFormUtils.mergeHeadersForValidation(field, config, headers!))
  }

  export function valid(field: string) {
    return form.valid(field)
  }

  export function invalid(field: string) {
    return form.invalid(field)
  }

  export function touch(field: string | NamedInputEvent | string[], ...fields: string[]) {
    return form.touch(field, ...fields)
  }

  export function touched(field?: string) {
    return form.touched(field)
  }

  export function validator(): Validator {
    return form.validator()
  }

  onMount(() => {
    defaultData = getFormData()

    form.defaults(getData())

    const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

    formEvents.forEach((e) => formElement.addEventListener(e, updateDirtyState))

    return () => {
      formEvents.forEach((e) => formElement?.removeEventListener(e, updateDirtyState))
    }
  })

  $effect(() => {
    form.setValidationTimeout(validationTimeout!)

    if (validateFiles) {
      form.validateFiles()
    } else {
      form.withoutFileValidation()
    }

    if (withAllErrors) {
      form.withAllErrors()
    }
  })

  const slotErrors = $derived(form.errors as Errors)

  // Form context for child components
  function createFormContext(): FormComponentRef {
    return {
      errors: form.errors,
      hasErrors: form.hasErrors,
      processing: form.processing,
      progress: form.progress,
      wasSuccessful: form.wasSuccessful,
      recentlySuccessful: form.recentlySuccessful,
      isDirty,
      clearErrors,
      resetAndClearErrors,
      setError,
      reset,
      submit,
      defaults,
      getData,
      getFormData,
      // Precognition
      validator,
      validate,
      touch,
      validating: form.validating,
      valid,
      invalid,
      touched,
    }
  }

  let formContextStore = $state<FormComponentRef>(createFormContext())

  $effect(() => {
    Object.assign(formContextStore, createFormContext())
  })

  setFormContext(formContextStore)
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
    reset,
    getData,
    getFormData,
    validator,
    validate,
    touch,
    validating: form.validating,
    valid: form.valid,
    invalid: form.invalid,
    touched: form.touched,
  })}
</form>
