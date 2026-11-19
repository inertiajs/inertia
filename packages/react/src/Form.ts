import {
  config,
  FormComponentProps,
  FormComponentRef,
  FormComponentResetSymbol,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  Method,
  resetFormFields,
  resolveUrlMethodPairComponent,
  UseFormUtils,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { NamedInputEvent, ValidationConfig } from 'laravel-precognition'
import React, {
  ChangeEvent,
  createContext,
  createElement,
  FormEvent,
  forwardRef,
  ReactNode,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import useForm from './useForm'

// Polyfill for startTransition to support React 16.9+
const deferStateUpdate = (callback: () => void) => {
  typeof React.startTransition === 'function' ? React.startTransition(callback) : setTimeout(callback, 0)
}

type FormProps<TForm extends object = Record<string, any>> = FormComponentProps<TForm> &
  Omit<React.FormHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'> &
  Omit<React.AllHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'> & {
    children: ReactNode | ((props: FormComponentSlotProps<TForm>) => ReactNode)
  }

type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
type FormSubmitter = HTMLElement | null

const noop = () => undefined

const FormContext = createContext<FormComponentRef | undefined>(undefined)

const Form = forwardRef<FormComponentRef, FormProps>(
  (
    {
      action = '',
      method = 'get',
      headers = {},
      queryStringArrayFormat = 'brackets',
      errorBag = null,
      showProgress = true,
      transform = (data) => data,
      optimistic,
      options = {},
      onStart = noop,
      onProgress = noop,
      onFinish = noop,
      onBefore = noop,
      onCancel = noop,
      onSuccess = noop,
      onError = noop,
      onHttpException = noop,
      onNetworkError = noop,
      onFlash = noop,
      onCancelToken = noop,
      onSubmitComplete = noop,
      disableWhileProcessing = false,
      cancelOnUnmount = false,
      resetOnError = false,
      resetOnSuccess = false,
      setDefaultsOnSuccess = false,
      invalidateCacheTags = [],
      validateFiles = false,
      validationTimeout = 1500,
      withAllErrors = null,
      component = null,
      instant = false,
      children,
      ...props
    },
    ref,
  ) => {
    const getTransformedData = (): Record<string, FormDataConvertible> => {
      const [_url, data] = getUrlAndData()
      return transform(data)
    }

    const form = useForm<Record<string, any>>({})
      .withPrecognition(
        () => resolvedMethod,
        () => getUrlAndData()[0],
      )
      .setValidationTimeout(validationTimeout)

    if (validateFiles) {
      form.validateFiles()
    }

    if (withAllErrors ?? config.get('form.withAllErrors')) {
      form.withAllErrors()
    }

    form.transform(getTransformedData)

    const formElement = useRef<HTMLFormElement>(undefined)

    const resolvedMethod = useMemo(() => {
      return isUrlMethodPair(action) ? action.method : (method.toLowerCase() as Method)
    }, [action, method])

    const resolvedComponent = useMemo(() => {
      if (component) {
        return component
      }

      if (instant && isUrlMethodPair(action)) {
        return resolveUrlMethodPairComponent(action)
      }

      return null
    }, [component, instant, action])

    const [isDirty, setIsDirty] = useState(false)
    const defaultData = useRef<FormData>(new FormData())

    const cancelOnUnmountRef = useRef(cancelOnUnmount)
    cancelOnUnmountRef.current = cancelOnUnmount

    const getFormData = (submitter?: FormSubmitter): FormData =>
      formElement.current ? new FormData(formElement.current, submitter) : new FormData()

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (submitter?: FormSubmitter): Record<string, FormDataConvertible> =>
      formDataToObject(getFormData(submitter))

    const getUrlAndData = (submitter?: FormSubmitter): [string, Record<string, FormDataConvertible>] => {
      return mergeDataIntoQueryString(
        resolvedMethod,
        isUrlMethodPair(action) ? action.url : action,
        getData(submitter),
        queryStringArrayFormat,
      )
    }

    const updateDirtyState = (event?: Event) => {
      const isReset = event?.type === 'reset'

      if (isReset && (event as CustomEvent).detail?.[FormComponentResetSymbol]) {
        // When the form is reset programmatically, prevent native reset behavior
        event.preventDefault()
      }

      deferStateUpdate(() => setIsDirty(isReset ? false : !isEqual(getData(), formDataToObject(defaultData.current))))
    }

    const clearErrors = (...names: string[]) => {
      form.clearErrors(...names)

      return form
    }

    useEffect(() => {
      const element = formElement.current!
      defaultData.current = getFormData()

      form.setDefaults(getData())

      const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

      formEvents.forEach((e) => element.addEventListener(e, updateDirtyState))

      // Hidden inputs do not dispatch input or change events when changed or replaced.
      const hiddenInput = 'input[type="hidden"][name]'
      const observer = new MutationObserver((mutations) => {
        const hasHiddenInputChanges = mutations.some(({ type, target, addedNodes, removedNodes }) => {
          if (type === 'attributes') {
            return target instanceof HTMLInputElement && target.form === element && target.matches(hiddenInput)
          }

          return [...addedNodes, ...removedNodes].some(
            (node) => node instanceof Element && (node.matches(hiddenInput) || node.querySelector(hiddenInput)),
          )
        })

        if (hasHiddenInputChanges) {
          updateDirtyState()
        }
      })
      observer.observe(element, { attributes: true, attributeFilter: ['value'], childList: true, subtree: true })

      return () => {
        observer.disconnect()
        formEvents.forEach((e) => element.removeEventListener(e, updateDirtyState))

        if (cancelOnUnmountRef.current) {
          form.cancel()
        }
      }
    }, [])

    useEffect(() => {
      form.setValidationTimeout(validationTimeout)
    }, [validationTimeout])

    useEffect(() => {
      if (validateFiles) {
        form.validateFiles()
      } else {
        form.withoutFileValidation()
      }
    }, [validateFiles])

    const reset = (...fields: string[]) => {
      if (formElement.current) {
        resetFormFields(formElement.current, defaultData.current, fields)
      }

      form.reset(...fields)
    }

    const resetAndClearErrors = (...fields: string[]) => {
      clearErrors(...fields)
      reset(...fields)
    }

    const maybeReset = (resetOption: boolean | string[]) => {
      if (!resetOption) {
        return
      }

      if (resetOption === true) {
        reset()
      } else if (resetOption.length > 0) {
        reset(...resetOption)
      }
    }

    const submit = (submitter?: FormSubmitter) => {
      const [url, data] = getUrlAndData(submitter)
      const formTarget = (submitter as HTMLButtonElement | HTMLInputElement | null)?.getAttribute('formtarget')

      if (formTarget === '_blank' && resolvedMethod === 'get') {
        window.open(url, '_blank')
        return
      }

      const submitOptions: FormSubmitOptions = {
        headers,
        queryStringArrayFormat,
        errorBag,
        showProgress,
        invalidateCacheTags,
        component: resolvedComponent,
        optimistic: optimistic ? (pageProps) => optimistic(pageProps, data) : undefined,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onHttpException,
        onNetworkError,
        onFlash,
        onSuccess: async (...args) => {
          const result = await onSuccess(...args)
          onSubmitComplete({
            reset,
            defaults,
          })
          maybeReset(resetOnSuccess)

          if (setDefaultsOnSuccess === true) {
            defaults()
          }

          return result
        },
        onError(...args) {
          onError(...args)
          maybeReset(resetOnError)
        },
        ...options,
      }

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => transform(data))
      form.submit(resolvedMethod, url, submitOptions)

      // Reset the transformer back so the submitter is not used for future submissions
      form.transform(getTransformedData)
    }

    const defaults = () => {
      defaultData.current = getFormData()
      setIsDirty(false)
    }

    const exposed: FormComponentSlotProps = {
      errors: form.errors,
      hasErrors: form.hasErrors,
      processing: form.processing,
      progress: form.progress,
      wasSuccessful: form.wasSuccessful,
      recentlySuccessful: form.recentlySuccessful,
      isDirty,
      clearErrors,
      resetAndClearErrors,
      setError: form.setError,
      reset,
      submit,
      cancel: form.cancel,
      defaults,
      getData,
      getFormData,

      // Precognition
      validator: () => form.validator(),
      validating: form.validating,
      valid: form.valid,
      invalid: form.invalid,
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) =>
        form.validate(...UseFormUtils.mergeHeadersForValidation(field, config, headers)),
      touch: form.touch,
      touched: form.touched,
    }

    useImperativeHandle(ref, () => exposed, [form, isDirty, submit])

    const formNode = createElement(
      'form',
      {
        ...props,
        ref: formElement,
        action: isUrlMethodPair(action) ? action.url : action,
        method: resolvedMethod,
        onChange: (event: ChangeEvent<HTMLFormElement>) => {
          props.onChange?.(event)

          // React can detect a checkbox change from a plain click event that does not trigger native input or change.
          const { nativeEvent } = event
          const { target } = nativeEvent
          if (
            nativeEvent.type === 'click' &&
            !(nativeEvent instanceof MouseEvent) &&
            target instanceof HTMLInputElement &&
            target.form === event.currentTarget
          ) {
            updateDirtyState()
          }
        },
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          submit((event.nativeEvent as SubmitEvent).submitter)
        },
        inert: disableWhileProcessing && form.processing,
      },
      typeof children === 'function' ? children(exposed) : children,
    )

    return createElement(FormContext.Provider, { value: exposed }, formNode)
  },
)

Form.displayName = 'InertiaForm'

export function useFormContext<TForm extends object = Record<string, any>>(): FormComponentRef<TForm> | undefined {
  return use(FormContext) as FormComponentRef<TForm> | undefined
}

export default Form as {
  <TForm extends object = Record<string, any>>(
    props: FormProps<TForm> & React.RefAttributes<FormComponentRef<TForm>>,
  ): React.ReactElement
  displayName: string
}
