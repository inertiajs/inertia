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
  import {
    createValidator,
    toSimpleValidationErrors,
    type NamedInputEvent,
    type ValidationConfig,
    type Validator,
  } from 'laravel-precognition'
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
  export let simpleValidationErrors: FormComponentProps['simpleValidationErrors'] = true

  type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

  const form = useForm({})
  let formElement: HTMLFormElement
  let isDirty = false
  let defaultData: FormData = new FormData()

  let validating = false
  let validFields: string[] = []
  let touchedFields: string[] = []
  let validator: Validator | null = null

  $: _method = isUrlMethodPair(action) ? action.method : ((method ?? 'get').toLowerCase() as Method)
  $: _action = isUrlMethodPair(action) ? action.url : (action as string)

  export function getFormData(): FormData {
    return new FormData(formElement)
  }

  // Convert the FormData to an object because we can't compare two FormData
  // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
  // expects an object, and submitting a FormData instance directly causes problems with nested objects.
  export function getData(): Record<string, FormDataConvertible> {
    return formDataToObject(getFormData())
  }

  function getUrlAndData(): [string, Record<string, FormDataConvertible>] {
    return mergeDataIntoQueryString(_method, _action, getData(), queryStringArrayFormat)
  }

  function updateDirtyState(event: Event) {
    isDirty = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData))
  }

  function getTransformedData(): Record<string, FormDataConvertible> {
    const [_url, data] = getUrlAndData()
    return transform!(data)
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

    $form.transform(() => transform!(_data)).submit(_method, url, submitOptions)
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

    if (validator) {
      validator.reset(...fields)
    }
  }

  export function clearErrors(...fields: string[]) {
    // @ts-expect-error
    $form.clearErrors(...fields)

    if (validator) {
      if (fields.length === 0) {
        validator.setErrors({})
      } else {
        fields.forEach(validator.forgetError)
      }
    }
  }

  export function resetAndClearErrors(...fields: string[]) {
    clearErrors(...fields)
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
    input?: string | NamedInputEvent | ValidationConfig,
    value?: unknown,
    config?: ValidationConfig,
  ) {
    if (validator) {
      return validator.validate(input, value, config)
    }
  }

  export function touch(...fields: string[]) {
    if (validator) {
      validator.touch(fields)
    }
  }

  export function touched(field?: string): boolean {
    if (typeof field === 'string') {
      return touchedFields.includes(field)
    }

    return touchedFields.length > 0
  }

  export function valid(field: string): boolean {
    return validFields.includes(field)
  }

  export function invalid(field: string): boolean {
    return $form.errors[field] !== undefined
  }

  onMount(() => {
    defaultData = getFormData()

    const formEvents = ['input', 'change', 'reset']
    formEvents.forEach((e) => formElement.addEventListener(e, updateDirtyState))

    // Initialize validator
    validator = createValidator(
      (client) =>
        client[_method!](getUrlAndData()[0], getTransformedData(), {
          headers,
        }),
      getTransformedData(),
    )
      .on('validatingChanged', () => {
        validating = validator!.validating()
      })
      .on('validatedChanged', () => {
        validFields = validator!.valid()
      })
      .on('touchedChanged', () => {
        touchedFields = validator!.touched()
      })
      .on('errorsChanged', () => {
        // Clear form errors first
        $form.clearErrors()

        // Set new errors
        const errors = simpleValidationErrors ? toSimpleValidationErrors(validator!.errors()) : validator!.errors()

        $form.setError(errors as Errors)
        validFields = validator!.valid()
      })

    validator.setTimeout(validateTimeout!)

    if (validateFiles) {
      validator.validateFiles()
    }

    return () => {
      formEvents.forEach((e) => formElement?.removeEventListener(e, updateDirtyState))
    }
  })

  $: {
    if (validator) {
      validator.setTimeout(validateTimeout!)
    }
  }

  $: slotErrors = $form.errors as Errors

  // Create reactive slot props that update when state changes
  $: validMethod = (field: string) => validFields.includes(field)
  $: invalidMethod = (field: string) => slotErrors[field] !== undefined
  $: touchedMethod = (field?: string) =>
    typeof field === 'string' ? touchedFields.includes(field) : touchedFields.length > 0
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
    {validating}
    {validate}
    {touch}
    touched={touchedMethod}
    valid={validMethod}
    invalid={invalidMethod}
  />
</form>
