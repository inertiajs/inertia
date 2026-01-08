<script lang="ts">
  import {
    formDataToObject,
    InertiaFormResetEventSymbol,
    resetFormFields,
    mergeDataIntoQueryString,
    type Errors,
    type FormComponentProps,
    type Method,
    type FormDataConvertible,
    type VisitOptions,
    isUrlMethodPair,
    UseFormUtils,
  } from '@inertiajs/core'
  import { type NamedInputEvent, type ValidationConfig, type Validator } from 'laravel-precognition'
  import { isEqual } from 'lodash-es'
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
  export let validateFiles: FormComponentProps['validateFiles'] = false
  export let validationTimeout: FormComponentProps['validationTimeout'] = 1500
  export let withAllErrors: FormComponentProps['withAllErrors'] = false

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
  type FormSubmitter = HTMLElement | null

  const getTransformedData = (): Record<string, FormDataConvertible> => {
    const [_url, data] = getUrlAndData()
    return transform!(data)
  }

  const form = useForm<Record<string, any>>({})
    .withPrecognition(
      () => _method,
      () => getUrlAndData()[0],
    )
    .setValidationTimeout(validationTimeout!)

  if (validateFiles) {
    form.validateFiles()
  }

  if (withAllErrors) {
    form.withAllErrors()
  }

  form.transform(getTransformedData)

  let formElement: HTMLFormElement
  let isDirty = false
  let defaultData: FormData = new FormData()

  $: _method = isUrlMethodPair(action) ? action.method : ((method ?? 'get').toLowerCase() as Method)
  $: _action = isUrlMethodPair(action) ? action.url : (action as string)

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
    // Prevent Firefox's native reset behavior on internal reset events
    if (event.type === 'reset' && (event as CustomEvent).detail?.[InertiaFormResetEventSymbol]) {
      event.preventDefault()
    }

    // If the form is reset, we set isDirty to false as we already know it's back
    // to defaults. Also, the fields are updated after the reset event, so the
    // comparison will be incorrect unless we use nextTick/setTimeout.
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData))
  }

  export function submit(submitter?: FormSubmitter) {
    const [url, data] = getUrlAndData(submitter)

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

    // We need transform because we can't override the default data with different keys (by design)
    $form.transform(() => transform!(data)).submit(_method, url, submitOptions)

    // Reset the transformer back so the submitter is not used for future submissions
    $form.transform(getTransformedData)
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
    $form.clearErrors(...fields)
  }

  export function resetAndClearErrors(...fields: string[]) {
    clearErrors(...fields)
    reset(...fields)
  }

  export function setError(fieldOrFields: string | Record<string, string>, maybeValue?: string) {
    $form.setError((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors)
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

  $: {
    form.setValidationTimeout(validationTimeout!)

    if (validateFiles) {
      form.validateFiles()
    } else {
      form.withoutFileValidation()
    }
  }

  $: slotErrors = $form.errors as Errors
</script>

<form
  bind:this={formElement}
  action={_action}
  method={_method}
  on:submit={handleSubmit}
  on:reset={handleReset}
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
    {reset}
    {getData}
    {getFormData}
    {validator}
    {validate}
    {touch}
    validating={$form.validating}
    valid={$form.valid}
    invalid={$form.invalid}
    touched={$form.touched}
  />
</form>
