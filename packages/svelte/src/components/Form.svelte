<script lang="ts">
  import {
    formDataToObject,
    resetFormFields,
    mergeDataIntoQueryString,
    type Errors,
    type FormComponentProps,
    type FormDataConvertible,
    type FormComponentValidateOptions,
    type VisitOptions,
    isUrlMethodPair,
    usePrecognition,
  } from '@inertiajs/core'
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
  export let validateTimeout: FormComponentProps['validateTimeout'] = 1500

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement
  let isDirty = false
  let defaultData: FormData = new FormData()

  let validating = false
  let validated: string[] = []
  let touched: string[] = []

  const validator = usePrecognition({
    onStart: () => {
      validating = true
    },
    onFinish: () => {
      validating = false
    },
  })

  $: _method = isUrlMethodPair(action) ? action.method : (method.toLowerCase() as FormComponentProps['method'])
  $: _action = isUrlMethodPair(action) ? action.url : action

  function getFormData(): FormData {
    return new FormData(formElement)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  function getData(): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData())
  }

  function getUrlAndData(): [string, Record<string, FormDataConvertible>] {
    return mergeDataIntoQueryString(_method, _action, getData(), queryStringArrayFormat)
  }

  function updateDirtyState(event: Event) {
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData))
  }

  export function submit() {
    const [url, _data] = getUrlAndData()

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

  function handleReset(event: Event) {
    // Only intercept native reset events (from reset buttons/inputs)
    if (event.isTrusted) {
      event.preventDefault()
      reset()
    }
  }

  function updateDataOnValidator() {
    try {
      // This might fail if the component is already unmounted but this function
      // is called after navigating away after a form submission.
      const data = getData()
      validator.setOldData(data)
    } catch {}
  }

  export function reset(...fields: string[]) {
    resetFormFields(formElement, defaultData, fields)
    updateDataOnValidator()

    if (fields.length === 0) {
      touched = []
    } else {
      touched = touched.filter((field) => !fields.includes(field))
    }
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

  export function validate(
    only?: string | string[] | FormComponentValidateOptions,
    maybeOptions?: FormComponentValidateOptions,
  ) {
    let fields: string[]
    let options: FormComponentValidateOptions = {}

    if (typeof only === 'object' && !Array.isArray(only)) {
      // Called as validate({ only: [...], onSuccess, onError, onFinish })
      const onlyFields = only.only
      fields = onlyFields === undefined ? touched : Array.isArray(onlyFields) ? onlyFields : [onlyFields]
      options = only
    } else {
      // Called as validate('field') or validate(['field1', 'field2']) or validate('field', {options})
      fields = only === undefined ? touched : Array.isArray(only) ? only : [only]
      options = maybeOptions || {}
    }

    // We're not using the data object from this method as it might be empty
    // on GET requests, and we still want to pass a data object to the
    // validator so it knows the current state of the form.
    const [url] = getUrlAndData()

    validator.validate({
      url,
      method: _method,
      data: transform(getData()),
      only: fields,
      errorBag,
      onPrecognitionSuccess: () => {
        validated = [...validated, ...fields]
        clearErrors(...fields)
        options.onSuccess?.()
      },
      onValidationError: (errors) => {
        validated = [...validated, ...fields]

        const validFields = fields.filter((field) => errors[field] === undefined)

        if (validFields.length) {
          clearErrors(...validFields)
        }

        // Merge current errors with new errors
        const mergedErrors = { ...$form.errors, ...errors }
        setError(mergedErrors)
        options.onError?.(errors)
      },
      onFinish: () => {
        options.onFinish?.()
      },
    })
  }

  export function touch(field: string | string[]) {
    const fields = Array.isArray(field) ? field : [field]

    // Use Set to avoid duplicates
    touched = [...new Set([...touched, ...fields])]
  }

  export function valid(field: string): boolean {
    return validated.includes(field) && $form.errors[field] === undefined
  }

  export function invalid(field: string): boolean {
    return $form.errors[field] !== undefined
  }

  export function setValidationTimeout(duration: number) {
    validator.setTimeout(duration)
  }

  export function validateFilesEnabled() {
    validator.validateFiles(true)
  }

  onMount(() => {
    defaultData = getFormData()

    const formEvents = ['input', 'change', 'reset']
    formEvents.forEach((e) => formElement.addEventListener(e, updateDirtyState))

    updateDataOnValidator()
    validator.validateFiles(validateFiles)
    validator.setTimeout(validateTimeout)

    return () => {
      formEvents.forEach((e) => formElement?.removeEventListener(e, updateDirtyState))
    }
  })

  $: validator.validateFiles(validateFiles)
  $: validator.setTimeout(validateTimeout)

  $: slotErrors = $form.errors as Errors

  // Create reactive slot props that update when state changes
  $: slotValid = (field: string) => validated.includes(field) && slotErrors[field] === undefined
  $: slotInvalid = (field: string) => slotErrors[field] !== undefined
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
    {validating}
    {validate}
    {touch}
    valid={slotValid}
    invalid={slotInvalid}
    {setValidationTimeout}
    {validateFilesEnabled}
  />
</form>
